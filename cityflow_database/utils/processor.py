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
from .util import base642file, text2file, delete_file
from hashlib import md5
import uuid
import json
import os
import time
import copy
import shutil

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
    node_info = {k:node[k] for k in info_keys if k in node.keys()}
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
    user_id = props.get('user_id')
    author = props.get('author')
    config = props['config']
    basic = props.get('basic',False)
    name = props.get('name')    
    base = {k:v for k,v in props.items() if k != 'config'}

    hash = md5(f"{author}/{config}".encode()).hexdigest()

    data = {**config,"base": base, "id":id, "hash":hash, "name": name, "user_id": user_id,"basic":basic}
    
    return add_node('Module', data)

def delete_module(id):
    source_folder = os.getenv('DATABASE_SOURCE_DIR')
    module = get_module(id)
    if module:
        icon = module.get('icon')
        if icon.startswith('/api/dataset/source'):
            icon_path = os.path.join(source_folder,'icons',os.path.basename(icon))
            delete_file(icon_path)
        files = module.get('files',[])
        for file in files:
            if file['data'].startswith('/api/dataset/source'):
                file_path = os.path.join(source_folder,'files',os.path.basename(file['data']))
                delete_file(file_path)
        html = module.get('html')
        if html:
            if html.startswith('/api/dataset/source'):
                html_path = os.path.join(source_folder,'html',os.path.basename(html))
                delete_file(html_path)
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
        workflow_info = {}
        for key in ['name','description','author','city','tag','id','screenShot']:
            if key in workflow.keys():
                workflow_info[key] = json.loads(workflow[key])
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
    # print(cypher,params)
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
        source_folder = os.getenv('DATABASE_SOURCE_DIR')
        screenshot_path = os.path.join(source_folder,'images',os.path.basename(screenshot))
        delete_file(screenshot_path)
        for node in workflow['nodes']:
            delete_module(node.get('id'))
    return delete_node('Workflow',id)


def add_workflow(props):
    return add_node('Workflow',props)


def save_module(config,user_id,module=None):
    if not module:
        module = {}
    name = config.get('name')
    source_folder = os.getenv('DATABASE_SOURCE_DIR')
    author = config.get('author')
    author_id = config.get('author_id')
    # if module author not exists, add author
    if author_id:
        if not get_author(author_id):
            add_author({"name":author,"id":author_id})
    else:
        author_id = user_id
        config['author_id'] = user_id
    if not name:
        name = uuid.uuid4().hex[:5]
    module_id = md5(f"{user_id}/{name}-{time.time()}".encode()).hexdigest()

    icon = config.get('icon')
    if icon:
        icon_path = os.path.join(source_folder,f"icons/{module_id}.png")
        icon_data = config['icon']
        if 'base64' in icon_data:
            config['icon'] = base642file(icon_path,icon)
        else:
            orig_icon_path = os.path.join(source_folder,"icons",os.path.basename(config['icon']))
            if os.path.exists(orig_icon_path):
                shutil.copy(orig_icon_path, icon_path)
                config['icon']  = '/api/dataset/source/'+f"icons/{module_id}.png"

    files = config.get('files',[])
    file_urls = []
    for file in files:
        file_data = file.get('data')
        file_path = file.get('path')
        file_id = md5(f"{module_id}/{file_path}".encode()).hexdigest()
        file_path = os.path.join(source_folder,f"files/{file_id}")
        if 'base64' in file_data:
            file['data'] = base642file(file_path,file_data)
        else:
            orig_file_path = os.path.join(source_folder,"files",os.path.basename(file['data']))
            if os.path.exists(orig_file_path):
                shutil.copy(orig_file_path,file_path)
                file['data'] = '/api/dataset/source/'+f"files/{file_id}"
        file_urls.append(file)
    config['files'] = file_urls

    html = config.get('html')
    if html:
        html_id = md5(f"{module_id}/{html}".encode()).hexdigest()
        html_path = os.path.join(source_folder,f"html/{html_id}")
        if not html.startswith('/api/dataset/source'):
            config['html'] = text2file(html_path,html)
        else:
            orig_html_path = os.path.join(source_folder,"html",os.path.basename(html))
            if os.path.exists(orig_html_path):
                shutil.copy(orig_html_path,html_path)
                config['html'] =  '/api/dataset/source/'+f"html/{html_id}"

    # update the module id
    module['id'] = module_id
    module['user_id'] = user_id
    module['config'] = config
    module['name'] = name

    add_module(module)
    add_link("created_by", module_id, author_id)

    # add embeddings
    embeddings = get_embedding(f"""
    "name":{config.get('name')},
    "description":{config.get('description')},
    "category":{config.get('description')},
    "author":{config.get('description')},
    """)
    if len(embeddings)>0:
        set_node('Module',module_id,{"embeddings":embeddings[0]})

    return module_id


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
        screenshot_path = os.path.join(source_folder,f"images/{workflow_id}_{time.strftime('%H-%M-%S')}.png")
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
    if not user_id:
        user_id = md5(f"{author}".encode()).hexdigest()
    author_props = {"name":author,"id":user_id}
    add_author(author_props)
    add_link("created_by", workflow_data['id'], user_id)

    # add module links
    id_maps = {}
    for module in data['nodes']:
        config = module.get('config')
        orig_id = module['id']
        module_id = save_module(config,user_id,module)
        id_maps[orig_id] = module_id
        add_link("part_of", module_id, workflow_id)
        
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
    if len(embeddings)>0:
        set_node('Workflow',workflow_id,{"embeddings":embeddings[0]})
    return workflow_id
    

