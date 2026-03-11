import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth.models import User

# Find admin user
admin = User.objects.filter(email='admin@skillconnect.com').first()
if admin:
    print(json.dumps({
        "found": True,
        "id": admin.id,
        "username": admin.username,
        "email": admin.email,
        "is_staff": admin.is_staff,
        "is_superuser": admin.is_superuser,
        "is_active": admin.is_active,
        "password_hash": admin.password[:50] if admin.password else None
    }, indent=2))
else:
    print(json.dumps({"found": False, "message": "Admin user not found"}, indent=2))
