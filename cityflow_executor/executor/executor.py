import docker
from docker.errors import ImageNotFound,NotFound
import logging
import uuid
from hashlib import md5
import time
from typing import Any, ClassVar, Dict, List
from .utils import CodeResult 
import os
import shutil
import base64
import requests
import json
import time
import re
from dotenv import load_dotenv
load_dotenv()

dataserver= os.getenv('DATASET_SERVER')

logging.basicConfig(level=logging.WARNING)

def _wait_for_ready(container: Any, timeout: int = 60, stop_time: float = 0.1) -> None:
    elapsed_time = 0.0
    while container.status != "running" and elapsed_time < timeout:
        time.sleep(stop_time)
        elapsed_time += stop_time
        container.reload()
        continue
    if container.status != "running":
        raise ValueError("Container failed to start")
    
def _cmd(lang: str) -> str:
    if lang == "python":
        return "python /cityflow_runner/execute.py"
    elif lang == "javascript":
        return "node /cityflow_runner/compile.js"
    else:
        raise ValueError(f"Unsupported language {lang}")
    
def _pm(lang: str) -> str:
    if lang == "python":
        return "pip"
    elif lang == "javascript":
        return "npm"
    else:
        raise ValueError(f"Unsupported language {lang}")
    
def _suffix(lang: str) -> str:
    if lang == "python":
        return "py"
    elif lang == "javascript":
        return "js"
    else:
        raise ValueError(f"Unsupported language {lang}")
    
