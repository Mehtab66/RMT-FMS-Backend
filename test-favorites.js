const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rmt_fms',
    port: process.env.DB_PORT || 3306,
  },
});

async function testFavorites() {
  try {
    console.log('🔍 Testing Favorites Data...\n');
    
    // Check favorite folders
    console.log('📁 Favorite Folders:');
    const favoriteFolders = await knex('folders')
      .where({ is_faviourite: true, is_deleted: false })
      .select('id', 'name', 'parent_id', 'is_faviourite');
    console.log(favoriteFolders);
    
    // Check favorite files
    console.log('\n📄 Favorite Files:');
    const favoriteFiles = await knex('files')
      .where({ is_faviourite: true, is_deleted: false })
      .select('id', 'name', 'folder_id', 'is_faviourite');
    console.log(favoriteFiles);
    
    // Check files in favorite folders
    console.log('\n📁 Files in Favorite Folders:');
    const filesInFavoriteFolders = await knex('files')
      .join('folders', 'files.folder_id', 'folders.id')
      .where('folders.is_faviourite', true)
      .where('folders.is_deleted', false)
      .where('files.is_deleted', false)
      .select('files.id', 'files.name', 'files.folder_id', 'files.is_faviourite', 'folders.name as folder_name');
    console.log(filesInFavoriteFolders);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await knex.destroy();
  }
}

testFavorites();
