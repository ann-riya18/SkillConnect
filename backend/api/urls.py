from django.urls import path, re_path
from .views import LoginView, RefreshView, MeView, RegisterView, SkillListCreateView, AdminPendingSkillsView, AdminUpdateSkillStatusView, AdminStatsView, AdminActivityView, PublicSkillListView, AdminAcceptedSkillsView, AdminAllUsersView, AdminPopularSkillsView, SkillDetailView, LikeToggleView, PublicCommentListView, CommentListCreateView, AdminDeclinedCoursesView, AdminAllCoursesView, UserUpdateView, MessageListCreateView, MessageDetailView, PublicProfileView, UserPublicSkillsView, FeedbackCreateView, FeedbackListView, UpdateProgressView, DownloadCertificateView

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", RefreshView.as_view()),
    path("auth/me/", MeView.as_view()),
    path("auth/profile/update/", UserUpdateView.as_view()),
    path("skills/", SkillListCreateView.as_view()),
    path("admin/skills/pending/", AdminPendingSkillsView.as_view()),
    path("admin/skills/<int:pk>/status/", AdminUpdateSkillStatusView.as_view()),
    path("admin/stats/", AdminStatsView.as_view()),
    path("admin/activity/", AdminActivityView.as_view()),
    path("skills/public/", PublicSkillListView.as_view()),
    path("admin/skills/accepted/", AdminAcceptedSkillsView.as_view()),
    path("admin/skills/declined/", AdminDeclinedCoursesView.as_view()),
    path("admin/skills/all/", AdminAllCoursesView.as_view()),
    path("admin/users/", AdminAllUsersView.as_view()),
    path("admin/users/<int:pk>/", AdminAllUsersView.as_view()),
    path("admin/skills/popular/", AdminPopularSkillsView.as_view()),
    # Interaction
    path("skills/<int:pk>/", SkillDetailView.as_view()),
    path("skills/<int:pk>/like/", LikeToggleView.as_view()),
    path("skills/<int:pk>/progress/", UpdateProgressView.as_view()),
    path("skills/<int:pk>/certificate/", DownloadCertificateView.as_view()),
    path("skills/<int:pk>/comments/", PublicCommentListView.as_view()), # Public list
    path("skills/<int:pk>/comments/add/", CommentListCreateView.as_view()), # Auth create
    path("messages/", MessageListCreateView.as_view()),
    path("messages/<int:pk>/", MessageDetailView.as_view()),
    path("feedback/", FeedbackCreateView.as_view()),
    path("admin/feedback/", FeedbackListView.as_view()),
    # User Public Profiles - using re_path to allow @ and dots in usernames

    re_path(r"^users/(?P<username>[\w.@+-]+)/profile/$", PublicProfileView.as_view()),
    re_path(r"^users/(?P<username>[\w.@+-]+)/skills/$", UserPublicSkillsView.as_view()),
]
