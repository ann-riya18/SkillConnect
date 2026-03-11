import requests
import time

BASE_URL = "http://127.0.0.1:8001"
REGISTRATION_URL = f"{BASE_URL}/api/auth/register/"

def test_registration():
    email = f"testuser_{int(time.time())}@example.com"
    data = {
        "name": "Test User",
        "email": email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "bio": "I am a test user.",
    }
    
    print(f"Registering user with email: {email}")
    try:
        response = requests.post(REGISTRATION_URL, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 201:
            print("Registration successful!")
        else:
            print("Registration failed.")
            
    except Exception as e:
        print(f"Error making request: {e}")

if __name__ == "__main__":
    test_registration()
