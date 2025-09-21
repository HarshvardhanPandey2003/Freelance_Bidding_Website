from locust import HttpUser, task, between, SequentialTaskSet
from locust.contrib.fasthttp import FastHttpUser
import json
import time

# Helper function for authentication (shared across tasks)
def get_auth_token(self):
    # Simulate login to get JWT
    login_payload = {
        "email": "free@gmail.com",  # Replace with test credentials
        "password": "test@123"
    }
    response = self.client.post("/api/auth/login", json=login_payload)
    if response.status_code == 200:
        return response.json().get("token")
    else:
        print(f"Login failed: {response.status_code}")
        return None

class APIUser(FastHttpUser):  # Use FastHttpUser for efficient API testing
    wait_time = between(1, 3)  # Simulate realistic user think time

    def on_start(self):
        self.token = get_auth_token(self)  # Authenticate once per user

    @task(3)  # Weight: High frequency for project browsing (simulates traffic spikes)
    def browse_projects(self):
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/api/projects", headers=headers)  # Test project listing with filtering

    @task(2)
    def view_profile(self):
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/api/profile", headers=headers)  # Test protected profile route

    @task(1)
    def health_check(self):
        self.client.get("/api/health")  # Basic endpoint to test ingress and scaling

class WebSocketUser(HttpUser):
    wait_time = between(2, 5)
    abstract = True  # Base class for WebSocket scenarios

    def on_start(self):
        self.token = get_auth_token(self)
        if not self.token:
            return

        # Establish WebSocket connection via ingress (/socket.io)
        self.ws = self.client.ws_connect("/socket.io/?EIO=4&transport=websocket", 
                                        headers={"Authorization": f"Bearer {self.token}"})  
        # Basic connection validation (emits a test message; replace with real init event if needed)
        self.ws.send(json.dumps({"event": "connection_test", "data": {}}))
        response = self.ws.receive()
        if "error" in response:
            print("WebSocket connection failed")

    def on_stop(self):
        if hasattr(self, 'ws'):
            self.ws.close()

class BasicBiddingUser(WebSocketUser):
    @task
    def maintain_connection(self):
        # Simulate persistent connection with periodic pings (to test Socket.io stability under load)
        self.ws.send(json.dumps({"event": "ping", "data": {}}))  # Assumes a 'ping' event exists
        time.sleep(1)  # Hold connection to simulate real-time presence
        response = self.ws.receive()  # Check for pong or updates

# Main user class combining behaviors for full simulation
class FreelanceUser(FastHttpUser):
    tasks = {APIUser: 5, BasicBiddingUser: 3}  # Weight: More API users, some WebSocket
    wait_time = between(1, 5)
