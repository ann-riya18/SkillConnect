import os
import sys
import json
from pathlib import Path

# Ensure project root is on sys.path so Django settings package can be imported
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
import django
django.setup()
from django.contrib.auth.models import User
users = list(User.objects.all().values('id','username','email','is_staff','is_superuser','is_active','date_joined'))
print(json.dumps(users, default=str))
