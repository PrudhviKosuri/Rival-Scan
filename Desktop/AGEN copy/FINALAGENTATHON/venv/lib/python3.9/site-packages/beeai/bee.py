import asyncio
import requests
import socketio

class Bee:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.bee.computer'
        self.sio = None
        self.event_listeners = {}

    async def get_conversations(self, user_id, page=1, limit=10):
        try:
            response = requests.get(
                f"{self.base_url}/v1/{user_id}/conversations",
                params={"page": page, "limit": limit},
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get conversations: {str(e)}")

    async def get_conversation(self, user_id, conversation_id):
        try:
            response = requests.get(
                f"{self.base_url}/v1/{user_id}/conversations/{conversation_id}",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get conversation: {str(e)}")

    async def delete_conversation(self, user_id, conversation_id):
        try:
            response = requests.delete(
                f"{self.base_url}/v1/{user_id}/conversations/{conversation_id}",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to delete conversation: {str(e)}")

    async def end_conversation(self, user_id, conversation_id):
        try:
            response = requests.post(
                f"{self.base_url}/v1/{user_id}/conversations/{conversation_id}/end",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to end conversation: {str(e)}")

    async def retry_conversation(self, user_id, conversation_id):
        try:
            response = requests.post(
                f"{self.base_url}/v1/{user_id}/conversations/{conversation_id}/retry",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to retry conversation: {str(e)}")

    async def get_facts(self, user_id, page=1, limit=10, confirmed=True):
        try:
            response = requests.get(
                f"{self.base_url}/v1/{user_id}/facts",
                params={"page": page, "limit": limit, "confirmed": confirmed},
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get facts: {str(e)}")

    async def get_fact(self, user_id, fact_id):
        try:
            response = requests.get(
                f"{self.base_url}/v1/{user_id}/facts/{fact_id}",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get fact: {str(e)}")

    async def create_fact(self, user_id, fact):
        try:
            response = requests.post(
                f"{self.base_url}/v1/{user_id}/facts",
                json=fact,
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to create fact: {str(e)}")

    async def update_fact(self, user_id, fact_id, fact):
        try:
            response = requests.put(
                f"{self.base_url}/v1/{user_id}/facts/{fact_id}",
                json=fact,
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to update fact: {str(e)}")

    async def delete_fact(self, user_id, fact_id):
        try:
            response = requests.delete(
                f"{self.base_url}/v1/{user_id}/facts/{fact_id}",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to delete fact: {str(e)}")

    async def get_todos(self, user_id, page=1, limit=10):
        try:
            response = requests.get(
                f"{self.base_url}/v1/{user_id}/todos",
                params={"page": page, "limit": limit},
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get todos: {str(e)}")

    async def get_todo(self, user_id, todo_id):
        try:
            response = requests.get(
                f"{self.base_url}/v1/{user_id}/todos/{todo_id}",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get todo: {str(e)}")

    async def create_todo(self, user_id, todo):
        try:
            response = requests.post(
                f"{self.base_url}/v1/{user_id}/todos",
                json=todo,
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to create todo: {str(e)}")

    async def update_todo(self, user_id, todo_id, todo):
        try:
            response = requests.put(
                f"{self.base_url}/v1/{user_id}/todos/{todo_id}",
                json=todo,
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to update todo: {str(e)}")

    async def delete_todo(self, user_id, todo_id):
        try:
            response = requests.delete(
                f"{self.base_url}/v1/{user_id}/todos/{todo_id}",
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to delete todo: {str(e)}")

    async def get_locations(self, user_id, page=1, limit=10, conversation_id=None):
        try:
            params = {"page": page, "limit": limit}
            if conversation_id:
                params["conversationId"] = conversation_id
            response = requests.get(
                f"{self.base_url}/v1/{user_id}/locations",
                params=params,
                headers={"x-api-key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get locations: {str(e)}")
        
    def connect(self):
        self.sio = socketio.Client()
        self.sio.connect(
            self.base_url,
            socketio_path='/sdk',
            headers={"x-api-key": self.api_key}
        )
        self._register_event_listeners()

    def disconnect(self):
        if self.sio:
            self.sio.disconnect()
            self.sio = None

    def on(self, event):
        def decorator(callback):
            self.event_listeners[event] = callback
            return callback
        return decorator

    def _register_event_listeners(self):
        for event, callback in self.event_listeners.items():
            self.sio.on(event, callback)
