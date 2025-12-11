import React, { useState, useEffect } from 'react';
import { postAPI, commentAPI } from '../api';

function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [expandedPosts, setExpandedPosts] = useState({});
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    loadPosts();
    const interval = setInterval(loadPosts, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postAPI.getAll();
      setPosts(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) {
      alert('Post cannot be empty');
      return;
    }
    try {
      await postAPI.create({
        user_id: currentUser.id,
        content: newPost,
      });
      setNewPost('');
      loadPosts();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert('Error creating post: ' + errorMessage);
    }
  };

  const handleToggleComments = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = async (postId) => {
    const commentText = newComments[postId];
    if (!commentText?.trim()) {
      alert('Comment cannot be empty');
      return;
    }
    try {
      await commentAPI.create(postId, {
        user_id: currentUser.id,
        content: commentText,
      });
      setNewComments((prev) => ({ ...prev, [postId]: '' }));
      loadPosts();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert('Error adding comment: ' + errorMessage);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await commentAPI.delete(commentId);
        loadPosts();
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        alert('Error deleting comment: ' + errorMessage);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Delete this post?')) {
      try {
        await postAPI.delete(postId);
        loadPosts();
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        alert('Error deleting post: ' + errorMessage);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div>
      <div className="post-form">
        <textarea
          placeholder={`What's on your mind, ${currentUser.username}?`}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreatePost}>
          📝 Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="empty-message">No posts yet. Be the first to post!</div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="card">
            <div className="card-header">
              <div className="card-avatar">{post.username.charAt(0).toUpperCase()}</div>
              <div>
                <div className="card-title">{post.username}</div>
                <div className="card-meta">{formatDate(post.created_at)}</div>
              </div>
            </div>

            <div className="card-content">{post.content}</div>

            <div className="card-actions">
              <button
                className="btn-secondary"
                onClick={() => handleToggleComments(post.id)}
              >
                💬 {post.comments?.length || 0} Comments
              </button>
              {post.user_id === currentUser.id && (
                <button
                  className="btn-danger"
                  onClick={() => handleDeletePost(post.id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>

            {expandedPosts[post.id] && (
              <div className="comments-section">
                <div className="comments-title">Comments</div>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <span className="comment-author">{comment.username}</span>
                        <span className="comment-time">{formatDate(comment.created_at)}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                      {comment.user_id === currentUser.id && (
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#999', marginBottom: '10px' }}>No comments yet</p>
                )}

                <div className="comment-form">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComments[post.id] || ''}
                    onChange={(e) =>
                      setNewComments((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddComment(post.id);
                      }
                    }}
                  />
                  <button
                    className="btn-success"
                    onClick={() => handleAddComment(post.id)}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;
