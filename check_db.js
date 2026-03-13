const { sequelize } = require('./models');

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Videos' OR table_name = 'videos'
        `);
        console.log('Columns in Videos table:', JSON.stringify(results, null, 2));
        
        const [subjects] = await sequelize.query(`SELECT count(*) FROM "Subjects"`);
        console.log('Total subjects:', subjects[0].count);
        
        const [videos] = await sequelize.query(`SELECT count(*) FROM "Videos"`);
        console.log('Total videos:', videos[0].count);
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
