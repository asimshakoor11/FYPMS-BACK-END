// controllers/pastGroupController.js
const PastGroup = require('../models/PastProjectsRecord');

exports.storePastGroupRecord = async (req, res) => {
    try {
        const {groupNumber, members, supervisor, projectTitle } = req.body;

        const newPastGroup = new PastGroup({
            groupNumber,
            members,
            supervisor,
            projectTitle,
        });

        await newPastGroup.save();

        res.status(201).json({
            success: true,
            data: newPastGroup,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error storing past group record.',
        });
    }
};

exports.getPastGroupRecords = async (req, res) => {
    try {
        const pastGroups = await PastGroup.find().populate('members supervisor'); // Populate members and supervisor details if necessary
        res.status(200).json({
            success: true,
            data: pastGroups,
        });
    } catch (error) {
        console.error('Error fetching past group records:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching past group records.',
        });
    }
};

// DELETE /api/past-groups/:id - Delete a group by ID
exports.deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await PastGroup.findByIdAndDelete(id);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

