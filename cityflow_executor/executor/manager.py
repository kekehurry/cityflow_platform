from .executor import CodeExecutor
import threading
import time
import os
from dotenv import load_dotenv
load_dotenv()

class ExecutorManage:
    def __init__(self, check_interval=60, idle_time=120):
        self._container_registry = {}
        self._check_interval = int(os.getenv("EXECUTOR_CHECK_INTERVAL", check_interval))
        self._idle_time = int(os.getenv("EXECUTOR_IDLE_TIME", idle_time))
        self._auto_remove_thread = threading.Thread(target=self._auto_remove)
        self._auto_remove_thread.daemon = True
        self._auto_remove_thread.start()
        pass
    
    def register_excutor(self, excutor:CodeExecutor):
        container_name = excutor._container_name
        self._container_registry[container_name] = excutor
        print(f"Container {container_name} has been registered.")

    def unregister_excutor(self, container_name: str):
        if container_name in self._container_registry:
            excutor = self._container_registry[container_name]
            excutor.stop()
            del self._container_registry[container_name]
            print(f"Container {container_name} has been removed.")
    
    def get_executor(self, container_name: str):
        if container_name in self._container_registry:
            excutor = self._container_registry[container_name]
            if excutor.check():
                print(f"Get container {container_name}")
                return self._container_registry[container_name]
        return None

    def keep_alive(self, container_name: str):
        if container_name in self._container_registry:
            excutor = self._container_registry[container_name]
            excutor._last_update_time = time.time()
            print(f"Container {container_name} has been updated.")
    
    def _auto_remove(self):
        print("Start monitoring process.")
        while True:
            for container_name in list(self._container_registry.keys()):
                excutor = self._container_registry[container_name]
                if time.time() - excutor._last_update_time >= self._idle_time:
                    self.unregister_excutor(container_name)
            time.sleep(self._check_interval)
        
