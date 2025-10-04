const db = require("./config/db");

async function testDB() {
  try {
    console.log("Testing database connection...");
    
    // Check if permissions table exists and get its structure
    const result = await db.raw("SHOW COLUMNS FROM permissions");
    console.log("Permissions table columns:");
    console.log(result[0]);
    
    // Test a simple permission insert
    const testPermission = {
      user_id: 1,
      resource_id: 1,
      resource_type: "folder",
      can_read: true,
      can_download: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log("Testing permission insert...");
    const [id] = await db("permissions").insert(testPermission);
    console.log("Permission inserted with ID:", id);
    
    // Clean up test data
    await db("permissions").where({ id }).del();
    console.log("Test permission deleted");
    
    console.log("Database test completed successfully!");
  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    process.exit(0);
  }
}

testDB();
