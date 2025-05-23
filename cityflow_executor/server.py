from flask import Flask, request, jsonify,Response
from flask_cors import CORS
from executor.executor import CodeExecutor
from executor.utils import CodeBlock, File
from executor.manager import ExecutorManage
from hashlib import md5
import logging
import os


log = logging.getLogger('werkzeug')
log.setLevel(logging.WARNING)

app = Flask(__name__)
CORS(app)
manager = ExecutorManage()

@app.route('/setup', methods=['POST'])
def setup():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    packages = request.json.get('packages')
    image = request.json.get('image')
    container_name = f"csflow-{user_id}-{id}"
    # print(f"Setup Container: {container_name} Image: {image}, Packages: {packages}")
    logging.info(f"Setup Container: {container_name} Image: {image}, Packages: {packages}")
    if manager.check_image_exist(image) is False:
        return jsonify({'error': 'Image not found.'}), 400
    else:
        executor = manager.get_executor(container_name)
        if executor is None:
            executor = CodeExecutor(image=image,container_name=container_name,packages=packages)
            manager.register_excutor(executor)
        else:
            # print(f"Restarting container {container_name} with new image {image}, Packages: {packages}")
            logging.info(f"Restarting container {container_name} with new image {image}, Packages: {packages}")
            manager.unregister_excutor(container_name)
            executor = CodeExecutor(image=image,container_name=container_name,packages=packages)
            manager.register_excutor(executor)
        return Response(executor.run("/cityflow_runner/install.sh"), mimetype='text/plain')
    
@app.route('/run_command', methods=['POST'])
def run_command():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    command = request.json.get('command')
    container_name = f"csflow-{user_id}-{id}"
    executor = manager.get_executor(container_name)
    if executor is None:
        return jsonify({'error': 'Ruuner not found.'}), 400
    else:
        return Response(executor.run(command), mimetype='text/plain')

@app.route('/check', methods=['POST'])
def is_alive():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    container_name = f"csflow-{user_id}-{id}"
    # print(f"Update Container: {container_name}")
    executor = manager.get_executor(container_name)
    if executor:
        alive = executor.check()
        if alive:
            manager.keep_alive(executor._container_name)
        return jsonify({"alive":alive})
    else:
        return jsonify({"alive":False})
    
@app.route('/interupt', methods=['POST'])
def interupt():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    container_name = f"csflow-{user_id}-{id}"
    executor = manager.get_executor(container_name)
    if executor:
        executor.interupt()
        return jsonify({
        'container_name': executor._container_name,
        'console': 'Interupted',
    })
    else:
        return jsonify({'container_name': container_name, 'console': 'Container not found.'}), 400

@app.route('/execute', methods=['POST'])
def execute():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    session_id = request.json.get('sessionId')
    image = request.json.get('image')
    container_name = f"csflow-{user_id}-{id}"
    # print(f"Execute Container: {container_name}, Session ID: {session_id}")
    code_block = request.json.get('codeBlock')
    if code_block is None:
        return jsonify({'error': 'No code blocks provided.'}), 400
    executor = manager.get_executor(container_name)
    if executor is None:
        executor = CodeExecutor(container_name=container_name,image=image)
        manager.register_excutor(executor)
    
    exeucte_block = CodeBlock(
        session_id = session_id,
        code=code_block["code"],
        language=code_block["language"],
        files=[File(path=file["path"], data=file["data"]) for file in code_block["files"]] if "files" in code_block else None
    )
    return  Response(executor.execute(exeucte_block), mimetype='text/plain')
    
@app.route('/compile', methods=['POST'])
def compile():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    session_id = request.json.get('sessionId')
    image = request.json.get('image')
    container_name = f"csflow-{user_id}-{id}"
    # print(f"Execute Container: {container_name}, Session ID: {session_id}")
    code_block = request.json.get('codeBlock')
    if code_block is None:
        return jsonify({'error': 'No code blocks provided.'}), 400
    executor = manager.get_executor(container_name)
    if executor is None:
        executor = CodeExecutor(container_name=container_name,image=image)
        manager.register_excutor(executor)
    
    files = []
    for file in code_block["files"]:
        if "path" in file and "data" in file:
            files.append(File(path=file["path"], data=file["data"]))
    
    exeucte_block = CodeBlock(
        session_id = session_id,
        code=code_block["code"],
        language=code_block["language"],
        files=files
    )
    code_result= executor.compile(exeucte_block)
    return jsonify({
        'container_name': executor._container_name,
        'exit_code': code_result.exit_code, 
        'console': code_result.console,
        'output': code_result.output,
        'config': code_result.config,
        'html': code_result.html,
    })
    

@app.route('/remove_session', methods=['POST'])
def remove_ssesion():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    session_id = request.json.get('sessionId')
    container_name = f"csflow-{user_id}-{id}"
    # print(f"Remove Container: {container_name}, Session ID: {session_id}")
    executor = manager.get_executor(container_name)
    if executor:
        executor.remove_session(session_id)
        return jsonify({
            'container_name': executor._container_name,
            'session_id': session_id, 
        })
    else:
        return jsonify({
            'container_name': None,
            'session_id': None,
            'warning': 'Container not found.'
        })

@app.route('/kill', methods=['POST'])
def kill_executor():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    container_name = f"csflow-{user_id}-{id}"
    # print(f"Kill Container: {container_name}")
    executor = manager.get_executor(container_name)
    if executor:
        manager.unregister_excutor(container_name)
        return jsonify({
            'container_name': container_name,
            'exit_code': 0,
            'output': 'Container has been removed.'
        })
    else:
        return jsonify({
            'container_name': container_name,
            'exit_code': 1,
            'output': 'Container not found.'
        })

@app.route('/export_image', methods=['POST'])
def export_image():
    image_name = request.json.get('imageName')
    tag = request.json.get('tag') or 'latest'
    user_id = request.json.get('userId')
    id = request.json.get('flowId')
    container_name = f"csflow-{user_id}-{id}"
    executor = manager.get_executor(container_name)
    if executor:
        try:
            executor.export_image(image_name, tag)
            return jsonify({'success': 'Image has been exported.'})
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'Container not found.'}), 400

@app.route('/logs', methods=['POST'])
def get_logs():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    container_name = f"csflow-{user_id}-{id}"
    executor = manager.get_executor(container_name)
    if executor:
        return Response(executor.get_logs(), mimetype='text/plain')
    else:
        return "Executor not found", 404

if __name__ == '__main__':
    env = os.getenv('NODE_ENV', 'dev')
    debug = True
    if env == 'production':
        debug = False
    app.run(debug=debug, host='0.0.0.0', port=8000)




