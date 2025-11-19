from functools import lru_cache

import docker
from docker.client import DockerClient


@lru_cache
def get_docker_client() -> DockerClient:
    """
    Клиент Docker, использующий переменные окружения.
    В контейнере мы будем пробрасывать /var/run/docker.sock.
    """
    return docker.from_env()
