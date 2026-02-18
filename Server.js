const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let buzzerLocked = false;
let winner = null;

app.use(express.static("public"));

io.on("connection", (socket) => {

    socket.on("join", (name) => {
        if (players.length >= 10) return;

        players.push({ id: socket.id, name });
        io.emit("updatePlayers", players);
    });

    socket.on("buzz", () => {
        if (!buzzerLocked) {
            buzzerLocked = true;
            winner = players.find(p => p.id === socket.id);
            io.emit("buzzWinner", winner);
        }
    });

    socket.on("reset", () => {
        buzzerLocked = false;
        winner = null;
        io.emit("resetBuzz");
    });

    socket.on("disconnect", () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit("updatePlayers", players);
    });

});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});

