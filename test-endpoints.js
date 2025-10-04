// test-endpoints.js - Simple test script for the new endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  username: 'testuser',
  password: 'testpass'
};

let authToken = '';

async function testEndpoints() {
  try {
    console.log('🧪 Testing new favourites and trash endpoints...\n');

    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Test file favourites endpoints
    console.log('2. Testing file favourites endpoints...');
    
    // Get favourite files
    try {
      const favFilesResponse = await axios.get(`${API_BASE_URL}/files/favourites`, { headers });
      console.log(`✅ GET /files/favourites - Found ${favFilesResponse.data.files.length} favourite files`);
    } catch (error) {
      console.log('❌ GET /files/favourites failed:', error.response?.data || error.message);
    }

    // Get trash files
    try {
      const trashFilesResponse = await axios.get(`${API_BASE_URL}/files/trash`, { headers });
      console.log(`✅ GET /files/trash - Found ${trashFilesResponse.data.files.length} deleted files`);
    } catch (error) {
      console.log('❌ GET /files/trash failed:', error.response?.data || error.message);
    }

    // 3. Test folder favourites endpoints
    console.log('\n3. Testing folder favourites endpoints...');
    
    // Get favourite folders
    try {
      const favFoldersResponse = await axios.get(`${API_BASE_URL}/folders/favourites`, { headers });
      console.log(`✅ GET /folders/favourites - Found ${favFoldersResponse.data.folders.length} favourite folders`);
    } catch (error) {
      console.log('❌ GET /folders/favourites failed:', error.response?.data || error.message);
    }

    // Get trash folders
    try {
      const trashFoldersResponse = await axios.get(`${API_BASE_URL}/folders/trash`, { headers });
      console.log(`✅ GET /folders/trash - Found ${trashFoldersResponse.data.folders.length} deleted folders`);
    } catch (error) {
      console.log('❌ GET /folders/trash failed:', error.response?.data || error.message);
    }

    // 4. Test toggle endpoints (if we have files/folders)
    console.log('\n4. Testing toggle endpoints...');
    
    // Try to toggle a file favourite (this will fail if no files exist, which is expected)
    try {
      const toggleFileResponse = await axios.post(`${API_BASE_URL}/files/1/favourite/toggle`, {}, { headers });
      console.log('✅ POST /files/1/favourite/toggle - Success');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️  POST /files/1/favourite/toggle - No file with ID 1 (expected)');
      } else {
        console.log('❌ POST /files/1/favourite/toggle failed:', error.response?.data || error.message);
      }
    }

    // Try to toggle a folder favourite
    try {
      const toggleFolderResponse = await axios.post(`${API_BASE_URL}/folders/1/favourite/toggle`, {}, { headers });
      console.log('✅ POST /folders/1/favourite/toggle - Success');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️  POST /folders/1/favourite/toggle - No folder with ID 1 (expected)');
      } else {
        console.log('❌ POST /folders/1/favourite/toggle failed:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 All endpoint tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the migration: npx knex migrate:latest');
    console.log('2. Start the backend: npm start');
    console.log('3. Start the frontend: npm run dev');
    console.log('4. Test the heart icons and favourites/trash tabs in the UI');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the tests
testEndpoints();
