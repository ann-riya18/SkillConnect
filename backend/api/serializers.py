from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile
from .models import Skill, Comment, Message, Feedback, CourseProgress


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "name", "email", "message", "created_at"]
        read_only_fields = ["id", "created_at"]



class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    bio = serializers.CharField(allow_blank=True)
    profile_pic = serializers.ImageField(required=False, allow_null=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": ["Passwords do not match"]}
            )

        email = attrs["email"].lower()
        if User.objects.filter(username=email).exists():
            raise serializers.ValidationError(
                {"email": ["Email already registered"]}
            )

        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        user = User(
            username=validated_data["email"],
            email=validated_data["email"]
        )
        user.set_password(validated_data["password"])
        user.save()

        Profile.objects.create(
            user=user,
            name=validated_data["name"],
            bio=validated_data.get("bio", ""),
            profile_pic=validated_data.get("profile_pic"),
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    display_name = serializers.SerializerMethodField()
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "user", "username", "display_name", "profile_pic", "text", "created_at"]
        read_only_fields = ["id", "user", "username", "display_name", "profile_pic", "created_at"]

    def get_display_name(self, obj):
        try:
            if hasattr(obj.user, 'profile') and obj.user.profile.name:
                return obj.user.profile.name
        except:
            pass
        # Fallback to username but strip @... if it's an email
        uname = obj.user.username
        if "@" in uname:
            return uname.split("@")[0].capitalize()
        return uname.capitalize()

    def get_profile_pic(self, obj):
        try:
            if obj.user.profile and obj.user.profile.profile_pic:
                return obj.user.profile.profile_pic.url
        except:
            return None
        return None


class CourseProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseProgress
        fields = ['id', 'user', 'skill', 'progress', 'updated_at']
        read_only_fields = ['id', 'user', 'updated_at']

class SkillSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    username = serializers.ReadOnlyField(source='user.username')
    total_likes = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = [
            "id",
            "user",
            "username",
            "title",
            "description",
            "category",
            "level",
            "price_type",
            "price",
            "course_link",
            "thumbnail",
            "status",
            "total_likes",
            "is_liked",
            "comments_count",
            "user_progress",
            "created_at",
        ]
        read_only_fields = ["id", "user", "status", "total_likes", "is_liked", "comments_count", "user_progress", "created_at"]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_progress(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            try:
                progress = CourseProgress.objects.get(user=request.user, skill=obj)
                return progress.progress
            except CourseProgress.DoesNotExist:
                return 0.0
        return 0.0

    def create(self, validated_data):
        user = self.context.get("request").user if self.context.get("request") else None
        validated_data['user'] = user
        return Skill.objects.create(**validated_data)


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    sender_username = serializers.ReadOnlyField(source="sender.username")
    
    class Meta:
        model = Message
        fields = ["id", "sender", "recipient", "sender_username", "text", "is_read", "created_at"]
        read_only_fields = ["id", "sender", "recipient", "is_read", "created_at"]
