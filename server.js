const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // 1. Handle Dice Roll
    socket.on('roll-dice', () => {
        // Generate random numbers 1-6
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        
        // Broadcast result to everyone
        io.emit('dice-result', {
            player: socket.id.substr(0, 4), // Short ID
            die1: die1,
            die2: die2,
            total: die1 + die2
        });
    });

    // 2. Handle Voice (Push-to-Talk)
    socket.on('voice-message', (audioData) => {
        // Send audio to everyone EXCEPT the sender
        socket.broadcast.emit('play-voice', {
            id: socket.id,
            audio: audioData
        });
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
    });
});

// Railway provides the PORT environment variable
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});