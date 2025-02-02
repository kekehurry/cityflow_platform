from .executor import CodeExecutor
from datetime import datetime, timedelta, timezone
import threading
import time
import os
import docker
import logging
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO)

class ExecutorManage:
    def __init__(self, check_interval=60, idle_time=300, max_last_minute=20):
        self._client = docker.from_env()
        self._container_registry = {}
        self._check_interval = int(os.getenv("EXECUTOR_CHECK_INTERVAL", check_interval))
        self._idle_time = int(os.getenv("EXECUTOR_IDLE_TIME", idle_time))
        self._max_last_minute = int(os.getenv("EXECUTOR_MAX_LAST_MINUTE", max_last_minute))
        self._auto_remove_thread = threading.Thread(target=self._auto_remove)
        self._auto_remove_thread.daemon = True
        self._auto_remove_thread.start()
        pass
    
    def register_excutor(self, excutor:CodeExecutor):
        container_name = excutor._container_name
        self._container_registry[container_name] = excutor
        logging.info(f"Container {container_name} has been registered.")

    def unregister_excutor(self, container_name: str):
        if container_name in self._container_registry:
            try:
                excutor = self._container_registry[container_name]
                if excutor.check():
                    excutor.stop()
                    excutor.remove()
                    del self._container_registry[container_name]
                    logging.info(f"Container {container_name} has been removed.")
            except Exception as e:
                pass
    
    def get_executor(self, container_name: str):
        if container_name in self._container_registry:
            excutor = self._container_registry[container_name]
            if excutor.check():
                return self._container_registry[container_name]
        return None

    def keep_alive(self, container_name: str):
        if container_name in self._container_registry:
            excutor = self._container_registry[container_name]
            excutor._last_update_time = time.time()
    
    def _auto_remove(self):
        logging.info("Start monitoring process.")
        while True:
            containers = self._client.containers.list(all=True)
            for container in containers:
                if container.image.tags and 'cityflow_runner' in container.image.tags:
                    last_started = datetime.strptime(container.attrs['State']['StartedAt'], '%Y-%m-%dT%H:%M:%S.%fZ')
                    if datetime.now() - last_started > timedelta(minutes=self._max_last_minute):
                        container.stop()
                        container.remove()     
            for container_name in list(self._container_registry.keys()):
                excutor = self._container_registry[container_name]
                if time.time() - excutor._last_update_time >= self._idle_time:
                    self.unregister_excutor(container_name)
            time.sleep(self._check_interval)
        
