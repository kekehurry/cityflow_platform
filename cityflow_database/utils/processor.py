from .core import (
    query, 
    write, 
    get_node,
    add_node, 
    delete_node,
    set_node,
    add_link
)
from .llm import get_embedding  
from .util import base642file, delete_file
from hashlib import md5
import uuid
import json
import os

# Author
def get_author(id):
    return get_node('Author',id)

def search_authors(params,limit=25):
    params = {k:json.dumps(v) for k,v in params.items()}
    props = ', '.join([f'{key}:${key}' for key in params.keys()])
    cypher = f'''
                MATCH (a:Author {{{props}}}) 
                WITH a LIMIT {limit}
                RETURN collect(DISTINCT a) as authors
            '''
    result = query(cypher,params)
    if result:
        authors = result['authors']
        authors = [json.loads(a['id']) for a in authors]
        return authors

def add_author(props):
    props['hash'] = props['id']
    return add_node('Author',props)

def delete_author(id):
    cypher = f'''
                MATCH (w:Workflow)-[]-(a:Author {{id:$id}})
                DETACH DELETE w
                DETACH DELETE a
            '''
    params = {'id':json.dumps(id)}
    write(cypher,params)
    return write(cypher,params)


# Module
def get_module(id):
    return get_node('Module',id)

def get_module_info(id):
    node = get_node('Module',id)
    info_keys = ['name','description','author','icon','category']
    node_info = {k:node[k] for k in info_keys}
    node_info['id'] = id
    return node_info

def search_modules( params, limit=25):
    params = {k:json.dumps(v) for k,v in params.items()}
    props = ', '.join([f'{key}:${key}' for key in params.keys()])
    cypher = f'''
        MATCH (m:Module {{{props}}})
        WITH DISTINCT m.hash AS hash, head(collect(m)) AS module
        WITH module LIMIT {limit}
        WITH collect(module) AS modules
        RETURN  modules
        '''
    result = query(cypher,params)
    if result:
        modules = result['modules']
        modules = [json.loads(m['id']) for m in modules]
        return modules

def add_module(props):
    id = props.get('id')
    config = props['config']
    base = {k:v for k,v in props.items() if k != 'config'}
    if 'name' in config.keys():
        name = config['name']
    else:
        name = config['title']
    if 'code' in config.keys():
        code = json.dumps(config['code'])
    else:
        code = ''
    hash = md5(f"{name}/{code}".encode()).hexdigest()
    hash = name
    data = {**config,"base": base, "id":id, "hash":hash, "name": name}
    return add_node('Module', data)

def delete_module(id):
    module = get_module(id)
    if module:
        icon = module.get('icon')
        delete_file(icon)
        files = module.get('files',[])
        for file in files:
            delete_file(file['data'])
    return delete_node('Module',id)


# Workflow

def get_workflow(id):
    # workflow = get_node('Workflow',id)
    # nodes = []
    # for node in workflow['nodes']:
    #     module = get_module(node)
    #     base = module['base']
    #     config = {k:v for k,v in module.items() if k not in ['base']}
    #     nodes.append({**base, "config":config})
    # workflow['nodes'] = nodes
    cypher = '''
            MATCH (m:Module)-[p:part_of]-(workflow:Workflow {id:$id}) 
            RETURN workflow, collect(m) as modules
            '''
    params = {'id':json.dumps(id)}
    result = query(cypher,params)
    if result:
        workflow = result['workflow']
        workflow = {k:json.loads(v) for k,v in workflow.items() if k != 'embeddings'}
        nodes = []
        for module in result['modules']:
            base = json.loads(module['base'])
            config = {k:json.loads(v) for k,v in module.items() if k not in ['base','embeddings']}
            nodes.append({**base, "config":config})
        workflow['nodes'] = nodes
        return workflow

def get_workflow_info(id):
    cypher = '''
            MATCH (m:Module)-[p:part_of]-(workflow:Workflow {id:$id}) 
            RETURN workflow, collect(m) as modules
            '''
    params = {'id':json.dumps(id)}
    result = query(cypher,params)
    if result:
        workflow = result['workflow']
        workflow_info = {
            "name":json.loads(workflow['name']),
            "description":json.loads(workflow['description']),
            "author":json.loads(workflow['author']),
            "city":json.loads(workflow['city']),
            "tag":json.loads(workflow['tag']),
            "id":json.loads(workflow['id']),
            "screenShot":json.loads(workflow['screenShot']),
        }
    return workflow_info

def search_workflows(params,limit=25):
    params = {k:json.dumps(v) for k,v in params.items()}
    props = ', '.join([f'{key}:${key}' for key in params.keys()])
    cypher = f'''
                MATCH (w:Workflow {{{props}}}) 
                WHERE w.basic = "false"
                WITH w LIMIT {limit}
                RETURN collect(DISTINCT w) as workflows
            '''
    result = query(cypher,params)
    if result:
        workflows = result['workflows']
        workflows = [json.loads(w['id']) for w in workflows]
        return workflows
    
