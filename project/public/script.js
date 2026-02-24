const socket = io();
let username = localStorage.getItem("clickerName");

const loginScreen = document.getElementById("loginScreen");
const gameUI = document.getElementById("gameUI");
const nameError = document.getElementById("nameError");

const floatContainer = document.getElementById("floatTextContainer");
const leaderboardBox = document.getElementById("leaderboard");

const LINES = [
    "TaskOps is the best",
    "Made by Binary",
    "Pabs and Aya :love:",
    "Ruki hits juls",
    "johny is close to god",
    "Muja Muja Muja Muja"
];

function showFloatingText() {
    const text = document.createElement("div");
    text.className = "floatText";
    text.innerText = LINES[Math.floor(Math.random() * LINES.length)];

    // Random position
    text.style.left = Math.random() * 70 + "%";
    text.style.top = Math.random() * 70 + "%";

    floatContainer.appendChild(text);

    // Fade in
    setTimeout(() => {
        text.style.opacity = 1;
    }, 50);

    // Stay for 20–30 seconds
    const stayTime = 20000 + Math.random() * 10000;

    setTimeout(() => {
        // Fade out
        text.style.opacity = 0;

        // Remove after fade out
        setTimeout(() => {
            text.remove();
            // After removal, schedule next sentence
            setTimeout(showFloatingText, 3000 + Math.random() * 5000);
        }, 2000);

    }, stayTime);
}

if (username) {
    loginScreen.style.display = "none";
    gameUI.style.display = "block";
    socket.emit("resume", username);
    showFloatingText();
}

document.getElementById("joinBtn").onclick = () => {
    const name = document.getElementById("usernameInput").value.trim();

    if (!name) return;
    socket.emit("join", name);

    socket.on("nameTaken", () => {
        nameError.innerText = "Name already taken!";
    });

    socket.on("leaderboard", () => {
        username = name;
        localStorage.setItem("clickerName", name);
        loginScreen.style.display = "none";
        gameUI.style.display = "block";
        showFloatingText();
    });
};

document.body.addEventListener("click", (e) => {
    if (!username) return;

    socket.emit("click");

    const plus = document.createElement("div");
    plus.className = "plusOne";
    plus.innerText = "+1";
    plus.style.left = e.clientX + "px";
    plus.style.top = e.clientY + "px";
    document.body.appendChild(plus);

    setTimeout(() => plus.remove(), 1000);
});

socket.on("leaderboard", (scores) => {
    let sorted = Object.entries(scores).sort((a,b)=>b[1].score-a[1].score);
    leaderboardBox.innerHTML = "<h3>Leaderboard</h3>";
    sorted.forEach(([name, data], i) => {
        leaderboardBox.innerHTML += `<div>${i+1}. ${name} — ${data.score}</div>`;
    });
});

socket.on("milestone", ({name, amount}) => {
    alert(`${name} reached ${amount} clicks!`);
    if (name === username) {
        startConfetti();
        setTimeout(stopConfetti, 4000);
    }
});

// Drag leaderboard
let isDown = false, offset = {x:0,y:0};

leaderboardBox.addEventListener("mousedown", (e) => {
    isDown = true;
    offset.x = leaderboardBox.offsetLeft - e.clientX;
    offset.y = leaderboardBox.offsetTop - e.clientY;
});

document.addEventListener("mouseup", ()=> isDown = false);

document.addEventListener("mousemove", (e)=>{
    if (!isDown) return;
    leaderboardBox.style.left = (e.clientX + offset.x) + "px";
    leaderboardBox.style.top = (e.clientY + offset.y) + "px";

});

// ===============================
// ADMIN PANEL
// ===============================
const adminPanel = document.getElementById("adminPanel");
const adminKey = "binary_superadmin_2026"; // CHANGE THIS

// Show admin panel when pressing A
document.addEventListener("keydown", (e) => {
    if (e.key === "A" || e.key === "a") {
        const input = prompt("Enter admin key:");
        if (input === adminKey) {
            adminPanel.style.display = "block";
        }
    }
});

// RESET SCORES
document.getElementById("resetScoresBtn").onclick = () => {
    const input = prompt("Enter admin key:");
    if (input !== adminKey) return alert("Wrong key!");

    fetch(`/admin/resetScores?key=${adminKey}`)
        .then(() => alert("Scores Reset!"));
};

// RESET EVERYTHING
document.getElementById("resetEverythingBtn").onclick = () => {
    const input = prompt("Enter admin key:");
    if (input !== adminKey) return alert("Wrong key!");

    fetch(`/admin/resetEverything?key=${adminKey}`)
        .then(() => alert("All Data Reset!"));
};
