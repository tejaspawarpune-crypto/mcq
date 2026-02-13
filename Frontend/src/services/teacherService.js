// In frontend/src/services/teacherService.js
import axios from 'axios';


const API_URL = `${import.meta.env.VITE_API_URL}/api/users/`;

// Get all students (requires teacher token)
const getStudents = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'getStudents', config);
  return response.data;
};

// --- ADD THIS NEW FUNCTION ---
// Update a student's status (approve/reject)
const updateStudentStatus = async (studentId, status, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Make a PUT request to update the status
  const response = await axios.put(
    API_URL + `${studentId}/status`,
    { status: status }, // The request body containing the new status
    config
  );
  return response.data;
};

// Delete a student by ID
const deleteStudent = async (studentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + `delete-student/${studentId}`, config);
  return response.data;
};

// Create a new teacher account
const addTeacher = async (teacherData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // This calls the backend route: POST /api/users/add-teacher
  const response = await axios.post(API_URL + 'add-teacher', teacherData, config);
  return response.data;
};



const teacherService = {
  getStudents,
  updateStudentStatus, // <-- Add the new function to the export
  deleteStudent,
  addTeacher,
};
export default teacherService;
