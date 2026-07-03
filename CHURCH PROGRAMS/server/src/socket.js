module.exports = function(io){
  io.on('connection', (socket)=>{
    console.log('socket connected', socket.id);
    socket.on('join-room', (roomId)=>{ socket.join(roomId); });
    socket.on('leave-room', (roomId)=>{ socket.leave(roomId); });
    socket.on('message', (payload)=>{
      // payload: { roomId, message }
      if(payload && payload.roomId){
        io.to(payload.roomId).emit('message', payload);
      }
    });
    socket.on('signal', (data)=>{
      // simple signaling forward
      if(data && data.to){
        io.to(data.to).emit('signal', { from: socket.id, data: data.data });
      }
    });
    socket.on('disconnect', ()=>{ console.log('socket disconnected', socket.id); });
  });
};
