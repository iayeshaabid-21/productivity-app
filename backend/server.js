require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');


const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/productivity-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

//all the routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/test', (req, res) => {
  res.json({ message: "Backend is running!" });
});

// socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('send_message', (messageData) => {
    io.to(messageData.receiverId).emit('receive_message', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});