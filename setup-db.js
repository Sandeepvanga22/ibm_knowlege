require('dotenv').config();
const { initializeDatabase } = require('./server/utils/database');

async function setupDatabase() {
    try {
        console.log('🗄️  Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

setupDatabase(); 