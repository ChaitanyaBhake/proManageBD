const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/configureDB');

// CORS configuration
const corsOptions = {
  credentials: true,
  origin: 'http://localhost:5173',
};

// Enable CORS with configured options
app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

connectDB();
app.get('/', (req, res) => {
  res.send('Hello world');
});

app.get('/api/v1/', (req, res) => {
  return res.status(200).send('This is v1 of server');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/task', taskRoutes);

app.listen(process.env.PORT, (req, res) => {
  console.log(`Server is Running on ${process.env.PORT}`);
});
