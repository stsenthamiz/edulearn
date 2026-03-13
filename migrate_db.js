require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
});

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Find actual table name (case-insensitive check)
        const [tables] = await sequelize.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' AND tablename ILIKE 'videos'
        `);
        console.log('Tables found:', tables);

        if (tables.length === 0) {
            console.error('❌ No "Videos" or "videos" table found in the database!');
            process.exit(1);
        }

        const tableName = tables[0].tablename;
        console.log(`Using table: "${tableName}"`);

        // Get existing columns
        const [columns] = await sequelize.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = '${tableName}' AND table_schema = 'public'
        `);
        const existingCols = columns.map(c => c.column_name);
        console.log('Existing columns:', existingCols.join(', '));

        // Add missing columns
        if (!existingCols.includes('subject')) {
            await sequelize.query(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS subject VARCHAR(255)`);
            console.log('✅ Added "subject" column.');
        } else {
            console.log('ℹ️  "subject" already exists.');
        }

        if (!existingCols.includes('video_url')) {
            await sequelize.query(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS video_url VARCHAR(255)`);
            console.log('✅ Added "video_url" column.');
        } else {
            console.log('ℹ️  "video_url" already exists.');
        }

        // Count and show sample videos
        const [countRows] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        console.log(`📹 Total videos in DB: ${countRows[0].count}`);

        const [sample] = await sequelize.query(
            `SELECT id, title, "videoUrl", subject FROM "${tableName}" LIMIT 3`
        );
        console.log('Sample videos:', JSON.stringify(sample, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    }
}

migrate();
