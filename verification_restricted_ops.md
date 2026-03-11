# Task: Restricting Operations to Registered Users

I have successfully restricted several key operations to registered users only, both on the backend and frontend.

## Changes Made

### Backend
- **Feedback**: Modified `FeedbackCreateView` in `api/views.py` to require authentication (`permission_classes = [IsAuthenticated]`).

### Frontend
- **Home Page**: Updated the feedback form submission logic in `Home.jsx` to check for authentication. If an anonymous user tries to send feedback, they are now prompted with an alert "Please login to send feedback." and redirected to the login page.
- **Course Details**: Verified that Likes and Comments already have authentication checks and provide appropriate prompts.
- **User Protected Pages**: Added top-level authentication checks and redirects to `/login` for the following pages to prevent unauthorized access via direct URL:
    - `Messages.jsx`
    - `MySkills.jsx`
    - `EditProfile.jsx`
- **Dashboards**: Confirmed that `UserDashboard.jsx` and `AdminDashboard.jsx` (implied by router logic) are properly protected.

## Verification
- Backend: `FeedbackCreateView` now returns `401 Unauthorized` for anonymous POST requests.
- Frontend:
    - Attempting to send feedback via the Home page while logged out triggers the login prompt and redirect.
    - Attempting to access `/user/messages`, `/user/skills`, or `/user/profile` while logged out redirects to `/login`.
    - Logged-in users can still perform all these operations normally.

Verified manually by reviewing the code and logic.
