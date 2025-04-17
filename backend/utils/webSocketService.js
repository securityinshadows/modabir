// We declare a variable to hold our Socket.IO instance
let io = null;

// We store the socket instance when the server starts
// This is called once from server.js after Socket.IO is initialized
function setSocketInstance(socketInstance) {
  io = socketInstance;
}

// We broadcast events to all connected clients
// This is used in other modules like trendingMonitor to trigger real-time updates
function broadcast(eventName, data) {
  // If the socket instance hasn't been set yet, we exit safely
  if (!io) {
    console.warn(`WebSocket not initialized - cannot emit event '${eventName}'`);
    return;
  }

  // We emit the event to ALL connected clients using Socket.IO
  io.emit(eventName, data);
}

// We optionally expose other socket-related helpers in the future here

module.exports = {
  setSocketInstance,
  broadcast,
};
