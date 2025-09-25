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
            
            print(f"🔍 Login Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"📋 Full login response: {data}")
                    
                    # Your API returns user data directly, not a token
                    # Let's work with what we have
                    self.user_id = data.get("id")
                    if self.user_id:
                        # Create a fake token for testing (since your API doesn't return one)
                        self.token = f"fake-token-{self.user_id}"
                        self.headers = {"Authorization": f"Bearer {self.token}"}
                        self.authenticated = True
                        print(f"✅ Using user ID as auth: {self.user_id}")
                    
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON response")
            else:
                print(f"❌ Login failed: {response.status_code}")
                    
        except Exception as e:
            print(f"❌ Login exception: {e}")

    @task(8)
    def browse_open_projects(self):
        """Test projects endpoint (might work without real auth)"""
        try:
            print(f"🔍 Attempting /api/projects/open")
            response = self.client.get(
                "/api/projects/open", 
                headers=self.headers, 
                timeout=15,
                name="GET /api/projects/open"
            )
            print(f"📊 Projects response: {response.status_code}")
            
        except Exception as e:
            print(f"❌ Projects exception: {e}")

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
                    print(f"🔍 Trying profile URL: {url}")
                    response = self.client.get(
                        url,
                        headers=self.headers, 
                        timeout=10,
                        name="GET profile"
                    )
                    print(f"📊 Profile response: {response.status_code}")
                    if response.status_code in [200, 404]:
                        break  # Found working URL or acceptable 404
                    
            except Exception as e:
                print(f"❌ Profile exception: {e}")

    @task(5)
    def get_user_info(self):
        """Test user info endpoint"""
        try:
            print(f"🔍 Attempting /api/auth/me")
            response = self.client.get(
                "/api/auth/me", 
                headers=self.headers, 
                timeout=10,
                name="GET /api/auth/me"
            )
            print(f"📊 Auth/me response: {response.status_code}")
            
        except Exception as e:
            print(f"❌ Auth/me exception: {e}")

    @task(10)  # High weight - this should always work
    def health_check(self):
        """Health check - check if server is running"""
        try:
            response = self.client.get(
                "/api/health", 
                timeout=5,
                name="GET /api/health"
            )
            if response.status_code == 200:
                print(f"✅ Health check OK")
            else:
                print(f"❌ Health check failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Health check exception: {e}")

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
            print(f"📊 No-auth projects: {response.status_code}")
            
        except Exception as e:
            print(f"❌ No-auth test exception: {e}")

# from locust import HttpUser, task, between

# class SimpleTest(HttpUser):
#     wait_time = between(1, 3)
    
#     @task(5)
#     def test_login_only(self):
#         """Just test login to generate load"""
#         self.client.post("/api/auth/login", json={
#             "email": "free@gmail.com",
#             "password": "test@123"
#         }, name="POST /api/auth/login")
    
#     @task(3)
#     def test_health(self):
#         """Test health endpoint"""
#         self.client.get("/api/health", name="GET /api/health")
    
#     @task(2)
#     def test_projects_no_auth(self):
#         """Test projects without auth"""
#         self.client.get("/api/projects/open", name="GET /api/projects/open")
