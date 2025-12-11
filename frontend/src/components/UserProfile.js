import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';

function UserProfile({ user, onUserUpdate }) {
  const [formData, setFormData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.update(user.id, formData);
      onUserUpdate(response.data);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      setMessage('Error updating profile: ' + errorMessage);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  return (
    <div>
      {message && (
        <div
          style={{
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '6px',
            backgroundColor: message.includes('Error') ? '#fee' : '#efe',
            color: message.includes('Error') ? '#c33' : '#3c3',
          }}
        >
          {message}
        </div>
      )}

      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p>📧 {user.email}</p>
            <p>🕐 Joined {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {!isEditing && (
          <>
            <div style={{ marginBottom: '15px', color: '#555', lineHeight: '1.6' }}>
              <strong>Bio:</strong>
              <p>{user.bio || 'No bio added yet'}</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
              style={{ width: '200px' }}
            >
              ✏️ Edit Profile
            </button>
          </>
        )}

        {isEditing && (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                💾 Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                style={{ flex: 1 }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