def set_workflow(id,props):
    return set_node('Workflow',id,props)

def delete_workflow(id):
    workflow = get_workflow(id)
    if workflow:
        screenshot = workflow.get('screenShot')
        delete_file(screenshot)
    return delete_node('Workflow',id)


def add_workflow(props):
    return add_node('Workflow',props)


def save_workflow(data,user_id):

    source_folder = os.getenv('DATABASE_SOURCE_DIR')

    workflow_data = {k:v for k,v in data.items() if k not in ['nodes']}
    workflow_data['nodes'] = [module['id'] for module in data['nodes']]
    name = workflow_data.get('name','')

    # create query list for embedding
    query_list = []

    # create workflow id
    workflow_id = md5(f"{user_id}/{name}".encode()).hexdigest()
    source_id = workflow_data.get('source')
    previous_id = workflow_data.get('flowId')
    workflow_data['id'] = workflow_id 
    workflow_data['author_id'] = user_id
    screenshot = workflow_data.get('screenShot') 
    if screenshot and 'base64' in screenshot:
        screenshot_path = os.path.join(source_folder,f"images/{workflow_id}.png")
        workflow_data['screenShot'] = base642file(screenshot_path,screenshot)

    # delete existing workflow
    delete_workflow(workflow_id)
    # add track link
    if not source_id:
        workflow_data['source'] = previous_id
    else:
        if previous_id == workflow_id:
            workflow_data['source'] = source_id
        else:
            workflow_data['source'] = previous_id 

    query_list.append(f"""
    name:{workflow_data.get('name','')},
    description:{workflow_data.get('description','')},
    tag:{workflow_data.get('tag','')},
    city:{workflow_data.get('city','')},
    author:{workflow_data.get('author','')},
    """)
    add_workflow(workflow_data)
    add_link("forked_from", workflow_id, workflow_data['source'])

    # add author link
    author = workflow_data.get('author')
    author_props = {"name":author,"id":user_id}
    add_author(author_props)
    add_link("created_by", workflow_data['id'], user_id)

    # add module links
    id_maps = {}
    for module in data['nodes']:
        name = module.get('name')
        config = module.get('config')
        author = config.get('author')
        author_id = config.get('author_id')
        # if module author not exists, add author
        if author_id:
            if not get_author(author_id):
                add_author({"name":author,"id":author_id})
        else:
            author_id = user_id
            module['config']['author_id'] = user_id
        if not name:
            name = uuid.uuid4().hex[:5]
            module['name'] = name
        module_id = md5(f"{user_id}/{name}".encode()).hexdigest()

        icon = config.get('icon')
        if icon:
            icon_path = os.path.join(source_folder,f"icons/{module_id}.png")
            icon_data = config['icon']
            if 'base64' in icon_data:
                config['icon'] = base642file(icon_path,icon)
        
        files = config.get('files',[])
        file_urls = []
        for file in files:
            file_data = file.get('data')
            file_id = md5(file_data.encode()).hexdigest()
            file_path = os.path.join(source_folder,f"files/{file_id}")
            if 'base64' in file_data:
                file['data'] = base642file(file_path,file_data)
            file_urls.append(file)
        config['files'] = file_urls

        # save the mapping from old id to new id    
        id_maps[module['id']] = module_id
        # update the module id
        module['id'] = module_id
        query_list.append(f"""
        "name":{module.get('name')},
        "description":{config.get('description')},
        "category":{config.get('description')},
        "author":{config.get('description')},
        """)
        add_module(module)
        add_link("part_of", module_id, workflow_id)
        add_link("created_by", module_id, author_id)

    new_edges = []
    for edge in data['edges']:
        source_id = edge['source']
        target_id = edge['target']
        edge['source'] = id_maps[source_id]
        edge['sourceHandle'] = edge['sourceHandle'].replace(source_id ,id_maps[source_id] )
        edge['target'] = id_maps[target_id]
        edge['targetHandle'] = edge['targetHandle'].replace(target_id ,id_maps[target_id] )
        new_edges.append(edge)
        add_link("connected_to", edge['source'], edge['target'], props=edge)

    # update workflow with new module ids
    workflow_data['nodes'] = [id_maps[node] for node in workflow_data['nodes']]
    workflow_data['edges'] = new_edges
    workflow_data['hash'] = workflow_id
    add_workflow(workflow_data)

    # add embeddings
    embeddings = get_embedding(query_list)
    if len(embeddings)>1:
        set_node('Workflow',workflow_id,{"embeddings":embeddings[0]['embedding']})
        for i, node in enumerate(workflow_data['nodes']):
            set_node('Module',node,{"embeddings":embeddings[i+1]['embedding']})
    return workflow_id
    

