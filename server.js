const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // 1. Handle Dice Roll
    socket.on('roll-dice', () => {
        // Generate numbers 1-6 for two dice
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        
        // Broadcast the result to EVERYONE (including the roller)
        io.emit('dice-result', {
            player: socket.id.substr(0, 4), // Short ID for display
            die1: die1,
            die2: die2,
            total: die1 + die2
        });
    });

    // 2. Handle Voice Chat (Push-to-Talk)
    // When a user speaks, we receive a Blob of audio data
    socket.on('voice-message', (audioData) => {
        // Broadcast this audio to everyone ELSE (don't echo back to speaker)
        socket.broadcast.emit('play-voice', {
            id: socket.id,
            audio: audioData
        });
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Game running on http://localhost:${PORT}`);
});
