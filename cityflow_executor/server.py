from flask import Flask, request, jsonify
from flask_cors import CORS
from executor.executor import CodeExecutor
from executor.utils import CodeBlock, File
from executor.manager import ExecutorManage
from hashlib import md5

app = Flask(__name__)
CORS(app)
manager = ExecutorManage()

@app.route('/setup', methods=['POST'])
def setup():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    packages = request.json.get('packages')
    language = request.json.get('language')
    image = request.json.get('image')
    container_name = f"csflow-{user_id}-{id}"
    print(f"Setup Container: {container_name} Image: {image}, Language: {language}, Packages: {packages}")
    executor = manager.get_executor(container_name)
    if executor is None:
        executor = CodeExecutor(image=image,container_name=container_name)
        manager.register_excutor(executor)
    elif image != executor._container.image.tags[0]:
        print(f"Restarting container {container_name} with new image {image}")
        manager.unregister_excutor(container_name)
        executor = CodeExecutor(image=image,container_name=container_name)
        manager.register_excutor(executor)
    code_result = executor.setup(packages=packages, lang=language)
    print(f"Finished Setup Container: {container_name}, Console: {code_result.console}")
    return jsonify({
        'container_name': executor._container_name,
        'exit_code': code_result.exit_code, 
        'console': code_result.console,
        'output': code_result.output,
    })

@app.route('/is_alive', methods=['POST'])
def is_alive():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    container_name = f"csflow-{user_id}-{id}"
    print(f"Update Container: {container_name}")
    executor = manager.get_executor(container_name)
    if executor:
        return jsonify({"alive":executor.check()})
    else:
        return jsonify({"alive":False})

@app.route('/keep_alive', methods=['POST'])
def keep_alive():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    container_name = f"csflow-{user_id}-{id}"
    print(f"Update Container: {container_name}")
    executor = manager.get_executor(container_name)
    if executor is None:
        executor = CodeExecutor(container_name=container_name)
        manager.register_excutor(executor)
        manager.keep_alive(executor._container_name)
    else:
        manager.keep_alive(executor._container_name)
    return jsonify({
        'container_name': executor._container_name,
        'last_update': executor._last_update_time
    })

@app.route('/execute', methods=['POST'])
def execute():
    id = request.json.get('flowId')
    user_id = request.json.get('userId')
    session_id = request.json.get('sessionId')
    image = request.json.get('image')
    container_name = f"csflow-{user_id}-{id}"
    print(f"Execute Container: {container_name}, Session ID: {session_id}")
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
    print(f"Remove Container: {container_name}, Session ID: {session_id}")
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
    print(f"Kill Container: {container_name}")
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)




