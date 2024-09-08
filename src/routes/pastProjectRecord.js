// routes/pastGroupRoutes.js
const express = require('express');
const router = express.Router();
const { storePastGroupRecord, getPastGroupRecords, deleteRecord } = require('../controllers/pastProjectsController');

// Route to store past group record
router.post('/past-projects', storePastGroupRecord);

// Route to fetch all past group records
router.get('/past-groups', getPastGroupRecords);

router.delete('/past-groups/:id', deleteRecord);

module.exports = router;
