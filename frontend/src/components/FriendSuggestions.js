import React, { useState, useEffect } from 'react';
import { friendshipAPI } from '../api';

function FriendSuggestions({ currentUser, onFriendAdded }) {
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [currentUser]);

  const loadSuggestions = async () => {
    try {
      const response = await friendshipAPI.getSuggestions(currentUser.id);
      setSuggestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (suggestedUserId) => {
    try {
      await friendshipAPI.sendRequest(currentUser.id, suggestedUserId);
      setPendingRequests((prev) => ({ ...prev, [suggestedUserId]: true }));
      setTimeout(() => {
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestedUserId));
      }, 500);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert('Error sending friend request: ' + errorMessage);
    }
  };

  if (loading) {
    return <div className="empty-message">Loading suggestions...</div>;
  }

  return (
    <div>
      <h3 style={{ marginBottom: '15px', color: '#667eea' }}>
        ⭐ Suggested Friends ({suggestions.length})
      </h3>

      {suggestions.length === 0 ? (
        <div className="empty-message">
          No more suggestions available at this time.
        </div>
      ) : (
        <div className="friends-container">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="friend-card">
              <div className="friend-avatar">
                {suggestion.username.charAt(0).toUpperCase()}
              </div>
              <div className="friend-name">{suggestion.username}</div>
              <div className="friend-email">{suggestion.email}</div>
              {suggestion.bio && (
                <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '8px' }}>
                  {suggestion.bio}
                </div>
              )}
              {suggestion.mutual_friends > 0 && (
                <div className="mutual-friends">
                  🤝 {suggestion.mutual_friends} mutual friend
                  {suggestion.mutual_friends !== 1 ? 's' : ''}
                </div>
              )}
              <div className="friend-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSendFriendRequest(suggestion.id)}
                  disabled={pendingRequests[suggestion.id]}
                  style={{
                    opacity: pendingRequests[suggestion.id] ? 0.6 : 1,
                    cursor: pendingRequests[suggestion.id] ? 'not-allowed' : 'pointer',
                  }}
                >
                  {pendingRequests[suggestion.id] ? '⏳ Pending' : '➕ Add Friend'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendSuggestions;
