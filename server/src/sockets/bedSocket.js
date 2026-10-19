let ioInstance = null;

/**
 * Setup Socket.IO server and handlers.
 * @param {import('socket.io').Server} io
 */
export const setupSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client joins a room specific to a hospital (for live bed/doctor status)
    socket.on('join:hospital', (hospitalId) => {
      if (hospitalId) {
        socket.join(`hospital:${hospitalId}`);
      }
    });

    // Client leaves the room
    socket.on('leave:hospital', (hospitalId) => {
      if (hospitalId) {
        socket.leave(`hospital:${hospitalId}`);
      }
    });

    socket.on('disconnect', () => {
      // Cleaned up automatically
    });
  });
};

/**
 * Broadcast bed updates to all clients watching a hospital.
 * @param {string} hospitalId
 * @param {object} bedData
 */
export const emitBedUpdate = (hospitalId, bedData) => {
  if (ioInstance) {
    // Broadcast to room and also global live dashboard
    ioInstance.to(`hospital:${hospitalId}`).emit('bed:update', { hospitalId, beds: bedData });
    ioInstance.emit('global:bed:update', { hospitalId, beds: bedData });
  }
};

/**
 * Broadcast doctor status changes.
 * @param {string} hospitalId
 * @param {object} doctorData
 */
export const emitDoctorStatus = (hospitalId, doctorData) => {
  if (ioInstance) {
    ioInstance.to(`hospital:${hospitalId}`).emit('doctor:status', { hospitalId, doctor: doctorData });
    ioInstance.emit('global:doctor:status', { hospitalId, doctor: doctorData });
  }
};
