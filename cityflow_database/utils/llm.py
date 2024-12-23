import json
import requests
import os
from dotenv import load_dotenv
load_dotenv()

base_url = os.getenv('NEXT_PUBLIC_LLM_BASE_URL')
api_key = os.getenv('NEXT_PUBLIC_LLM_API_KEY')
embedding_model = os.getenv('NEXT_PUBLIC_EMBEDDING_MODEL')

def get_embedding(text,base_url=base_url,api_key=api_key, embedding_model=embedding_model):
    url = base_url + '/embeddings'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + api_key,
    }
    data = {
        'model': embedding_model,
        'input': text
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        return response.json()['data']
    except Exception as e:
        print(e)
        return []