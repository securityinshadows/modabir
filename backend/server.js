// Importing required modules and environment variables
const express = require('express');
const dotenv = require('dotenv').config({ path: './config/config.env' });
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const { connectToServer } = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { setSocketInstance } = require('./utils/webSocketService');

// Express app initialization
const app = express();

// Importing models
const Alert = require('./models/Alert');

// Port number for the server to listen on
const PORT = process.env.PORT || 3000;

// Importing routes
const adminRoutes = require('./routes/adminRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const routeRoutes = require('./routes/routeRoutes');
const operationRoutes = require('./routes/operationRoutes');


// Middleware to parse incoming JSON requests
app.use(express.json());

// Enabling CORS for cross-origin frontend/backend communication
app.use(cors());

// We mount the routes to the app
app.use('/api/admins', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/operations', operationRoutes);

// We create an HTTP server from the Express app
const server = http.createServer(app);

// We initialize Socket.IO with the HTTP server
const io = socketIO(server, {
  cors: {
    origin: '*', // we allow all origins for now
    methods: ['GET', 'POST'],
  },
});

// We pass the initialized socket to our websocketService
setSocketInstance(io);

// We handle new socket connections
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // We handle client disconnections
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Connect to MongoDB and start the server
connectToServer()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" Could not start server because MongoDB connection failed:", err);
    process.exit(1);
  });

// Auto-delete expired alerts every minute (for dev testing)
// Replace with hourly interval in production
setInterval(async () => {
  const { deletedCount } = await Alert.deleteMany({ 
    expiresAt: { $lte: new Date() }
  });
  console.log(` Auto-deleted ${deletedCount} expired alerts`);
}, 60000); // 60 seconds — In deployement this would change to 3600000 for hourly interval 
