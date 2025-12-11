# Social Network Application

A simple social network simulator with Flask backend and React frontend, using SQLite database.

## Features

- **User Management**: Create and manage user profiles
- **Posts & Comments**: Create posts and add comments to posts
- **Friend System**: Send and accept friend requests
- **Friend Suggestions**: Get suggestions for new friends based on mutual connections
- **Real-time Updates**: Posts and comments update automatically

## Project Structure

```
.
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application with API endpoints
│   ├── database.py         # SQLite database initialization and management
│   ├── models.py           # Data models (User, Post, Comment, Friendship)
│   └── requirements.txt    # Python dependencies
└── frontend/               # React web application
    ├── public/             # Static files
    ├── src/
    │   ├── components/     # React components
    │   │   ├── Feed.js
    │   │   ├── UserProfile.js
    │   │   ├── Friends.js
    │   │   └── FriendSuggestions.js
    │   ├── api.js          # API client using axios
    │   ├── App.js          # Main App component
    │   ├── App.css         # Styling
    │   └── index.js        # React entry point
    ├── package.json        # NPM dependencies
    └── .gitignore
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```
   The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will open on `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/<id>` - Get user by ID
- `PUT /api/users/<id>` - Update user profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/<id>` - Get post with comments
- `DELETE /api/posts/<id>` - Delete post

### Comments
- `POST /api/posts/<id>/comments` - Add comment to post
- `DELETE /api/comments/<id>` - Delete comment

### Friends
- `GET /api/users/<id>/friends` - Get user's friends
- `GET /api/users/<id>/friend-requests` - Get pending friend requests
- `POST /api/friendships` - Send friend request
- `PUT /api/friendships/<id>` - Accept/reject friend request
- `GET /api/users/<id>/suggestions` - Get friend suggestions

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMP
)
```

### Posts Table
```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### Comments Table
```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### Friendships Table
```sql
CREATE TABLE friendships (
  id INTEGER PRIMARY KEY,
  user_id_1 INTEGER NOT NULL,
  user_id_2 INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP,
  FOREIGN KEY (user_id_1) REFERENCES users(id),
  FOREIGN KEY (user_id_2) REFERENCES users(id)
)
```

## Usage Example

1. **Create Users**: Click "New User" in the sidebar and fill in the form
2. **Switch Users**: Click on any user in the sidebar to switch accounts
3. **Create Posts**: Type in the text area and click "Post"
4. **Add Comments**: Click "Comments" on any post to expand and add comments
5. **Add Friends**: Go to "Suggestions" tab and click "Add Friend"
6. **View Friends**: Go to "Friends" tab to see friends and pending requests

## Technologies Used

### Backend
- Python 3.x
- Flask - Web framework
- SQLite3 - Database
- Flask-CORS - Cross-origin requests

### Frontend
- React 18 - UI framework
- Axios - HTTP client
- CSS3 - Styling

## Future Enhancements

- User authentication (login/logout)
- Direct messaging between users
- Post likes/reactions
- Search functionality
- Notifications system
- Image uploads for posts and profiles
- Deployment to production

## License

MIT License
