# import json
# import requests
# import os
# from dotenv import load_dotenv
# load_dotenv()

# base_url = os.getenv('LLM_BASE_URL')
# api_key = os.getenv('LLM_API_KEY')
# embedding_model = os.getenv('EMBEDDING_MODEL')

# def get_embedding(text,base_url=base_url,api_key=api_key, embedding_model=embedding_model):
#     url = base_url + '/embeddings'
#     headers = {
#         'Content-Type': 'application/json',
#         'Authorization': 'Bearer ' + api_key,
#     }
#     data = {
#         'model': embedding_model,
#         'input': text
#     }
#     try:
#         response = requests.post(url, headers=headers, json=data)
#         return response.json()['data']
#     except Exception as e:
#         print(e)
#         return []


import os
from sentence_transformers import SentenceTransformer
# Load environment variables if needed
from dotenv import load_dotenv
load_dotenv()

# Define local model path
LOCAL_MODEL_PATH = os.getenv('LOCAL_MODEL_PATH', './models')

try:
    # Try loading from local path first
    model_path = os.path.join(LOCAL_MODEL_PATH, 'sentence-transformer')
    model = SentenceTransformer(model_path)
except (OSError, ValueError):
    # If local model doesn't exist, download and save
    model_name = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
    model = SentenceTransformer(model_name)
    # Save model to local path
    os.makedirs(model_path, exist_ok=True)
    model.save(model_path)
    print(f"Model saved to {model_path}")

def get_embedding(text):
    try:
        # Generate embeddings
        if isinstance(text, str):
            text = [text]  # Convert to list if a single string is provided
        embeddings = model.encode(text)
        return embeddings.tolist()  # Convert NumPy array to list for JSON serialization
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return []
