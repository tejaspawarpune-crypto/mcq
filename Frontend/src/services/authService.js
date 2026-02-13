import axios from 'axios';


const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;
// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout
const logout = () => {
  localStorage.removeItem('user');
};

// Get profile
const getProfile = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.get(`${API_URL}/profile`, config);
  return response.data;
};

// Delete student
const deleteStudent = async (id, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.delete(`${API_URL}/delete-student/${id}`, config);
  return response.data;
};

const authService = { register, login, logout, getProfile, deleteStudent };
export default authService;
