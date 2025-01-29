from flask import Flask, request, jsonify,Response
from flask_cors import CORS
from executor.executor import CodeExecutor
from executor.utils import CodeBlock, File
from executor.manager import ExecutorManage
from hashlib import md5
import logging

logging.basicConfig(level=logging.INFO)

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
    return Response(executor.run('./install.sh'), mimetype='text/plain')

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

@app.route('/execute', methods=['POST'])
def execute():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    session_id = request.json.get('sessionId')
    image = request.json.get('image')
    container_name = f"csflow-{user_id}-{id}"
    # print(f"Execute Container: {container_name}, Session ID: {session_id}")
    code_blocks = request.json.get('codeBlocks')
    if code_blocks is None:
        return jsonify({'error': 'No code blocks provided.'}), 400
    executor = manager.get_executor(container_name)
    if executor is None:
        executor = CodeExecutor(container_name=container_name,image=image)
        manager.register_excutor(executor)
    
    exeucte_blocks = []
    for code_block in code_blocks:
        code_block = CodeBlock(
            session_id = session_id,
            code=code_block["code"],
            language=code_block["language"],
            files=[File(path=file["path"], data=file["data"]) for file in code_block["files"]] if "files" in code_block else None
        )
        exeucte_blocks.append(code_block)
    code_result= executor.execute(exeucte_blocks)
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
    app.run(debug=True, host='0.0.0.0', port=8000)




