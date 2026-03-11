from django.contrib.auth.models import User
from django.db import models # for Q objects
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .jwt_serializers import EmailTokenObtainPairSerializer
from .models import Skill, Comment, Message, Profile, Feedback, CourseProgress
from .serializers import RegisterSerializer, SkillSerializer, CommentSerializer, MessageSerializer, UserSerializer, FeedbackSerializer, CourseProgressSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        email = (request.data.get("email") or "").lower().strip()
        password = request.data.get("password") or ""
        confirm_password = request.data.get("confirm_password") or ""
        bio = request.data.get("bio") or ""
        profile_pic = request.FILES.get("profile_pic")

        if not name:
            return Response({"name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        if not email:
            return Response({"email": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({"confirm_password": ["Passwords do not match."]}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"email": ["Email already registered."]}, status=status.HTTP_400_BAD_REQUEST)

        # Use email as username for consistency
        username = email

        user = User(username=username, email=email)
        user.set_password(password)  # ✅ IMPORTANT (hashes password)
        user.save()

        Profile.objects.create(
            user=user,
            name=name,
            bio=bio,
            profile_pic=profile_pic if profile_pic else None
        )

        # Send welcome email
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
            subject = "Welcome to SkillConnect!"
            message = (
                f"Hello {name},\n\n"
                f"Welcome to SkillConnect! Your account has been successfully created.\n\n"
                f"You can now explore our platform, enroll in courses, and start learning new skills. "
                f"Don't forget to complete your profile to get the most out of our community.\n\n"
                f"Happy Learning!\n"
                f"The SkillConnect Team"
            )
            recipient_list = [email]
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending welcome email to {email}: {e}")

        return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)

        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": profile.name if profile else "",
            "bio": profile.bio if profile else "",
            "profile_pic": profile.profile_pic.url if (profile and profile.profile_pic) else None,
            "role": "admin" if (user.is_staff or user.is_superuser) else "user",
        })


class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        profile = getattr(user, "profile", None)
        if not profile:
             profile = Profile.objects.create(user=user)
        
        data = request.data
        if "name" in data:
            profile.name = data["name"]
        if "bio" in data:
            profile.bio = data["bio"]
        
        if "profile_pic" in request.FILES:
            profile.profile_pic = request.FILES["profile_pic"]
        
        profile.save()
        
        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": profile.name,
            "bio": profile.bio,
            "profile_pic": profile.profile_pic.url if profile.profile_pic else None,
            "role": "admin" if (user.is_staff or user.is_superuser) else "user",
        })


class SkillListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return user's own skills and public skills
        skills = Skill.objects.filter(user=request.user).order_by("-created_at")
        serializer = SkillSerializer(skills, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        # allow thumbnail in files
        files = request.FILES

        serializer = SkillSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        # Save and attach thumbnail if provided
        skill = serializer.save(user=request.user)
        thumb = files.get("thumbnail")
        if thumb:
            skill.thumbnail = thumb
            skill.save()

        return Response(SkillSerializer(skill, context={"request": request}).data, status=status.HTTP_201_CREATED)


class AdminPendingSkillsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        skills = Skill.objects.filter(status="pending").order_by("-created_at")
        serializer = SkillSerializer(skills, many=True, context={"request": request})
        return Response({"skills": serializer.data})


class AdminUpdateSkillStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        status_value = (request.data.get("status") or "").lower()
        if status_value not in ["accepted", "declined", "pending"]:
            return Response({"status": ["Invalid status value."]}, status=status.HTTP_400_BAD_REQUEST)

        skill.status = status_value
        skill.save()

        # Send email notification if status is "accepted"
        if status_value == "accepted":
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                
                subject = f"Congratulations! Your Course '{skill.title}' is Now Live on SkillConnect"
                message = (
                    f"Hello {skill.user.username},\n\n"
                    f"We are pleased to inform you that your course '{skill.title}' has been reviewed and approved "
                    f"by our admin team. It is now live and available to the community on the SkillConnect platform.\n\n"
                    f"Thank you for your valuable contribution! We encourage you to continue sharing your expertise "
                    f"and look forward to seeing more of your courses in the future.\n\n"
                    f"Best regards,\n"
                    f"The SkillConnect Team"
                )
                recipient_list = [skill.user.email]
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    recipient_list,
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Error sending approval email: {e}")

        return Response(SkillSerializer(skill, context={"request": request}).data)


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        pending_requests = Skill.objects.filter(status="pending").count()
        accepted_courses = Skill.objects.filter(status="accepted").count()
        declined_courses = Skill.objects.filter(status="declined").count()
        # Total Courses - only accepted ones as per request
        total_courses = accepted_courses
        total_users = User.objects.filter(is_superuser=False, is_staff=False).count()
        
        # Most popular count based on likes
        from django.db.models import Count
        most_popular = Skill.objects.filter(status="accepted").annotate(num_likes=Count('likes')).order_by('-num_likes').first()
        most_popular_count = most_popular.num_likes if most_popular else 0

        return Response({
            "pending_requests": pending_requests,
            "accepted_courses": accepted_courses,
            "declined_courses": declined_courses,
            "total_users": total_users,
            "total_courses": total_courses,
            "most_popular_count": most_popular_count
        })


class AdminActivityView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # 1. Recent Skills
        recent_skills = Skill.objects.all().order_by("-created_at")[:10]
        # 2. Recent Users
        recent_users = User.objects.all().order_by("-date_joined")[:5]
        
        activity = []
        
        # Add skill activities
        for skill in recent_skills:
            activity.append({
                "id": f"skill_{skill.id}",
                "type": "submission",
                "message": f"{skill.user.username if skill.user else 'Someone'} uploaded '{skill.title}'",
                "timestamp": skill.created_at,
                "link": f"/course/{skill.id}" # Admin can view course
            })
            # Check for likes if wanted, but simpler to just show registration/upload
            
        # Add user activities
        for user in recent_users:
            activity.append({
                "id": f"user_{user.id}",
                "type": "registration",
                "message": f"{user.username} registered",
                "timestamp": user.date_joined,
                "link": "/admin/users"
            })
            
        # Sort combined activity by timestamp desc
        activity.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return Response({"activity": activity[:20]})


class AdminDeclinedCoursesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        skills = Skill.objects.filter(status="declined").order_by("-created_at")
        serializer = SkillSerializer(skills, many=True, context={"request": request})
        return Response({"skills": serializer.data})


class AdminAllCoursesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        skills = Skill.objects.filter(status="accepted").order_by("-created_at")
        serializer = SkillSerializer(skills, many=True, context={"request": request})
        return Response({"skills": serializer.data})


class PublicSkillListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        skills = Skill.objects.filter(status="accepted").order_by("-created_at")
        serializer = SkillSerializer(skills, many=True, context={"request": request})
        return Response(serializer.data)


class AdminAcceptedSkillsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        skills = Skill.objects.filter(status="accepted").order_by("-created_at")
        serializer = SkillSerializer(skills, many=True, context={"request": request})
        return Response({"skills": serializer.data})


class AdminAllUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Only show regular users, not admins
        users = User.objects.filter(is_superuser=False, is_staff=False).order_by("-date_joined")
        user_list = []
        for u in users:
            skill_count = Skill.objects.filter(user=u).count()
            profile = getattr(u, "profile", None)
            user_list.append({
                "id": u.id,
                "username": u.username,
                "name": profile.name if profile else u.username,
                "email": u.email,
                "date_joined": u.date_joined,
                "skill_count": skill_count
            })
        return Response({"users": user_list})

    def delete(self, request, pk=None):
        # Option to delete a user by ID
        user_id = request.data.get("user_id") or pk
        if not user_id:
            return Response({"detail": "User ID required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_to_delete = User.objects.get(id=user_id)
            # Guard against deleting staff/superuser via this API
            if user_to_delete.is_staff or user_to_delete.is_superuser:
                return Response({"detail": "Cannot delete admin users."}, status=status.HTTP_403_FORBIDDEN)
            
            user_to_delete.delete()
            return Response({"detail": "User deleted successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminPopularSkillsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Sort by likes descending, only accepted courses
        from django.db.models import Count
        skills = Skill.objects.filter(status="accepted").annotate(num_likes=Count('likes')).order_by("-num_likes")
        # Reuse existing serializer
        serializer = SkillSerializer(skills, many=True, context={"request": request})
        return Response({"skills": serializer.data})


class SkillDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SkillSerializer(skill, context={"request": request})
        return Response(serializer.data)


class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if skill.likes.filter(id=user.id).exists():
            skill.likes.remove(user)
            liked = False
        else:
            skill.likes.add(user)
            liked = True
        
        return Response({"liked": liked, "total_likes": skill.likes.count()})


class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        return self._get_comments(request, pk)

    def post(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        text = request.data.get("text")
        if not text:
            return Response({"text": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        from .models import Comment 
        comment = Comment.objects.create(user=request.user, skill=skill, text=text)
        
        from .serializers import CommentSerializer
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    def _get_comments(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        from .models import Comment
        from .serializers import CommentSerializer
        
        comments = Comment.objects.filter(skill=skill).order_by("-created_at")
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class PublicCommentListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        from .models import Comment
        from .serializers import CommentSerializer
        
        comments = Comment.objects.filter(skill=skill).order_by("-created_at")
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        messages = Message.objects.filter(
            models.Q(sender=user) | models.Q(recipient=user)
        ).order_by("-created_at")
        
        from .serializers import MessageSerializer
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request):
        recipient_id = request.data.get("recipient_id")
        text = request.data.get("text")
        
        if not recipient_id or not text:
             return Response({"detail": "Recipient and text required."}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({"detail": "Recipient not found."}, status=status.HTTP_404_NOT_FOUND)
            
        message = Message.objects.create(
            sender=request.user,
            recipient=recipient,
            text=text
        )
        
        from .serializers import MessageSerializer
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            message = Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if request.user != message.sender and request.user != message.recipient:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
            
        if request.user == message.recipient and not message.is_read:
            message.is_read = True
            message.save()
            
        from .serializers import MessageSerializer
        return Response(MessageSerializer(message).data)


class PublicProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            profile = getattr(user, "profile", None)
            
            return Response({
                "id": user.id,
                "username": user.username,
                "name": profile.name if profile else "",
                "bio": profile.bio if profile else "",
                "profile_pic": profile.profile_pic.url if (profile and profile.profile_pic) else None,
                "date_joined": user.date_joined,
            })
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class UserPublicSkillsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            skills = Skill.objects.filter(user=user, status="accepted").order_by("-created_at")
            serializer = SkillSerializer(skills, many=True, context={"request": request})
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class FeedbackCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeedbackListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        feedback = Feedback.objects.all().order_by("-created_at")
        serializer = FeedbackSerializer(feedback, many=True)
        return Response(serializer.data)

class UpdateProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({"detail": "Skill not found."}, status=status.HTTP_404_NOT_FOUND)

        progress_val = float(request.data.get("progress", 0))
        
        progress_obj, created = CourseProgress.objects.get_or_create(user=request.user, skill=skill)
        
        # Only update if the new progress is higher (save the maximum progress reached)
        if progress_val > progress_obj.progress:
            progress_obj.progress = progress_val
            progress_obj.save()

        return Response({"progress": progress_obj.progress})


class DownloadCertificateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
            progress = CourseProgress.objects.get(user=request.user, skill=skill)
        except (Skill.DoesNotExist, CourseProgress.DoesNotExist):
            return Response({"detail": "Course not found or no progress recorded."}, status=status.HTTP_404_NOT_FOUND)

        if progress.progress < 75.0:
            return Response({"detail": "Course not completed (min 75% required)."}, status=status.HTTP_403_FORBIDDEN)

        # Generate PDF
        from io import BytesIO
        from django.http import HttpResponse
        import datetime
        
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter, landscape
            from reportlab.lib import colors
        except ImportError:
            return Response({"detail": "PDF generation library (reportlab) not found on server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        buffer = BytesIO()
        # Use LANDSCAPE for a more professional certificate feel
        p = canvas.Canvas(buffer, pagesize=landscape(letter))
        width, height = landscape(letter)

        # 1. Background / Border
        p.setStrokeColor(colors.HexColor("#4F46E5")) # Indigo
        p.setLineWidth(4)
        p.rect(30, 30, width - 60, height - 60) # Outer border
        
        p.setStrokeColor(colors.HexColor("#9333EA")) # Purple
        p.setLineWidth(2)
        p.rect(40, 40, width - 80, height - 80) # Inner border

        # 2. Header
        p.setFont("Times-Bold", 40)
        p.setFillColor(colors.HexColor("#1E1B4B")) # Dark Indigo
        p.drawCentredString(width / 2, height - 120, "CERTIFICATE OF COMPLETION")
        
        p.setFont("Helvetica", 16)
        p.setFillColor(colors.darkgray)
        p.drawCentredString(width / 2, height - 160, "This esteemed certificate is hereby presented to")

        # 3. User Name
        p.setFont("Times-BoldItalic", 35)
        p.setFillColor(colors.black)
        user_display_name = getattr(request.user, 'profile').name if hasattr(request.user, 'profile') else request.user.username
        p.drawCentredString(width / 2, height - 220, user_display_name.upper())

        # 4. Completion Text
        p.setFont("Helvetica", 16)
        p.setFillColor(colors.darkgray)
        p.drawCentredString(width / 2, height - 260, "for the successful completion of the course")

        # 5. Course Title
        p.setFont("Times-Bold", 28)
        p.setFillColor(colors.HexColor("#9333EA")) # Purple
        p.drawCentredString(width / 2, height - 310, f"\"{skill.title}\"")

        # 6. Instructor Info
        p.setFont("Helvetica-Bold", 14)
        p.setFillColor(colors.darkgray)
        instructor_name = getattr(skill.user, 'profile').name if hasattr(skill.user, 'profile') else skill.user.username
        p.drawCentredString(width / 2, height - 360, f"Instructor: {instructor_name}")

        # 7. Date & Signature Area
        p.setStrokeColor(colors.lightgrey)
        p.setLineWidth(1)
        p.line(100, 100, 300, 100) # Date line
        p.line(width - 300, 100, width - 100, 100) # Signature line
        
        p.setFont("Helvetica", 10)
        p.setFillColor(colors.gray)
        p.drawCentredString(200, 85, "Date of Completion")
        p.drawCentredString(200, 105, progress.updated_at.strftime('%B %d, %Y'))
        
        p.drawCentredString(width - 200, 85, "SkillConnect Academy")
        p.setFont("Times-Italic", 12)
        p.drawCentredString(width - 200, 105, "Authorized Signature")

        # 8. Decorative Seal (Simple circle with text)
        p.setStrokeColor(colors.HexColor("#F59E0B")) # Gold
        p.setFillColor(colors.HexColor("#FEF3C7")) # Light Gold
        p.setLineWidth(3)
        p.circle(width / 2, 80, 40, fill=1)
        p.setFont("Helvetica-Bold", 10)
        p.setFillColor(colors.HexColor("#B45309")) # Dark Gold
        p.drawCentredString(width / 2, 80, "VERIFIED")

        p.showPage()
        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        filename = f"Certificate_{skill.title.replace(' ', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
