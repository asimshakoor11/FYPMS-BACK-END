const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const authCommitteeRoutes = require('./src/routes/authCommitteeRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const supervisorRoutes = require('./src/routes/supervisorRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const postRoutes = require('./src/routes/posts');
const groupRoutes = require('./src/routes/groupRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');
const ZeogoCloudMeeting = require('./src/routes/ZeogoCloudMeeting');

dotenv.config();
const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());


app.use(bodyParser.json());

// Default route for testing
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/authCommittee', authCommitteeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/zeogoCloudMeeting', ZeogoCloudMeeting);

// Ensure the 'uploads' directory exists
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

const uploadsDir = path.join('/tmp', 'uploads');
// Ensure the 'uploads' directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


// Serve static files
app.use('/uploads', express.static(uploadsDir));

app.use('/api/profile', profileRoutes);

mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.log(err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
