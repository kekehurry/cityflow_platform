from .core import query

def get_graph_overview():
    cypher="""
    MATCH ()-[l]-()
    WITH l
    LIMIT 1000
    WITH startNode(l) AS m, endNode(l) AS n, l
    WHERE NOT (labels(m)[0] = 'Module' AND m.custom = "false") 
    AND NOT (labels(n)[0] = 'Module' AND n.custom = "false")
    AND NOT (labels(m)[0] = 'Workflow' AND m.basic = "true")
    AND NOT (labels(n)[0] = 'Workflow' AND n.basic = "true")
    AND id(m) <> id(n)
    WITH 
        COLLECT(DISTINCT {
            id: m.id, 
            name: m.name, 
            type: labels(m)[0],
            value: SIZE([(m)-[r]-() | r])
        }) + 
        COLLECT(DISTINCT {
            id: n.id, 
            name: n.name, 
            type: labels(n)[0],
            value: SIZE([(n)-[r]-() | r])
        }) AS allNodes,
        COLLECT(DISTINCT {
            source: m.id, 
            target: n.id, 
            type: type(l)
        }) AS links
    UNWIND allNodes AS node
    WITH DISTINCT node.id AS id, node.name AS name, node.type AS type, node.value AS value, links
    WITH COLLECT({id: id, name: name, type: type, value: value, nodeId: id}) AS nodes, links
    RETURN nodes, links
    """
    result = query(cypher)
    return result