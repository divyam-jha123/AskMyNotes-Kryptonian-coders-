require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { clerkMiddleware } = require('@clerk/express');
const userRoutes = require('./routes/user');
const connectDb = require('./db/connection');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/user', userRoutes);

const startServer = async () => {
  await connectDb(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();