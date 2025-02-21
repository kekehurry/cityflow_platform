
from .core import query, write, get_node_by_id
from .processor import get_workflow
from .llm import get_embedding
import json
from hashlib import md5
import os

admin_passkey = os.environ.get('NEO4J_AUTH','neo4j/neo4jgraph')
admin_id = md5(admin_passkey.encode()).hexdigest()

def create_fulltext_index():
    cypher = '''
        CREATE FULLTEXT INDEX fulltextIndex FOR (n:Workflow|Module|Author) 
        ON EACH [n.name, n.description, n.code, n.city, n.tag]
    '''
    return write(cypher)


def create_workflow_vector_index():
    cypher = """
    CREATE VECTOR INDEX workflowVectorIndex IF NOT EXISTS
    FOR (n:Workflow) 
    ON n.embeddings
    OPTIONS { indexConfig: {
    `vector.dimensions`: 2048,
    `vector.similarity_function`: 'cosine'
    }}
    """
    return write(cypher)


def create_module_vector_index():
    cypher = """
    CREATE VECTOR INDEX moduleVectorIndex IF NOT EXISTS
    FOR (n:Module) 
    ON n.embeddings
    OPTIONS { indexConfig: {
    `vector.dimensions`: 2048,
    `vector.similarity_function`: 'cosine'
    }}
    """
    return write(cypher)



def get_sub_graph(nodeIds):
    cypher = f'''
        MATCH (n)-[l]-()
        WHERE n.id IN {json.dumps(nodeIds)}
        WITH startNode(l) as m1, endNode(l) as m2, l
        WHERE NOT ((labels(m1)[0] <> "Author" AND m1.author = '"admin"') OR (labels(m2)[0] <> "Author" AND  m2.author = '"admin"'))
        WITH 
        COLLECT( DISTINCT{{
            id: m1.hash,
            flow_id: m1.id,
            name: m1.name, 
            type: labels(m1)[0],
            description: m1.description
        }}) + 
        COLLECT( DISTINCT{{
            id: m2.hash,
            name: m2.name, 
            flow_id: m2.id,
            type: labels(m2)[0],
            description: m2.description
        }})
        AS nodes,
        COLLECT( DISTINCT{{
            source: m1.hash, 
            target: m2.hash, 
            type: type(l)
        }}) + 
        COLLECT({{
            source: m2.hash, 
            target: m1.hash, 
            type: type(l)
        }})
        AS links,
        COLLECT( DISTINCT{{
            id: m1.hash, 
            nodeId: m1.id,
            value: size([(m1)-[r]-() | r])
        }}) + 
        COLLECT( DISTINCT{{
            id: m2.hash, 
            nodeId: m2.id,
            value: size([(m2)-[r]-() | r])
        }})
        AS values
        RETURN nodes, links, values
    '''
    result = query(cypher)
    value_map = {node['id']:node['value'] for node in result['values']}
    hash_map = {node['id']:node['nodeId'] for node in result['values']}
    nodes = set()
    links = set()
    for node in result['nodes']:
        node['value'] = value_map[node['id']]
        node['nodeId'] = hash_map[node['id']]
        if admin_id not in node['nodeId']:
            nodes.add(tuple(node.items()))

    for link in result['links']:
        source = hash_map[link['source']]
        target = hash_map[link['target']]
        if (admin_id not in source) and (admin_id not in target):
            links.add(tuple(link.items()))

    result['nodes'] = [dict(node) for node in nodes]
    result['links'] = [dict(link) for link in links]
    return result


def fulltext_query(query_string, limit=20):
    if not query_string:
        return None
    cypher = f'''
        CALL db.index.fulltext.queryNodes("fulltextIndex", '{query_string}') YIELD node, score
        WITH node.id AS id, node.name AS name, labels(node)[0] AS label, score,node
        ORDER BY score DESC
        LIMIT {limit}
        RETURN 
        COLLECT(id) AS ids, 
        COLLECT(node) AS nodes, 
        COLLECT(label) AS labels,
        COLLECT(score) AS scores
    '''
    result = query(cypher)
    if result:
        nodes = []
        for node,label,score in zip(result['nodes'],result['labels'],result['scores']):
            node = {k:json.loads(v) for k,v in node.items() if k != 'embeddings'}
            node['label'] = label
            node['score'] = score
            nodes.append(node)
        ids = result['ids']
        sub_graph = get_sub_graph(result['ids'])
        return sub_graph,ids,nodes
    

def semantic_query(query_string, limit=20):
    vector = get_embedding(query_string)[0]
    cypher =f'''
    CALL db.index.vector.queryNodes($index,10,{vector}) YIELD node, score
    WHERE NOT (labels(node)[0] = 'Module' AND node.category = "basic") 
    WITH node.id AS id, node.name AS name, labels(node)[0] AS label,score,node
    ORDER BY score DESC
    LIMIT {limit}
    RETURN 
    COLLECT(id) AS ids, 
    COLLECT(node) AS nodes, 
    COLLECT(label) AS labels,
    COLLECT(score) AS scores
    '''
    nodes = []
    ids = []
    workflow_result = query(cypher,{"index":"workflowVectorIndex"})
    module_result = query(cypher,{"index":"moduleVectorIndex"})
    for result in [workflow_result,module_result]:
        if result:
            for id,node,label,score in zip(result['ids'],result['nodes'],result['labels'],result['scores']):
                node = {k:json.loads(v) for k,v in node.items() if k != 'embeddings'}
                node['label'] = label
                node['score'] = score
                nodes.append(node)
                ids.append(id)
    sub_graph = get_sub_graph(ids)
    nodes = sorted(nodes,key=lambda x:x['score'],reverse=True)
    return sub_graph,ids,nodes