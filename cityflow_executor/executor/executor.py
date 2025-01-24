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
from dotenv import load_dotenv
load_dotenv()

dataserver= os.getenv('DATASET_SERVER')

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
        return "node /cityflow_runner/execute.js --compile"
    else:
        raise ValueError(f"Unsupported language {lang}")
    
def _pm(lang: str) -> str:
    if lang == "python":
        return "pip"
    elif lang == "javascript":
        return "npm"
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
                memory_limit = "1024m"
                ):
        self._client = docker.from_env()
        self._image = image
        print(f"Using image {self._image}")
        if container_name is None:
            container_name = f"csflow-{uuid.uuid4()}"
        self._container_name = container_name
        self._timeout =  int(os.getenv("EXECUTOR_TIMEOUT",timeout))
        self._auto_remove = auto_remove
        self._bind_dir = os.path.join(os.getenv("EXECUTOR_BIND_DIR", bind_dir),container_name)
        self._work_dir = os.path.join(os.getenv("EXECUTOR_WORK_DIR", work_dir), container_name)
        # self._user = os.getenv("EXECUTOR_USER", "1000:1000")
        # print("docker user",self._user)
        self._stop_container = stop_container  
        self._mem_limit = os.getenv("EXECUTOR_MEMORY_LIMIT",memory_limit)
        self._last_update_time = time.time()

        if not os.path.exists(self._work_dir):
            try:
                os.makedirs(self._work_dir)
            except FileExistsError:
                pass
            
        # Check if the image exists
        try:
            self._client.images.get(image)
        except ImageNotFound:
            logging.info(f"Pulling image {image}...")
            # Let the docker exception escape if this fails.
            self._client.images.pull(image)
        self.start()

    def start(self) -> None:
        """(Experimental) Restart the code executor."""
        # Start a container from the image, read to exec commands later
        try:
            self._container = self._client.containers.get(self._container_name)
        except NotFound:
            self._container = self._client.containers.create(
                self._image,
                name=self._container_name,
                entrypoint="/bin/sh",
                tty=True,
                auto_remove=self._auto_remove,
                volumes={
                    self._bind_dir: {"bind": "/cityflow_runner/workflow", "mode": "rw"},
                },
                network="cityflow",
                # mem_limit=self._mem_limit,
                # user=self._user
            )
        # Start the container if it is not running
        if self._container.status != "running":
            self._container.start()
            _wait_for_ready(self._container)
        else:
            self._container.restart()
            _wait_for_ready(self._container)

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

    def setup(self, packages: List[str], lang:str) -> None:
        """Set up the code executor."""
        console_outputs = []
        last_exit_code = 0
        for package in packages:
            if package:
                pm = _pm(lang)
                result = self._container.exec_run([_pm(lang), "install", package])
                exit_code = result.exit_code
                output = result.output.decode("utf-8")
                console_outputs.append(output)
                last_exit_code = exit_code
            if last_exit_code != 0:
                break
        self._last_update_time = time.time()
        return CodeResult(exit_code=last_exit_code, console="".join(console_outputs), output="")

    def execute(self, code_blocks: List[str]) -> List[str]:
        """Execute the code blocks."""
        console_outputs = []
        last_exit_code = 0
        for code_block in code_blocks:
            lang = code_block.language.lower()
            if lang not in self.DEFAULT_EXECUTION_POLICY:
                console_outputs.append(f"Unsupported language {lang}\n")
                last_exit_code = 1
                break
            code = code_block.code
            session_id = code_block.session_id
            # foldername = f"codeblock_{md5(code.encode()).hexdigest()}"
            foldername = f"codeblock_{session_id}"
            if not os.path.exists(os.path.join(self._work_dir, foldername)):
                try:
                    os.makedirs(os.path.join(self._work_dir, foldername))
                except FileExistsError:
                    pass

            filename = f"entrypoint"
            code_path = os.path.join(self._work_dir, foldername, filename)
            with open(code_path, "w") as fcode:
                fcode.write(code)

            if code_block.files:
                for file in code_block.files:
                    try:
                        file_path = os.path.join(self._work_dir, foldername, file.path)
                        if file.path not in ['input','output','entrypoint','config']:
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
                            print(e)
                            pass
            
            runner_work_dir = self._container.attrs["Config"]["WorkingDir"]
            runner_work_dir = os.path.join(runner_work_dir, "workflow",foldername)
            command = ["sh", "-c", f"cd {runner_work_dir} && timeout {self._timeout} {_cmd(lang)} ."]
            
            result = self._container.exec_run(command,
                                            #   user=self._user
                                              )
            exit_code = result.exit_code
            output = result.output.decode("utf-8")
            console_outputs.append(output)
            if exit_code == 124:
                output += "\n" + "Timeout"
            last_exit_code = exit_code
            if exit_code != 0:
                break
            
        
        final_output = ""
        if os.path.exists(os.path.join(self._work_dir, foldername, "output")):
            with open(os.path.join(self._work_dir, foldername, "output"), "r") as f:
                final_output = f.read()

        final_config = ""
        if os.path.exists(os.path.join(self._work_dir, foldername, "config")):
            with open(os.path.join(self._work_dir, foldername, "config"), "r") as f:
                final_config = f.read()

        rendered_html = ""
        if os.path.exists(os.path.join(self._work_dir, foldername, "index.html")):
            with open(os.path.join(self._work_dir, foldername, "index.html"), "r") as f:
                rendered_html = f.read()
        
        self._last_update_time = time.time()
        return CodeResult(exit_code=last_exit_code, console="".join(console_outputs), output=final_output, config=final_config, html=rendered_html)

    def remove_session(self, session_id: str) -> None:
        """Remove the session."""
        foldername = f"codeblock_{session_id}"
        try:
            if os.path.exists(os.path.join(self._work_dir, foldername)):
                print(f"Removing {os.path.join(self._work_dir, foldername)}")
                shutil.rmtree(os.path.join(self._work_dir, foldername))
        except FileNotFoundError:
            pass