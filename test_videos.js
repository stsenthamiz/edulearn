require('dotenv').config();
const { Video, User, Subject } = require('./models');

async function test() {
    // Step 1: try plain Video.findAll with no includes or order
    try {
        const videos = await Video.findAll({ limit: 2 });
        console.log('Step 1 OK - videos without join:', videos.length);
    } catch (e) { console.error('Step 1 failed:', e.message); }

    // Step 2: try plain with order by created_at
    try {
        const videos = await Video.findAll({ limit: 2, order: [['created_at', 'DESC']] });
        console.log('Step 2 OK - order by created_at:', videos.length);
    } catch (e) { console.error('Step 2 failed:', e.message); }

    // Step 3: with User join only
    try {
        const videos = await Video.findAll({
            limit: 2,
            include: [{ model: User, as: 'tutor', attributes: ['name'] }]
        });
        console.log('Step 3 OK - with User join:', videos.length);
    } catch (e) { console.error('Step 3 failed:', e.message); }

    // Step 4: with Subject join only
    try {
        const videos = await Video.findAll({
            limit: 2,
            include: [{ model: Subject, as: 'subject_data', attributes: ['name'] }]
        });
        console.log('Step 4 OK - with Subject join:', videos.length);
    } catch (e) { console.error('Step 4 failed:', e.message); }

    // Step 5: both joins with order
    try {
        const videos = await Video.findAll({
            limit: 2,
            include: [
                { model: User, as: 'tutor', attributes: ['name'] },
                { model: Subject, as: 'subject_data', attributes: ['name'] },
            ],
            order: [['created_at', 'DESC']],
        });
        console.log('Step 5 OK - full query:', videos.length);
    } catch (e) { console.error('Step 5 failed:', e.message); }

    process.exit(0);
}

test();
