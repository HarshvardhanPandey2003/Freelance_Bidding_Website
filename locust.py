from locust import HttpUser, task, between
from locust.contrib.fasthttp import FastHttpUser
import random
import json

class FreelanceHubUser(FastHttpUser):
    wait_time = between(2, 4)
    
    def on_start(self):
        """Login with your actual API response structure"""
        
        # ONLY use freelancer credentials since client ones are wrong
        self.user_credentials = {
            "email": "free@gmail.com",
            "password": "test@123"
        }
        self.user_role = "freelancer"
        
        # Initialize
        self.token = None
        self.headers = {}
        self.authenticated = False
        self.user_id = None
        
        # Login attempt
        try:
            response = self.client.post(
                "/api/auth/login", 
                json=self.user_credentials, 
                timeout=10,
                name="POST /api/auth/login"
            )
            
            print(f"Login Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"Full login response: {data}")
                    
                    # Your API returns user data directly, not a token
                    # Let's work with what we have
                    self.user_id = data.get("id")
                    if self.user_id:
                        # Create a fake token for testing (since your API doesn't return one)
                        self.token = f"fake-token-{self.user_id}"
                        self.headers = {"Authorization": f"Bearer {self.token}"}
                        self.authenticated = True
                        print(f"Using user ID as auth: {self.user_id}")
                    
                except json.JSONDecodeError:
                    print(f"Invalid JSON response")
            else:
                print(f"Login failed: {response.status_code}")
                    
        except Exception as e:
            print(f"Login exception: {e}")

    @task(8)
    def browse_open_projects(self):
        """Test projects endpoint (might work without real auth)"""
        try:
            print(f"Attempting /api/projects/open")
            response = self.client.get(
                "/api/projects/open", 
                headers=self.headers, 
                timeout=15,
                name="GET /api/projects/open"
            )
            print(f"Projects response: {response.status_code}")
            
        except Exception as e:
            print(f"Projects exception: {e}")

    @task(6)
    def get_profile(self):
        """Test profile endpoint"""
        if self.user_id:
            try:
                # Try different profile URL patterns
                urls_to_try = [
                    f"/api/profile/freelancer/{self.user_id}",
                    "/api/profile/freelancer",
                    f"/api/profile/{self.user_id}"
                ]
                
                for url in urls_to_try:
                    print(f"Trying profile URL: {url}")
                    response = self.client.get(
                        url,
                        headers=self.headers, 
                        timeout=10,
                        name="GET profile"
                    )
                    print(f"Profile response: {response.status_code}")
                    if response.status_code in [200, 404]:
                        break  # Found working URL or acceptable 404
                    
            except Exception as e:
                print(f"Profile exception: {e}")

    @task(5)
    def get_user_info(self):
        """Test user info endpoint"""
        try:
            print(f"Attempting /api/auth/me")
            response = self.client.get(
                "/api/auth/me", 
                headers=self.headers, 
                timeout=10,
                name="GET /api/auth/me"
            )
            print(f"Auth/me response: {response.status_code}")
            
        except Exception as e:
            print(f"Auth/me exception: {e}")

    @task(10)
    def debug_health_check(self):
        """Debug route to find exactly why it's failing"""
        with self.client.get("/api/health", timeout=5, name="DEBUG /api/health", catch_response=True) as response:
            print(f"\n--- DEBUG INFO ---")
            print(f"Actual URL Hit: {response.url}")
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
            print(f"------------------\n")
            
            if response.status_code == 200:
                response.success()
            elif response.status_code == 0:
                response.failure("Connection completely refused. Is the Minikube tunnel still open?")
            elif response.status_code == 404:
                response.failure("404 Not Found. The pod received it, but the route doesn't exist.")
                
                # Let's dynamically test if it's a path rewrite issue!
                print("Attempting alternative route without '/api' prefix...")
                alt_response = self.client.get("/health")
                print(f"Alt Status Code (/health): {alt_response.status_code}")
            else:
                response.failure(f"Failed with status: {response.status_code}")

    @task(3)
    def test_without_auth(self):
        """Test endpoints without authentication"""
        try:
            # Try endpoints without auth headers
            response = self.client.get(
                "/api/projects/open",
                timeout=10,
                name="GET projects (no auth)"
            )
            print(f"No-auth projects: {response.status_code}")
            
        except Exception as e:
            print(f"No-auth test exception: {e}")

