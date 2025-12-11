import React, { useState, useEffect } from 'react';
import { friendshipAPI } from '../api';

function Friends({ currentUser }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    const interval = setInterval(() => {
      loadFriends();
      loadFriendRequests();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadFriends = async () => {
    try {
      const response = await friendshipAPI.getFriends(currentUser.id);
      setFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await friendshipAPI.getFriendRequests(currentUser.id);
      setFriendRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendshipAPI.respondToRequest(requestId, 'accepted');
      loadFriendRequests();
      loadFriends();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert('Error accepting request: ' + errorMessage);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendshipAPI.respondToRequest(requestId, 'rejected');
      loadFriendRequests();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert('Error rejecting request: ' + errorMessage);
    }
  };

  if (loading) {
    return <div className="empty-message">Loading...</div>;
  }

  return (
    <div>
      {friendRequests.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#667eea' }}>
            ⭐ Friend Requests ({friendRequests.length})
          </h3>
          <div className="friends-container">
            {friendRequests.map((request) => (
              <div key={request.id} className="friend-card">
                <div className="friend-avatar">{request.username.charAt(0).toUpperCase()}</div>
                <div className="friend-name">{request.username}</div>
                <div className="friend-email">{request.email}</div>
                {request.bio && (
                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>
                    {request.bio}
                  </div>
                )}
                <div className="friend-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleAcceptRequest(request.request_id)}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRejectRequest(request.request_id)}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: '15px', color: '#667eea' }}>
          👥 Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <div className="empty-message">No friends yet. Start adding friends!</div>
        ) : (
          <div className="friends-container">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <div className="friend-avatar">{friend.username.charAt(0).toUpperCase()}</div>
                <div className="friend-name">{friend.username}</div>
                <div className="friend-email">{friend.email}</div>
                {friend.bio && (
                  <div style={{ fontSize: '0.85em', color: '#666' }}>{friend.bio}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
