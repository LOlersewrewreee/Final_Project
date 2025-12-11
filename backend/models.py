from datetime import datetime

class User:
    def __init__(self, username, email, bio=''):
        self.username = username
        self.email = email
        self.bio = bio
        self.created_at = datetime.now()

class Post:
    def __init__(self, user_id, content):
        self.user_id = user_id
        self.content = content
        self.created_at = datetime.now()

class Comment:
    def __init__(self, post_id, user_id, content):
        self.post_id = post_id
        self.user_id = user_id
        self.content = content
        self.created_at = datetime.now()

class Friendship:
    def __init__(self, user_id_1, user_id_2, status='pending'):
        self.user_id_1 = user_id_1
        self.user_id_2 = user_id_2
        self.status = status
        self.created_at = datetime.now()
