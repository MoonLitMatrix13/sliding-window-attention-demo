const canvas = document.getElementById("cvs");
const ctx = canvas.getContext("2d");

let mode = "swa";
let playing = false;
let interval;

// ===== UI ELEMENTS =====
const seqEl = document.getElementById("sl-seq");
const winEl = document.getElementById("sl-win");
const qEl = document.getElementById("sl-q");

// ===== BUTTONS =====
document.getElementById("btn-swa").onclick = () => setMode("swa");
document.getElementById("btn-full").onclick = () => setMode("full");
document.getElementById("btn-play").onclick = togglePlay;

// ===== MODE SWITCH =====
function setMode(m) {
  mode = m;
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("btn-" + m).classList.add("active");
  render();
}

// ===== AUTO PLAY =====
function togglePlay() {
  playing = !playing;

  if (playing) {
    interval = setInterval(() => {
      let q = parseInt(qEl.value);
      q = (q + 1) % parseInt(seqEl.value);
      qEl.value = q;
      render();
    }, 500);
  } else {
    clearInterval(interval);
  }
}

// ===== MAIN RENDER =====
function render() {
  const N = parseInt(seqEl.value);
  const W = parseInt(winEl.value);
  let Q = parseInt(qEl.value);

  qEl.max = N - 1;

  document.getElementById("out-seq").textContent = N;
  document.getElementById("out-win").textContent = W;
  document.getElementById("out-q").textContent = Q + 1;

  canvas.width = canvas.clientWidth;
  canvas.height = 210;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cell = canvas.width / N;

  const half = Math.floor(W / 2);
  const start = Math.max(0, Q - half);
  const end = Math.min(N - 1, start + W - 1);

  // ===== DRAW TOKENS =====
  for (let i = 0; i < N; i++) {
    const x = i * cell;

    // color logic
    if (i === Q) ctx.fillStyle = "#534ab7";
    else if (mode === "swa" && i >= start && i <= end)
      ctx.fillStyle = "#1D9E75";
    else ctx.fillStyle = "#2b3042";

    ctx.fillRect(x + 2, 80, cell - 4, 40);

    ctx.fillStyle = "#e8ecff";
    ctx.fillText(i + 1, x + cell / 2, 105);
  }

  // ===== DRAW LINES =====
  // ===== DRAW LINES =====

  const sourceX = Q * cell + cell / 2;
  const sourceY = 135; // closer to tokens -> less dramatic spread

  for (let i = 0; i < N; i++) {
    if (mode === "full" || (i >= start && i <= end)) {
      const targetX = i * cell + cell / 2;
      const targetY = 100;

      // smoother angle compression
      const curveOffset = (targetX - sourceX) * 0.12;

      ctx.beginPath();

      ctx.moveTo(sourceX, sourceY);

      // quadratic curve instead of straight lines
      ctx.quadraticCurveTo(
        sourceX + curveOffset,
        sourceY - 35,
        targetX,
        targetY
      );

      // aesthetic glowing lines
      ctx.strokeStyle =
        mode === "full" ? "rgba(255,140,100,0.45)" : "rgba(48,208,155,0.75)";

      ctx.lineWidth = mode === "full" ? 2 : 3;

      ctx.shadowBlur = 10;
      ctx.shadowColor =
        mode === "full" ? "rgba(255,140,100,0.35)" : "rgba(48,208,155,0.45)";

      ctx.stroke();

      ctx.shadowBlur = 0;
    }
  }

  // ===== STATS =====
  const pairs = mode === "swa" ? end - start + 1 : N;
  document.getElementById("st-pairs").textContent = pairs;
  document.getElementById("st-full").textContent = N * N;
  document.getElementById("st-save").textContent =
    mode === "swa" ? Math.round((1 - pairs / (N * N)) * 100) + "%" : "0%";

  document.getElementById("insight-text").textContent =
    mode === "swa"
      ? `Token ${Q + 1} attends locally (${start + 1}-${end + 1})`
      : `Full attention connects everything → O(N²)`;
}

// ===== KEYBOARD CONTROLS =====
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") qEl.value++;
  if (e.key === "ArrowLeft") qEl.value--;
  render();
});

// ===== INIT =====
render();
