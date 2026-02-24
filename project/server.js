const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");

// Load scores from file (persistent)
let scores = {};
const SCORE_FILE = "scores.json";

if (fs.existsSync(SCORE_FILE)) {
    try {
        scores = JSON.parse(fs.readFileSync(SCORE_FILE, "utf8"));
    } catch (e) {
        console.log("Error loading scores.json");
    }
}

// Save scores safely
function saveScores() {
    fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2));
}

app.use(cors());
app.use(express.static("public"));

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

function nextMilestone(current) {
    if (current < 100) return 100;
    if (current < 1000) return 1000;
    if (current < 10000) return 10000;
    if (current < 100000) return 100000;
    return current * 2; 
}

io.on("connection", (socket) => {

    socket.on("join", (name) => {
        if (Object.keys(scores).includes(name)) {
            socket.emit("nameTaken");
            return;
        }

        scores[name] = {
            score: scores[name]?.score || 0,
            milestone: nextMilestone(scores[name]?.score || 0)
        };

        saveScores();

        socket.data.name = name;
        io.emit("leaderboard", scores);
    });

    socket.on("resume", (name) => {
        if (!scores[name]) {
            scores[name] = { score: 0, milestone: 100 };
            saveScores();
        }
        socket.data.name = name;
        io.emit("leaderboard", scores);
    });

    socket.on("click", () => {
        const name = socket.data.name;
        if (!name) return;

        scores[name].score += 1;

        if (scores[name].score >= scores[name].milestone) {
            io.emit("milestone", { 
                name: name, 
                amount: scores[name].milestone 
            });

            scores[name].milestone = nextMilestone(scores[name].milestone);
        }

        saveScores();
        io.emit("leaderboard", scores);
    });

    socket.on("disconnect", () => {
        io.emit("leaderboard", scores);
    });
});

const PORT = process.env.PORT || 3000;

// ==========================
// ADMIN ROUTES
// ==========================

app.get("/admin/resetScores", (req, res) => {
    if (req.query.key !== "mujalovesdogs") {
        return res.status(403).send("Invalid Key");
    }

    for (let name in scores) {
        scores[name].score = 0;
        scores[name].milestone = 100;
    }

    saveScores();
    io.emit("leaderboard", scores);

    res.send("Scores reset.");
});

app.get("/admin/resetEverything", (req, res) => {
    if (req.query.key !== "mujalovesdogs") {
        return res.status(403).send("Invalid Key");
    }

    scores = {};
    saveScores();
    io.emit("leaderboard", scores);

    res.send("All data reset.");
});


server.listen(PORT, () => console.log("Server running on port " + PORT));

