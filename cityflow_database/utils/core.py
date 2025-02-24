from neo4j import GraphDatabase
import json
import os
from dotenv import load_dotenv
load_dotenv()

#Connect to Neo4j
neo4j_auth = os.getenv('NEO4J_AUTH')
uri =  os.getenv('BOLT_URL',f"bolt://localhost:7687")
username = neo4j_auth.split('/')[0]
password = neo4j_auth.split('/')[1]
driver = GraphDatabase.driver(uri, auth=(username, password))

def query(cypher,params={}):
    def _run_query(tx, cypher,params):
        result = tx.run(cypher,**params)
        return result.single()
    with driver.session() as session:
        result = session.execute_read(_run_query, cypher,params)
        if result:
            return result.data()
    
def write(cypher,params={}):
    def _run_query(tx, cypher,params):
        result = tx.run(cypher,**params)
        return result.single()
    with driver.session() as session:
        result = session.execute_write(_run_query, cypher,params)
        if result:
            return result.data()
        
def init_db():
    cypher = """
    MATCH (n) DETACH DELETE n
    """
    write(cypher)
    print('creating fulltex indexes...')

    #drop existing indexes
    cypher = '''
    DROP INDEX fulltextIndex IF EXISTS
    '''
    write(cypher)

    cypher = '''
    DROP INDEX moduleVectorIndex IF EXISTS
    '''
    write(cypher)

    cypher = '''
    DROP INDEX workflowVectorIndex IF EXISTS
    '''

    # create index
    cypher = '''
            CREATE FULLTEXT INDEX fulltextIndex IF NOT EXISTS
            FOR (n:Workflow|Module|Author) 
            ON EACH [n.name, n.description, n.code, n.city, n.tag]
    '''
    write(cypher)

    print('creating vector indexes...')

    # create index
    cypher = """
    CREATE VECTOR INDEX workflowVectorIndex IF NOT EXISTS
    FOR (n:Workflow) 
    ON n.embeddings
    OPTIONS { indexConfig: {
    `vector.dimensions`: 384,
    `vector.similarity_function`: 'cosine'
    }}
    """
    write(cypher)

    cypher = """
    CREATE VECTOR INDEX moduleVectorIndex IF NOT EXISTS
    FOR (n:Module) 
    ON n.embeddings
    OPTIONS { indexConfig: {
    `vector.dimensions`: 384,
    `vector.similarity_function`: 'cosine'
    }}
    """
    write(cypher)
    
    return print('Database initialized.')

# Node
def check_node_exists(id):
    cypher = "MATCH (n {id:$id}) RETURN n"
    node = query(cypher,params={'id':json.dumps(id)})
    return node


def get_node_by_id(id):
    cypher = f'''
    MATCH (n {{id:$id}}) 
    RETURN n
    '''
    params = {'id':json.dumps(id)}
    result = query(cypher,params)
    if result:
        node = result['n']
        node = {k:json.loads(v) for k,v in node.items() if k != 'embeddings'}
        return node

def get_node(label, id):
    cypher = f'''
            MATCH (n:{label} {{id:$id}}) 
            RETURN n
            '''
    params = {'id':json.dumps(id)}
    result = query(cypher,params)
    if result:
        node = result['n']
        node = {k:json.loads(v) for k,v in node.items() if k != 'embeddings'}
        return node

def add_node(label, props): 
    embeddings = props.get('embeddings',[])
    props = {k:json.dumps(v) for k,v in props.items() if k != 'embeddings'}
    props['embeddings'] = embeddings
    props_str = ', '.join([f'n.{key} = ${key}' for key in props.keys()])
    cypher = f"MERGE (n:{label} {{id: $id}}) SET {props_str}"
    return write(cypher,props)


def set_node(label, id, props):
    props_str = ', '.join([f'n.{key} = ${key}' for key in props.keys()])
    cypher = f"MATCH (n:{label} {{id:$id}}) SET {props_str}"
    params = {'id':json.dumps(id), **props}
    result = write(cypher,params)
    return result

def delete_node(label, id):
    cypher = f"MATCH (n:{label} {{id:$id}}) DETACH DELETE n"
    params = {'id':json.dumps(id)}  
    result = write(cypher,params)
    return result

def get_nodeId_by_hash(hash):
    cypher = f'''
    MATCH (n {{hash:$hash}}) 
    RETURN n.id AS id
    '''
    params = {'hash':json.dumps(hash)}
    result = query(cypher,params)
    if result:
        return result

# Link
def add_link(label, source, target, props=None):
    if props:
        props = {k:json.dumps(v) for k,v in props.items()}
        props_str = ', '.join([f'r.{key} = ${key}' for key in props.keys()])
        cypher = f'''
            MATCH (s {{id:$source}}), (t {{id:$target}})
            MERGE (s)-[r:{label}]->(t)
            SET {props_str}
            RETURN r
            '''
        params = {'source':json.dumps(source), 'target':json.dumps(target), **props}
    else:
        cypher = f'''
                MATCH (s {{id:$source}}), (t {{id:$target}})
                MERGE (s)-[r:{label}]->(t)
                RETURN r
                '''
        params = {'source':json.dumps(source), 'target':json.dumps(target)}
    result = write(cypher,params)
    return result