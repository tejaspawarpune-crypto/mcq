import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL / api / tests;
// Create a new test
const createTest = async (testData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, testData, config);
  return response.data;
};

// Get all tests
const getTests = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};


// Get a single test by its ID
const getTestById = async (testId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + testId, config);
  return response.data;
};


//delete test by id
const deleteTestById = async (testId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // This URL is simpler and follows the standard REST pattern.
  const response = await axios.delete(API_URL + testId, config);
  return response.data;
};

// Get the results for a specific test (submitted and not-submitted students)
const getTestResults = async (testId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // This calls the new backend route: GET /api/tests/:id/results
  const response = await axios.get(API_URL + testId + '/results', config);
  return response.data;
};

// --- NEW FUNCTION TO DOWNLOAD RESULTS ---
const downloadResults = async (testId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob', // This is crucial for handling file downloads
  };
  // This calls the new backend route: GET /api/tests/:id/results/download
  const response = await axios.get(API_URL + testId + '/results/download', config);
  return response.data; // The response data will be the Excel file itself
};


const testService = {
  createTest,
  getTests,
  getTestById,
  deleteTestById,
  getTestResults,
  downloadResults // Export the new function
};

export default testService;
