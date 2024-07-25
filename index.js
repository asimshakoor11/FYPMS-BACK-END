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

dotenv.config();
const app = express();

// CORS configuration
// const corsOptions = {
//   origin: "https://fypms-front-end.vercel.app",
//   // origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Enable pre-flight requests for all routes




app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());

// app.use((req,res,next)=>{
//   res.setHeader("Access-Control-Allow-Origin","https://fypms-front-end.vercel.app");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   next();
// })

// app.use(cors(
//   {
//     origin: ["https://fypms-front-end.vercel.app"],
//     methods: ["POST", "GET", "PUT", "DELETE"],
//     credentials: true
//   }
// ))


// CORS configuration
// const allowedOrigins = ['https://fypms-front-end.vercel.app', 'http://localhost:3000']; // Add your frontend URL here
// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true
// }));


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
