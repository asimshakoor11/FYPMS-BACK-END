


const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const MeetingZegoCloud = require('../models/MeetingZegoCloud');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const ASSEMBLYAI_API_KEY = '1f6a8e824e7d48c18868336adb82cc94';
const GOOGLE_API_KEY = 'AIzaSyANx7eJWN7B_eg_bBCg3gLTFANclJ5G1ts';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const { meetingAgenda, number } = req.body;
    const audioFilePath = req.file.path;

    // Upload audio file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(audioFilePath, {
      resource_type: 'video',
      public_id: `meeting-audio/${Date.now()}`
    });

    const audioUrl = cloudinaryResponse.secure_url;

    // Upload audio file to AssemblyAI
    const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', fs.createReadStream(audioFilePath), {
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'audio/wav',
      },
    });

    const assemblyAudioUrl = uploadResponse.data.upload_url;

    // Request transcription
    const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
      audio_url: assemblyAudioUrl,
    }, {
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
    });

    const transcriptId = transcriptResponse.data.id;

    // Poll AssemblyAI for transcription result
    let transcription = '';
    let isTranscriptionReady = false;

    while (!isTranscriptionReady) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
        },
      });

      if (statusResponse.data.status === 'completed') {
        transcription = statusResponse.data.text;
        isTranscriptionReady = true;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error('Transcription failed');
      }
    }

    // Generate summary using Google Generative AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize and refine the text with, precise sentences. remove extra things and also make bullets, there is no needs for formalities: ${transcription}`;
    const result = await model.generateContent(prompt);

    // Log the result for debugging

    // Extract the summary text from the response
    const summary = result.response.text();

    // Clean up uploaded file from local storage
    fs.unlinkSync(audioFilePath);

    // Find or create the group
    let meetingRecord = await MeetingZegoCloud.findOne({ number });
    if (!meetingRecord) {
      meetingRecord = new MeetingZegoCloud({ number, meetings: [] });
    }

    // Add the new meeting to the group
    meetingRecord.meetings.push({ meetingAgenda, transcription, summary, audioUrl, date: new Date() });
    await meetingRecord.save();

    res.json({ transcription, summary, audioUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

router.get('/data/:number', async (req, res) => {
  const { number } = req.params;

  try {
    const meetingRecord = await MeetingZegoCloud.findOne({ number });
    if (!meetingRecord) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(meetingRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;
