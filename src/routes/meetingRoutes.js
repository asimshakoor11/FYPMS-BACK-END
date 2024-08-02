const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const router = express.Router();
const ZoomMeetingSchema = require('../models/ZoomMeeting');

// Replace with your credentials
const clientId = 'zswGgOp9SDenOe_J82M7DQ';
const clientSecret = '78I12hD1p3HPEGQglaSt0z44y7rYjrvw';
const accountId = '-7VRM8MjQg6k_miqJwIt4A';

// Function to get access token
const getAccessToken = async () => {
  const tokenResponse = await axios.post('https://zoom.us/oauth/token', qs.stringify({
    grant_type: 'account_credentials',
    account_id: accountId
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    }
  });
  return tokenResponse.data.access_token;
};

// Schedule a meeting
router.post('/schedule-meeting', async (req, res) => {
  const { topic, start_time, duration, number } = req.body;

  try {
    const accessToken = await getAccessToken();
    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
      topic: topic,
      type: 2, // Scheduled meeting
      start_time: start_time,
      duration: duration,
      timezone: 'Asia/Karachi' // Setting the timezone to Islamabad, Pakistan
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const { join_url } = response.data;

    // Find existing meeting document or create a new one
    let meeting = await ZoomMeetingSchema.findOne({ number: number });
    if (meeting) {
      // Add new meeting to the existing document
      meeting.meetings.push({
        topic,
        start_time,
        duration,
        join_url
      });
    } else {
      // Create a new document if none exists
      meeting = new ZoomMeetingSchema({
        number: number,
        meetings: [{
          topic,
          start_time,
          duration,
          join_url
        }]
      });
    }

    await meeting.save();
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});



// Get meeting details
router.get('/meeting-details/:id', async (req, res) => {
  const id = req.params.id
  try {
    const meeting = await ZoomMeetingSchema.findOne({ number: id });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
