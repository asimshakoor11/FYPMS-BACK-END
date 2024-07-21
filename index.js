const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
// const mongoose = require('./src/config/db.config');
const authCommitteeRoutes = require('./src/routes/authCommitteeRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const supervisorRoutes = require('./src/routes/supervisorRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const postRoutes = require('./src/routes/posts');

const groupRoutes = require('./src/routes/groupRoutes');


dotenv.config();

const app = express();


// CORS configuration
const allowedOrigins = ['http://localhost:5173', 'http://your-frontend-domain.com']; // Add your frontend URL here
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


app.use(bodyParser.json());

// Default route for testing
app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.use('/api/authCommittee', authCommitteeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/posts', postRoutes);
app.use('/api/groups', groupRoutes);

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
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
