from utils.processor import *
from utils.core import *
from utils.llm import *
from hashlib import md5
import os


print('Initializing database...')

source_dir = os.getenv('DATABASE_SOURCE_DIR','./cityflow_database/source')
for folder in ['files','icons','images']:
    if not os.path.exists(os.path.join(source_dir,folder)): 
        os.makedirs(os.path.join(source_dir,folder))

init_db()
admin_passkey = 'admin/kai'
admin_id = md5(admin_passkey.encode()).hexdigest()

print('Admin ID:',admin_id)

def load_flow_data(file,basic=False,showcase=False,user_id=admin_id):
    with open(file) as f:
        flow = json.load(f)
        flow['flowId'] = None
        flow['author'] = 'admin'
        flow['author_id'] = user_id
        flow['basic'] = basic
        flow['showcase'] = showcase
        for module in flow['nodes']:
            if 'config' in module.keys():
                module['config']['author'] = None
                module['config']['author_id'] = None
            module['basic'] = basic
    return flow


print('Loading workflows...')

folder = './cityflow_database/json/basic'
for file in os.listdir(folder):
    if file.endswith('.json'):
        file = os.path.join(folder,file)
        flow = load_flow_data(file,basic=True,showcase=False)
        save_workflow(flow,user_id=admin_id)


folder = './cityflow_database/json/tutorial'
for file in os.listdir(folder):
    if file.endswith('.json'):
        file = os.path.join(folder,file)
        flow = load_flow_data(file,basic=False,showcase=False)
        flow['tutorial'] = True
        save_workflow(flow,user_id=admin_id)

folder = './cityflow_database/json/showcase'
for file in os.listdir(folder):
    if file.endswith('.json'):
        file = os.path.join(folder,file)
        flow = load_flow_data(file,basic=False,showcase=True)
        save_workflow(flow,user_id=admin_id)


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


print('Database initialized.')




