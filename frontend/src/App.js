import React, { useState, useEffect } from 'react';
import { userAPI } from './api';
import './App.css';
import Feed from './components/Feed';
import UserProfile from './components/UserProfile';
import Friends from './components/Friends';
import FriendSuggestions from './components/FriendSuggestions';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', email: '', bio: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
      if (response.data.length > 0 && !currentUser) {
        setCurrentUser(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.email) {
      alert('Please fill in username and email');
      return;
    }
    try {
      const response = await userAPI.create(newUserData);
      if (response.data && response.data.id) {
        setUsers([...users, response.data]);
        setNewUserData({ username: '', email: '', bio: '' });
        setShowCreateUser(false);
        setCurrentUser(response.data);
        setActiveTab('feed');
      } else {
        alert('Error creating user: Invalid response from server');
      }
    } catch (error) {
      console.error('User creation error:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid user data. Username or email may already exist.';
      } else if (error.response?.status) {
        errorMessage = `Server error (${error.response.status})`;
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Network error: Cannot connect to server. Make sure the backend is running on localhost:5000';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error creating user: ' + errorMessage);
    }
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    setActiveTab('feed');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌐 Social Network</h1>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <div className="user-selector">
            <h3>Users</h3>
            <div className="users-list">
              {users.map((user) => (
                <button
                  key={user.id}
                  className={`user-button ${currentUser?.id === user.id ? 'active' : ''}`}
                  onClick={() => handleSwitchUser(user)}
                >
                  <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
                  <span>{user.username}</span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateUser(!showCreateUser)}
            >
              {showCreateUser ? '❌ Cancel' : '➕ New User'}
            </button>

            {showCreateUser && (
              <form className="create-user-form" onSubmit={handleCreateUser}>
                <input
                  type="text"
                  placeholder="Username"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                />
                <textarea
                  placeholder="Bio (optional)"
                  value={newUserData.bio}
                  onChange={(e) => setNewUserData({ ...newUserData, bio: e.target.value })}
                />
                <button type="submit" className="btn btn-success">Create User</button>
              </form>
            )}
          </div>
        </aside>

        <main className="main-content">
          {currentUser ? (
            <>
              <nav className="tabs">
                <button
                  className={`tab ${activeTab === 'feed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feed')}
                >
                  📰 Feed
                </button>
                <button
                  className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  👤 Profile
                </button>
                <button
                  className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('friends')}
                >
                  👥 Friends
                </button>
                <button
                  className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('suggestions')}
                >
                  ⭐ Suggestions
                </button>
              </nav>

              <div className="tab-content">
                {activeTab === 'feed' && <Feed currentUser={currentUser} />}
                {activeTab === 'profile' && <UserProfile user={currentUser} onUserUpdate={(updatedUser) => setCurrentUser(updatedUser)} />}
                {activeTab === 'friends' && <Friends currentUser={currentUser} />}
                {activeTab === 'suggestions' && <FriendSuggestions currentUser={currentUser} onFriendAdded={() => setActiveTab('friends')} />}
              </div>
            </>
          ) : (
            <div className="no-user">
              <p>No users found. Please create one!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
