import base64
import shutil,os

def base642file(file_path, data):
    try:
        if 'base64,' in data:
            base64_string = data.split('base64,')[-1]
        else:
            base64_string =  data
        with open(file_path,'wb') as f:
            file_content = base64.b64decode(base64_string)
            f.write(file_content)
        
        request_path = file_path.split('source')[-1]
        return '/api/dataset/source'+request_path
    except Exception as e:
        print(e)
        return None
    
def text2file(file_path, data):
    try:
        with open(file_path,'w') as f:
            f.write(data)
        request_path = file_path.split('source')[-1]
        return '/api/dataset/source'+request_path
    except Exception as e:
        print(e)
        return None
    

def delete_file(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
        return True
    except Exception as e:
        print(e)
        return False