import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import init_db, get_db, close_db
from models import User, Post, Comment, Friendship
from datetime import datetime
import json
# Serve built React app when available (frontend/build)
frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'build')
if os.path.isdir(frontend_build_path):
    app = Flask(__name__, static_folder=frontend_build_path, static_url_path='')
else:
    app = Flask(__name__)
CORS(app)
app.config['DATABASE'] = 'social_network.db'

# Initialize database on startup
with app.app_context():
    init_db()

# Register database cleanup
app.teardown_appcontext(close_db)

# Serve React build (if present)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if app.static_folder and path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    elif app.static_folder:
        return send_from_directory(app.static_folder, 'index.html')
    else:
        return jsonify({'status': 'ok'})

# ==================== USER ENDPOINTS ====================

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    db = get_db()
    users = db.execute('SELECT * FROM users').fetchall()
    return jsonify([dict(u) for u in users])

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    if not data or not data.get('username') or not data.get('email'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    db = get_db()
    try:
        db.execute(
            'INSERT INTO users (username, email, bio) VALUES (?, ?, ?)',
            (data['username'], data['email'], data.get('bio', ''))
        )
        db.commit()
        user = db.execute(
            'SELECT * FROM users WHERE username = ?',
            (data['username'],)
        ).fetchone()
        return jsonify(dict(user)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user"""
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(dict(user))

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user profile"""
    db = get_db()
    data = request.json
    
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    db.execute(
        'UPDATE users SET username = ?, email = ?, bio = ? WHERE id = ?',
        (data.get('username', user['username']),
         data.get('email', user['email']),
         data.get('bio', user['bio']),
         user_id)
    )
    db.commit()
    
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    return jsonify(dict(user))

# ==================== POST ENDPOINTS ====================

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Get all posts with author information"""
    db = get_db()
    posts = db.execute('''
        SELECT p.*, u.username, u.id as author_id
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    ''').fetchall()
    return jsonify([dict(p) for p in posts])

@app.route('/api/posts', methods=['POST'])
def create_post():
    """Create a new post"""
    data = request.json
    if not data or not data.get('user_id') or not data.get('content'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    db = get_db()
    try:
        db.execute(
            'INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)',
            (data['user_id'], data['content'], datetime.now().isoformat())
        )
        db.commit()
        
        post = db.execute('''
            SELECT p.*, u.username, u.id as author_id
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.id DESC LIMIT 1
        ''').fetchone()
        return jsonify(dict(post)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post with comments"""
    db = get_db()
    post = db.execute('''
        SELECT p.*, u.username, u.id as author_id
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ''', (post_id,)).fetchone()
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    comments = db.execute('''
        SELECT c.*, u.username, u.id as author_id
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
    ''', (post_id,)).fetchall()
    
    post_dict = dict(post)
    post_dict['comments'] = [dict(c) for c in comments]
    return jsonify(post_dict)

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a post"""
    db = get_db()
    post = db.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    db.execute('DELETE FROM comments WHERE post_id = ?', (post_id,))
    db.execute('DELETE FROM posts WHERE id = ?', (post_id,))
    db.commit()
    return jsonify({'message': 'Post deleted'})

# ==================== COMMENT ENDPOINTS ====================

@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    """Create a comment on a post"""
    # Diagnostic logging: record incoming request details for debugging
    app.logger.info(f"Incoming create_comment request for post_id={post_id} from {request.remote_addr}")
    try:
        app.logger.info(f"Headers: {dict(request.headers)}")
    except Exception:
        pass
    data = request.json
    try:
        app.logger.info(f"Payload: {data}")
    except Exception:
        pass
    if not data or not data.get('user_id') or not data.get('content'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    db = get_db()
    post = db.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    try:
        db.execute(
            'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)',
            (post_id, data['user_id'], data['content'], datetime.now().isoformat())
        )
        db.commit()
        
        comment = db.execute('''
            SELECT c.*, u.username, u.id as author_id
            FROM comments c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.id DESC LIMIT 1
        ''').fetchone()
        return jsonify(dict(comment)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """Delete a comment"""
    db = get_db()
    comment = db.execute('SELECT * FROM comments WHERE id = ?', (comment_id,)).fetchone()
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    
    db.execute('DELETE FROM comments WHERE id = ?', (comment_id,))
    db.commit()
    return jsonify({'message': 'Comment deleted'})

# ==================== FRIENDSHIP ENDPOINTS ====================

@app.route('/api/users/<int:user_id>/friends', methods=['GET'])
def get_friends(user_id):
    """Get list of friends for a user"""
    db = get_db()
    friends = db.execute('''
        SELECT u.* FROM users u
        JOIN friendships f ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
        WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = 'accepted' AND u.id != ?
    ''', (user_id, user_id, user_id)).fetchall()
    
    return jsonify([dict(f) for f in friends])

@app.route('/api/users/<int:user_id>/friend-requests', methods=['GET'])
def get_friend_requests(user_id):
    """Get pending friend requests for a user"""
    db = get_db()
    requests = db.execute('''
        SELECT u.*, f.id as request_id, f.user_id_1 as requester_id
        FROM users u
        JOIN friendships f ON f.user_id_1 = u.id
        WHERE f.user_id_2 = ? AND f.status = 'pending'
    ''', (user_id,)).fetchall()
    
    return jsonify([dict(r) for r in requests])

@app.route('/api/friendships', methods=['POST'])
def send_friend_request():
    """Send a friend request"""
    data = request.json
    user_id_1 = data.get('user_id_1')
    user_id_2 = data.get('user_id_2')
    
    if not user_id_1 or not user_id_2:
        return jsonify({'error': 'Missing user IDs'}), 400
    
    db = get_db()
    
    # Check if friendship already exists
    existing = db.execute('''
        SELECT * FROM friendships
        WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)
    ''', (user_id_1, user_id_2, user_id_2, user_id_1)).fetchone()
    
    if existing:
        return jsonify({'error': 'Friendship already exists'}), 400
    
    try:
        db.execute(
            'INSERT INTO friendships (user_id_1, user_id_2, status) VALUES (?, ?, ?)',
            (user_id_1, user_id_2, 'pending')
        )
        db.commit()
        return jsonify({'message': 'Friend request sent'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/friendships/<int:friendship_id>', methods=['PUT'])
def respond_to_friend_request(friendship_id):
    """Accept or reject a friend request"""
    data = request.json
    status = data.get('status')  # 'accepted' or 'rejected'
    
    if status not in ['accepted', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    
    db = get_db()
    friendship = db.execute('SELECT * FROM friendships WHERE id = ?', (friendship_id,)).fetchone()
    
    if not friendship:
        return jsonify({'error': 'Friendship request not found'}), 404
    
    if status == 'rejected':
        db.execute('DELETE FROM friendships WHERE id = ?', (friendship_id,))
    else:
        db.execute('UPDATE friendships SET status = ? WHERE id = ?', ('accepted', friendship_id))
    
    db.commit()
    return jsonify({'message': f'Friend request {status}'})

# ==================== FRIEND SUGGESTIONS ENDPOINTS ====================

@app.route('/api/users/<int:user_id>/suggestions', methods=['GET'])
def get_friend_suggestions(user_id):
    """Get friend suggestions based on mutual friends"""
    db = get_db()
    
    # Get user's friends
    user_friends = db.execute('''
        SELECT DISTINCT CASE
            WHEN user_id_1 = ? THEN user_id_2
            ELSE user_id_1
        END as friend_id
        FROM friendships
        WHERE (user_id_1 = ? OR user_id_2 = ?) AND status = 'accepted'
    ''', (user_id, user_id, user_id)).fetchall()
    
    friend_ids = [f['friend_id'] for f in user_friends]
    
    # Get mutual friends (friends of friends)
    if friend_ids:
        placeholders = ','.join('?' * len(friend_ids))
        suggestions = db.execute(f'''
            SELECT DISTINCT u.*, COUNT(f.id) as mutual_friends
            FROM users u
            JOIN friendships f ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
            WHERE u.id NOT IN (?, {placeholders})
            AND (f.user_id_1 IN ({placeholders}) OR f.user_id_2 IN ({placeholders}))
            AND f.status = 'accepted'
            GROUP BY u.id
            ORDER BY mutual_friends DESC
            LIMIT 10
        ''', [user_id] + friend_ids + friend_ids + friend_ids).fetchall()
    else:
        # If user has no friends, suggest popular users
        suggestions = db.execute('''
            SELECT u.*, 0 as mutual_friends
            FROM users u
            WHERE u.id != ?
            LIMIT 10
        ''', (user_id,)).fetchall()
    
    return jsonify([dict(s) for s in suggestions])

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
