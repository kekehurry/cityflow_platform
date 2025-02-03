from flask import Flask, request, jsonify
from flask import send_file,send_from_directory
from flask_cors import CORS
import os
import logging

from utils.core import check_node_exists

from utils.processor import (
    search_workflows,
    get_workflow,
    get_workflow_info,
    delete_workflow,
    search_modules,
    get_module,
    get_module_info,
    get_author,
    save_workflow,  
)

from utils.search import (
    get_graph_overview
)

from utils.index import fulltext_query,semantic_query


app = Flask(__name__)
CORS(app)

# logging.basicConfig(level=logging.INFO)
log = logging.getLogger('werkzeug')
log.setLevel(logging.WARNING)

# Node

@app.route('/check_node', methods=['POST'])
def _check_node():
    id = request.json.get('nodeId')
    return jsonify(check_node_exists(id))

# Workflow
@app.route('/save_workflow', methods=['POST'])
def _save_workflow():
    data = request.json.get('flowData')
    user_id = request.json.get('userId','test_user_000')
    workflow = save_workflow(data,user_id)
    return jsonify(workflow)

@app.route('/get_workflow', methods=['POST'])
def _get_workflow():
    id = request.json.get('flowId')
    workflow = get_workflow(id)
    return jsonify(workflow)

@app.route('/search_workflow', methods=['POST'])
def _search_workflows():
    params = request.json.get('params', {})
    limit = request.json.get('limit', 25)
    ids = search_workflows(params, limit)
    workflows = [get_workflow_info(id) for id in ids]
    return jsonify(workflows)


# Module
@app.route('/get_module', methods=['POST'])
def _get_module():
    id = request.json.get('moduleId')
    module = get_module(id)
    return jsonify(module)

@app.route('/search_module', methods=['POST'])
def _search_modules():
    params = request.json.get('params', {})
    limit = request.json.get('limit', 25)
    ids = search_modules(params,limit)
    modules = [get_module_info(id) for id in ids]
    return jsonify(modules)


# Author
@app.route('/get_author', methods=['POST'])
def _get_author():
    id = request.json.get('authorId')
    author= get_author(id)
    return jsonify(author)

@app.route('/delete_workflow', methods=['POST'])
def _delete_workflow():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    workflow = get_workflow(id)
    workflow_author = workflow['author']
    user_info = get_author(user_id)
    if user_info['name'] == workflow_author:
        workflow = delete_workflow(id)
        return jsonify(f'workflow {id} deleted')
    else:
        print('Unauthorized Access')
        return jsonify({'error': 'Unauthorized  Access'}, 500)
    

# Search
@app.route('/fulltext_search', methods=['POST'])
def _fulltext_search():
    query_string = request.json.get('query')
    limit = request.json.get('limit', 10)
    result = fulltext_query(query_string, limit)
    return jsonify(result)

@app.route('/semantic_search', methods=['POST'])
def _semantic_search():
    query_string = request.json.get('query')
    limit = request.json.get('limit', 10)
    result = semantic_query(query_string, limit)
    return jsonify(result)

@app.route('/get_graph_overview', methods=['GET'])
def _get_graph_overview():
    result = get_graph_overview()
    return jsonify(result)

@app.route('/api/dataset/source/<path:path>',methods=['GET'])
def _get_source_file(path):
    return send_from_directory(os.getenv('DATABASE_SOURCE_DIR'), path)
    
if __name__ == '__main__':
    env = os.getenv('NODE_ENV', 'dev')
    debug = True
    if env == 'production':
        debug = False
    app.run(debug=debug, port=7575, host='0.0.0.0')

