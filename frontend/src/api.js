import axios from 'axios';

// Use environment variable or fallback to same-origin API path in production
// For development you can set REACT_APP_API_URL (e.g. http://localhost:5000/api)
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Helpful debug log in development only
if (process.env.NODE_ENV !== 'production') {
  console.log('API URL:', API_URL);
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  getAll: () => apiClient.get('/users'),
  getOne: (id) => apiClient.get(`/users/${id}`),
  create: (userData) => apiClient.post('/users', userData),
  update: (id, userData) => apiClient.put(`/users/${id}`, userData),
};

// Post API
export const postAPI = {
  getAll: () => apiClient.get('/posts'),
  getOne: (id) => apiClient.get(`/posts/${id}`),
  create: (postData) => apiClient.post('/posts', postData),
  delete: (id) => apiClient.delete(`/posts/${id}`),
};

// Comment API
export const commentAPI = {
  create: (postId, commentData) => apiClient.post(`/posts/${postId}/comments`, commentData),
  delete: (id) => apiClient.delete(`/comments/${id}`),
};

// Friendship API
export const friendshipAPI = {
  getFriends: (userId) => apiClient.get(`/users/${userId}/friends`),
  getFriendRequests: (userId) => apiClient.get(`/users/${userId}/friend-requests`),
  sendRequest: (userId1, userId2) => apiClient.post('/friendships', { user_id_1: userId1, user_id_2: userId2 }),
  respondToRequest: (requestId, status) => apiClient.put(`/friendships/${requestId}`, { status }),
  getSuggestions: (userId) => apiClient.get(`/users/${userId}/suggestions`),
};

export default apiClient;
