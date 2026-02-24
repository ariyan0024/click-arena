let confettiInterval;

function startConfetti() {
    confettiInterval = setInterval(createConfetti, 50);
}

function stopConfetti() {
    clearInterval(confettiInterval);
}

function createConfetti() {
    const c = document.createElement("div");
    c.innerText = "🎉";
    c.style.position = "fixed";
    c.style.left = Math.random() * window.innerWidth + "px";
    c.style.top = "-20px";
    c.style.fontSize = "20px";
    c.style.opacity = 1;
    c.style.transition = "top 3s, opacity 3s";
    document.body.appendChild(c);

    setTimeout(() => {
        c.style.top = window.innerHeight + "px";
        c.style.opacity = 0;
    }, 50);

    setTimeout(() => c.remove(), 3000);
}