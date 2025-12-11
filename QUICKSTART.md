# Quick Start Guide

## Running the Application

### Option 1: Using VS Code Tasks (Recommended)

1. Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
2. Select "Start Both (Backend + Frontend)"
3. Wait for both services to start
4. The frontend will automatically open at `http://localhost:3000`
5. The backend runs at `http://localhost:5000`

### Option 2: Running Services Separately

#### Terminal 1 - Backend:
```bash
cd backend
python app.py
```
Backend will start on http://localhost:5000

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```
Frontend will start on http://localhost:3000

### Option 3: Using the Startup Script
```bash
bash start.sh
```

## How to Use the Application

### 1. Create Your First User
- Click the **"➕ New User"** button in the sidebar
- Fill in:
  - Username (required)
  - Email (required)
  - Bio (optional)
- Click "Create User"

### 2. Switch Between Users
- Click on any username in the sidebar to switch accounts
- The sidebar always shows all available users

### 3. Create Posts (📰 Feed Tab)
- Type your message in the text area
- Click **"📝 Post"** button
- Your post appears at the top of the feed

### 4. Comment on Posts
- Click **"💬 Comments"** on any post
- Type your comment in the text field
- Press Enter or click "Send"
- Only the author can delete their comments

### 5. Manage Friends (👥 Friends Tab)

#### View Friends
- All accepted friends are shown here
- Each friend shows their username, email, and bio

#### Friend Requests
- Pending friend requests appear at the top
- Click **"✓ Accept"** to add them as a friend
- Click **"✗ Reject"** to decline

### 6. Find New Friends (⭐ Suggestions Tab)
- Get personalized friend suggestions
- Suggestions are based on mutual friends
- Shows how many mutual friends you have
- Click **"➕ Add Friend"** to send a request

### 7. Edit Your Profile (👤 Profile Tab)
- Click **"✏️ Edit Profile"** 
- Update your username, email, or bio
- Click **"💾 Save"** to update

## Feature Details

### Friend Suggestions Algorithm
The app suggests users based on:
1. **Mutual Friends**: Users who are friends with your friends
2. **Popularity**: Most connected users if you have no friends yet
3. **Mutual Count**: Sorted by number of mutual connections (descending)

### Real-time Updates
- Feed, comments, and friend requests update automatically every 3 seconds
- No need to refresh the page

### Data Persistence
- All data is stored in SQLite database (`social_network.db`)
- Database is created automatically on first run
- Located in the `backend/` directory

## API Endpoints Reference

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/<id>` - Get user details
- `PUT /api/users/<id>` - Update user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/<id>` - Get post with comments
- `DELETE /api/posts/<id>` - Delete post

### Comments
- `POST /api/posts/<id>/comments` - Add comment
- `DELETE /api/comments/<id>` - Delete comment

### Friendships
- `GET /api/users/<id>/friends` - Get friends list
- `GET /api/users/<id>/friend-requests` - Get pending requests
- `POST /api/friendships` - Send friend request
- `PUT /api/friendships/<id>` - Accept/reject request
- `GET /api/users/<id>/suggestions` - Get suggestions

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:

**Backend (Flask):**
```bash
cd backend
python app.py --port 5001  # Won't work as-is, edit app.py port directly
```

**Frontend (React):**
```bash
cd frontend
PORT=3001 npm start
```

### Database Issues
To reset the database:
```bash
rm backend/social_network.db
# The database will be recreated on next backend startup
```

### CORS Errors
If you get CORS errors:
1. Make sure the backend is running on port 5000
2. Make sure the frontend is running on port 3000
3. Check that the proxy setting in `frontend/package.json` is correct

### Frontend Won't Start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## Test Scenario

1. Create 3 users: Alice, Bob, Charlie
2. Switch to Alice, create a post
3. Switch to Bob, comment on Alice's post
4. Switch to Alice, create a friend request to Bob
5. Switch to Bob, accept the friend request
6. Switch to Bob, create a friend request to Charlie
7. Switch to Charlie, accept Bob's request
8. Switch to Alice, view friend suggestions (should suggest Charlie)
9. Switch to Alice, send friend request to Charlie
10. View all tabs to see your social graph

## File Structure Explanation

```
backend/
├── app.py              # All Flask routes and API endpoints
├── database.py         # SQLite setup and initialization
├── models.py           # Data model classes
└── requirements.txt    # Python dependencies

frontend/
├── src/
│   ├── App.js          # Main application component with navigation
│   ├── App.css         # All styling
│   ├── api.js          # API client utilities
│   ├── index.js        # React entry point
│   └── components/
│       ├── Feed.js     # Posts and comments
│       ├── Friends.js  # Friends and requests
│       ├── FriendSuggestions.js  # Suggestions
│       └── UserProfile.js  # Profile editing
├── package.json        # NPM dependencies
└── public/index.html   # HTML template
```

## Next Steps

Try extending the application with:
- User authentication (login/password)
- Post likes/reactions
- Direct messaging
- Notifications
- User search
- Profile pictures
- Post editing
- Friend removal

Happy networking! 🌐