class CodeExecutor: 
    DEFAULT_EXECUTION_POLICY: ClassVar[Dict[str, bool]] = {
        "python": True,
        "javascript": True,
    }
    def __init__(self, 
                image: str = "ghcr.io/kekehurry/cityflow_runner:latest", 
                container_name = None,
                timeout: int = 60,
                auto_remove: bool = True,
                bind_dir =None,
                work_dir = "code",
                stop_container: bool = True,
                packages: dict= '',
                ):
        self._client = docker.from_env()
        if image:
            self._image = image
        if container_name is None:
            container_name = f"csflow-{uuid.uuid4()}"
        self._container_name = container_name
        self._timeout =  int(os.getenv("EXECUTOR_TIMEOUT",timeout))
        self._auto_remove = auto_remove
        bind_dir = self.get_bind_dir()
        if bind_dir:
            self._bind_dir = os.path.join(bind_dir,container_name)
        else:
            self._bind_dir = os.path.join(os.getenv("EXECUTOR_BIND_DIR", bind_dir),container_name)
        self._work_dir = os.path.join(os.getenv("EXECUTOR_WORK_DIR", work_dir), container_name)
        self._stop_container = stop_container  
        self._packages = packages
        self._last_update_time = time.time()

        if not os.path.exists(self._work_dir):
            try:
                os.makedirs(self._work_dir)
            except FileExistsError:
                pass
        
        self._setup_path = os.path.join(self._work_dir, "setup.yml")
        with open(self._setup_path, "w") as f:
            if self._packages:
                f.write(self._packages)
            else:
                f.write("")   
        self.init()

    def init(self) -> None:
        """(Experimental) Restart the code executor."""
        # Start a container from the image, read to exec commands later
        try:
            self._container = self._client.containers.get(self._container_name)
        except NotFound:
            self._container = self._client.containers.create(
                self._image,
                name=self._container_name,
                entrypoint="sleep infinity",
                # tty=True,
                auto_remove=self._auto_remove,
                volumes={
                    self._bind_dir: {"bind": "/cityflow_runner/workflow", "mode": "rw"}
                }
            )
        # Start the container if it is not running
        if self._container.status != "running":
            self._container.start()
        else:
            self._container.restart()
        return

    def stop(self) -> None:
        """(Experimental) Stop the code executor."""
        try:
            self._container.stop()
            # remove the work dir
            if os.path.exists(self._work_dir):
                shutil.rmtree(self._work_dir)
        except docker.errors.NotFound:
            pass
    
    def check(self) -> bool:
        """Check if the container is running."""
        try:
            container = self._client.containers.get(self._container_name)
            if container:
                return container.status == "running"
            return False
        except Exception:
            return False
    
    def run(self,command) -> str: # type: ignore
        try:
            container = self._client.containers.get(self._container_name)
            results = container.exec_run(f"/bin/bash -c '{command}'", stream=True, tty=True) 
            for line in results.output:
                logs = line.decode("utf-8")
                yield logs + '\n'
        except Exception as e:
            yield str(e) + '\n'

    def prepare(self, code_block) -> None:  

        lang = code_block.language.lower()

        session_id = code_block.session_id

        foldername = f"codeblock_{session_id}"

        if not os.path.exists(os.path.join(self._work_dir, foldername)):
            try:
                os.makedirs(os.path.join(self._work_dir, foldername))
            except FileExistsError:
                pass
        
        for idx, code in enumerate(code_block.code):
            if idx == 0:
                filename = f'entrypoint.{_suffix(lang)}'
            else:
                line = code.strip().split("\n")[0]
                filename = re.sub(r'^(#|//|/\*)\s*', '', line).strip()
                filename = re.sub(r'\s*\*/$', '', filename).strip()
            code_path = os.path.join(self._work_dir, foldername, filename)
            with open(code_path, "w") as fcode:
                fcode.write(code)

        if code_block.files:
            for file in code_block.files:
                try:
                    file_path = os.path.join(self._work_dir, foldername, file.path)
                    if file.path not in ['input.json','output.json','config.json']:
                        if 'base64' in file.data:
                            with open(file_path, "wb") as f:
                                base64_data = file.data.split(",")[1]
                                binary_data = base64.b64decode(base64_data)
                                f.write(binary_data)
                        else:
                            file_data = requests.get(dataserver+file.data)
                            if file_data:
                                with open(file_path, "wb") as f:
                                    f.write(file_data.content)
                        
                    else:
                        with open(file_path,"w") as f:
                            f.write(file.data)
                except Exception as e:
                        logging.error(e)
                        pass
        
        runner_work_dir = self._container.attrs["Config"]["WorkingDir"]
        runner_work_dir = os.path.join(runner_work_dir,foldername)
        # command = ["/bin/bash", "-c", f"cd {runner_work_dir} && timeout {self._timeout} {_cmd(lang)} ."]
        command = ["/bin/bash", "-c", f"cd {runner_work_dir} && {_cmd(lang)} ."]
        return command, lang, foldername
    

    def execute(self, code_block):
        """Execute the code blocks."""
        command, lang, foldername = self.prepare(code_block)
        output_file = os.path.join(self._work_dir, foldername, "output.json")
        # remove old output files
        if os.path.exists(output_file):
            os.remove(output_file)

        result = self._container.exec_run(command,stream=True,tty=True)
        try:
            for line in result.output:
                logs = line.decode("utf-8")
                self._last_update_time = time.time()
                yield  json.dumps({
                    'container_name': self._container_name,
                    'console': logs,
                }) + '\n'

            final_output = ""
            if os.path.exists(output_file):
                with open(output_file, "r") as f:
                    final_output = json.load(f)
                yield  json.dumps({
                    'container_name': self._container_name,
                    'console': "\nCode Excuted Successfully\n" + time.strftime("%Y-%m-%d %H:%M:%S"),
                    'output': final_output,
                }) + '\n'
                
        except Exception as e:
            yield json.dumps({
                    'container_name': self._container_name,
                    'console': str(e),
                }) + '\n'
            
    def compile(self, code_block) -> CodeResult:

        command, lang, foldername = self.prepare(code_block)

        html_file = os.path.join(self._work_dir, foldername, "index.html")
        output_file = os.path.join(self._work_dir, foldername, "output.json")

        # remove old output files
        if os.path.exists(html_file):
            os.remove(html_file)
        
        if os.path.exists(output_file):
            os.remove(output_file)

        result = self._container.exec_run(command)

        logs =result.output.decode("utf-8")

        final_output = ""
        if os.path.exists(output_file):
            with open(output_file, "r") as f:
                final_output = json.load(f)

        rendered_html = ""
        if lang == 'javascript' and os.path.exists(html_file):
            with open(html_file, "r") as f:
                rendered_html = f.read()

        self._last_update_time = time.time()
        return  CodeResult(exit_code=0, console=logs, output=final_output, config="", html=rendered_html)

    def remove_session(self, session_id: str) -> None:
        """Remove the session."""
        foldername = f"codeblock_{session_id}"
        try:
            if os.path.exists(os.path.join(self._work_dir, foldername)):
                shutil.rmtree(os.path.join(self._work_dir, foldername))
        except FileNotFoundError:
            pass

    def get_bind_dir(self) -> str:
        containers = self._client.containers.list(all=True)
        target_container = None
        for container in containers:
            if any('cityflow_platform' in tag for tag in container.image.tags):
                target_container = container
                break
        if target_container:
            # Get the container's bind mounts
            bind_mounts = target_container.attrs['HostConfig']['Binds']

            # Find the bind folder for /cityflow_platform/cityflow_executor/code
            for bind in bind_mounts:
                host_path, container_path = bind.split(':')
                if container_path == os.getenv("EXECUTOR_WORK_DIR"):
                    return host_path
        return None
    
    def export_image(self, image_name: str, tag:str) -> None:
        """Export the image."""
        self._container.commit(repository=image_name, tag=tag)
        return 