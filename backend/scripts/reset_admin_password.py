import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

# Find admin user
admin = User.objects.filter(email='admin@skillconnect.com').first()

if admin:
    print(f"Found admin user: {admin.username} ({admin.email})")
    # Set password
    admin.set_password('admin123')
    admin.save()
    print(f"Password reset to 'admin123'")
else:
    print("Admin user not found!")
