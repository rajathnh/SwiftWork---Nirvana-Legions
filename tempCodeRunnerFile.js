 ✅ WebRTC Feature
const handleWebRTC = (socket, io) => {
  console.log("A user connected");

  socket.on("join-room", async (gigId) => {
      const usersInRoom = activeRooms[gigId] || [];

      if (usersInRoom.length === 0) {
          // ✅ First user → Offerer
          activeRooms[gigId] = [socket.id];
          console.log(`User ${socket.id} is the offerer for room ${gigId}`);
          socket.emit("offerer-ready");
      } else {
          // ✅ Second user → Answerer
          activeRooms[gigId].push(socket.id);
          console.log(`User ${socket.id} is the answerer for room ${gigId}`);

          // Notify offerer to send the offer
          io.to(activeRooms[gigId][0]).emit("start-offer");
      }
  });

  socket.on("offer", ({ gigId, offer }) => {
      const room = activeRooms[gigId];
      if (room && room.length > 1) {
          io.to(room[1]).emit("offer", { offer });
      }
  });

  socket.on("answer", ({ gigId, answer }) => {
      const room = activeRooms[gigId];
      if (room && room.length > 1) {
          io.to(room[0]).emit("answer", { answer });
      }
  });

  socket.on("ice-candidate", ({ gigId, candidate }) => {
      const room = activeRooms[gigId];
      if (room) {
          io.to(room[0]).emit("ice-candidate", { candidate });
          io.to(room[1]).emit("ice-candidate", { candidate });
      }
  });