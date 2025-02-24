from utils.processor import *
from utils.core import *
from utils.llm import *
from hashlib import md5
import os
import shutil


print('Initializing database...')

data_dir = './cityflow_database/json/'
source_dir = os.getenv('DATABASE_SOURCE_DIR','./cityflow_database/source')
    
for folder in ['files','icons','images','html']:
    if not os.path.exists(os.path.join(source_dir,folder)): 
        os.makedirs(os.path.join(source_dir,folder))

init_db()
admin_passkey = 'admin/cityflow'
admin_id = md5(admin_passkey.encode()).hexdigest()

print('Admin ID:',admin_id)

def load_flow_data(file,basic=True,category='basic'):
    with open(file) as f:
        flow = json.load(f)
        flow['flowId'] = None
        flow['category'] = category
        flow['globalScale'] = 0.01
        flow['private'] = False
        flow['authorId'] = admin_id
        flow['author'] = 'CityFlow' 
        if 'author_id' in flow.keys():
            del flow['author_id']
        for module in flow['nodes']:
            if 'config' in module.keys():
                module['config']['author'] = 'CityFlow'
                module['config']['authorId'] = admin_id
                if "author_id" in module['config'].keys():
                    del module['config']['author_id']
                if "user_id" in module['config'].keys():
                    del module['config']['user_id']
            module['basic'] = basic
    return flow

print('Loading workflows...')

for folder in os.listdir(data_dir):
    basic = False
    category = folder   
    if folder == 'basic':
        basic = True
    folder = os.path.join(data_dir,folder)
    if os.path.isdir(folder):
        for file in os.listdir(folder):
            try:
                if file.endswith('.json'):
                    file = os.path.join(folder,file)
                    flow = load_flow_data(file,basic=basic,category=category)
                    save_workflow(flow,user_id=admin_id)
            except Exception as e:
                print('Error loading workflow:',file,e)






