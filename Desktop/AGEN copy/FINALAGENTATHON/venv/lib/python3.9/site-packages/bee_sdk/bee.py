import requests
import socketio

class Bee:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.bee.computer'
        self.socket = None

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

    def connect(self):
        self.socket = socketio.Client()
        self.socket.connect(
            self.base_url,
            socketio_path='/sdk',
            extraHeaders={"x-api-key": self.api_key}
        )

    def disconnect(self):
        if self.socket:
            self.socket.disconnect()
            self.socket = None

    def on(self, event, callback):
        if self.socket:
            self.socket.on(event, callback)