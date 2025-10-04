const http = require('http');
const knex = require('./config/db');

async function comprehensiveTest() {
  console.log('🔍 Comprehensive Backend Test\n');

  // Test 1: Database connection and columns
  console.log('1. Testing Database...');
  try {
    const filesColumns = await knex.raw('DESCRIBE files');
    const foldersColumns = await knex.raw('DESCRIBE folders');
    
    const filesHasFav = filesColumns[0].find(col => col.Field === 'is_faviourite');
    const filesHasDel = filesColumns[0].find(col => col.Field === 'is_deleted');
    const foldersHasFav = foldersColumns[0].find(col => col.Field === 'is_faviourite');
    const foldersHasDel = foldersColumns[0].find(col => col.Field === 'is_deleted');
    
    console.log(`   Files - is_faviourite: ${filesHasFav ? '✅' : '❌'}, is_deleted: ${filesHasDel ? '✅' : '❌'}`);
    console.log(`   Folders - is_faviourite: ${foldersHasFav ? '✅' : '❌'}, is_deleted: ${foldersHasDel ? '✅' : '❌'}`);
  } catch (error) {
    console.log('   ❌ Database error:', error.message);
  }

  // Test 2: Check if server is running
  console.log('\n2. Testing Server Connection...');
  try {
    const response = await makeRequest('http://localhost:3000/api/health', 'GET', {});
    console.log(`   ✅ Server is running (${response.status})`);
  } catch (error) {
    console.log('   ❌ Server not running:', error.message);
    console.log('   💡 Start server with: npm start');
    return;
  }

  // Test 3: Test basic endpoints
  console.log('\n3. Testing Basic Endpoints...');
  const basicEndpoints = [
    { method: 'GET', path: '/api/files', name: 'Get Files' },
    { method: 'GET', path: '/api/folders', name: 'Get Folders' }
  ];

  for (const endpoint of basicEndpoints) {
    try {
      const response = await makeRequest(`http://localhost:3000${endpoint.path}`, endpoint.method, {});
      if (response.status === 401) {
        console.log(`   ✅ ${endpoint.name}: Working (401 - Auth required)`);
      } else {
        console.log(`   ⚠️ ${endpoint.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // Test 4: Test new endpoints
  console.log('\n4. Testing New Favourite/Trash Endpoints...');
  const newEndpoints = [
    { method: 'POST', path: '/api/files/1/favourite/toggle', name: 'Toggle File Favourite' },
    { method: 'GET', path: '/api/files/favourites', name: 'Get File Favourites' },
    { method: 'GET', path: '/api/files/trash', name: 'Get File Trash' },
    { method: 'POST', path: '/api/folders/1/favourite/toggle', name: 'Toggle Folder Favourite' },
    { method: 'GET', path: '/api/folders/favourites', name: 'Get Folder Favourites' },
    { method: 'GET', path: '/api/folders/trash', name: 'Get Folder Trash' }
  ];

  for (const endpoint of newEndpoints) {
    try {
      const response = await makeRequest(`http://localhost:3000${endpoint.path}`, endpoint.method, {});
      if (response.status === 401) {
        console.log(`   ✅ ${endpoint.name}: Working (401 - Auth required)`);
      } else if (response.status === 404) {
        console.log(`   ❌ ${endpoint.name}: Not found (404)`);
      } else {
        console.log(`   ⚠️ ${endpoint.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // Test 5: Test with authentication (fake token)
  console.log('\n5. Testing with Authentication...');
  try {
    const response = await makeRequest('http://localhost:3000/api/files/1/favourite/toggle', 'POST', {
      'Authorization': 'Bearer fake-token',
      'Content-Type': 'application/json'
    });
    
    if (response.status === 401) {
      console.log('   ✅ Auth middleware working (401 - Invalid token)');
    } else if (response.status === 403) {
      console.log('   ✅ Permission middleware working (403 - Forbidden)');
    } else {
      console.log(`   ⚠️ Unexpected auth response: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Auth test error: ${error.message}`);
  }

  // Test 6: Test database operations directly
  console.log('\n6. Testing Database Operations...');
  try {
    // Test file update
    const testFile = await knex('files').where('id', 9).first();
    if (testFile) {
      console.log(`   Current file state: is_faviourite=${testFile.is_faviourite}, is_deleted=${testFile.is_deleted}`);
      
      const updateResult = await knex('files')
        .where('id', 9)
        .update({ is_faviourite: testFile.is_faviourite ? 0 : 1 });
      
      console.log(`   ✅ Database update successful: ${updateResult} row(s) affected`);
      
      const updatedFile = await knex('files').where('id', 9).first();
      console.log(`   Updated file state: is_faviourite=${updatedFile.is_faviourite}, is_deleted=${updatedFile.is_deleted}`);
    } else {
      console.log('   ⚠️ No test file found (ID 9)');
    }
  } catch (error) {
    console.log(`   ❌ Database operation error: ${error.message}`);
  }

  console.log('\n📊 Summary:');
  console.log('- If you see 401 errors, the routes are working but need authentication');
  console.log('- If you see 404 errors, the routes are not registered properly');
  console.log('- If you see 403 errors, the permission system is working');
  console.log('- Database operations should work regardless of server status');

  await knex.destroy();
}

function makeRequest(url, method, headers) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

comprehensiveTest();
