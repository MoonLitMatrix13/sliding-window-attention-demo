const canvas = document.getElementById("cvs");
const ctx = canvas.getContext("2d");

const seqEl = document.getElementById("sl-seq");
const winEl = document.getElementById("sl-win");
const qEl = document.getElementById("sl-q");

const btnSwa = document.getElementById("btn-swa");
const btnFull = document.getElementById("btn-full");
const btnPlay = document.getElementById("btn-play");

let mode = "swa";
let isPlaying = false;
let animationId = null;

// ===== MODE SWITCHING =====

btnSwa.onclick = () => {
  mode = "swa";
  setActive("btn-swa");
  render();
};

btnFull.onclick = () => {
  mode = "full";
  setActive("btn-full");
  render();
};

btnPlay.onclick = toggleAutoPlay;

function setActive(id) {
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-pressed", "false");
  });
  
  const activeBtn = document.getElementById(id);
  activeBtn.classList.add("active");
  activeBtn.setAttribute("aria-pressed", "true");
}

// ===== AUTO PLAY =====

function toggleAutoPlay() {
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    btnPlay.classList.add("playing");
    animate();
  } else {
    btnPlay.classList.remove("playing");
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }
}

let autoPlayStep = 0;
const autoPlayInterval = 120; // ms between steps

function animate() {
  const now = Date.now();
  
  // Update query token every autoPlayInterval ms
  if (!animate.lastTime) animate.lastTime = now;
  
  if (now - animate.lastTime > autoPlayInterval) {
    animate.lastTime = now;
    autoPlayStep++;
    
    const maxPos = parseInt(seqEl.value) - 1;
    if (autoPlayStep > maxPos) {
      autoPlayStep = 0;
    }
    
    qEl.value = autoPlayStep;
    updateOutput("out-q", autoPlayStep + 1);
    render();
  }
  
  if (isPlaying) {
    animationId = requestAnimationFrame(animate);
  }
}

// ===== OUTPUT UPDATE =====

function updateOutput(id, value) {
  document.getElementById(id).textContent = value;
}

// ===== INSIGHT TEXT GENERATOR =====

function generateInsight(queryPos, windowStart, windowEnd, seqLen, windowSize, mode) {
  const displayQuery = queryPos + 1;
  const displayStart = windowStart + 1;
  const displayEnd = windowEnd + 1;
  
  if (mode === "full") {
    return `Token ${displayQuery} attends to all ${seqLen} positions — O(n²) complexity`;
  }
  
  const attendCount = windowEnd - windowStart + 1;
  const efficiency = Math.round((1 - (attendCount / (seqLen * seqLen))) * 100);
  
  return `Token ${displayQuery} attends locally to positions ${displayStart}–${displayEnd} (${attendCount} pairs) — ${efficiency}% memory saved`;
}

// ===== RENDER CANVAS =====

function render() {
  const N = parseInt(seqEl.value);
  const W = parseInt(winEl.value);
  const Q = parseInt(qEl.value);
  
  updateOutput("out-seq", N);
  updateOutput("out-win", W);
  updateOutput("out-q", Q + 1);
  
  canvas.width = canvas.clientWidth;
  canvas.height = 260;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cell = canvas.width / N;
  const start = Math.max(0, Q - Math.floor(W / 2));
  const end = Math.min(N - 1, start + W - 1);
  
  // ===== DRAW TOKENS =====
  
  const tokenY = 90;
  const tokenHeight = 50;
  const tokenRadius = 8;
  
  for (let i = 0; i < N; i++) {
    const x = i * cell;
    
    // Determine token color
    if (i === Q) {
      ctx.fillStyle = "#667eea";
    } else if (mode === "swa" && i >= start && i <= end) {
      ctx.fillStyle = "#00d9a3";
    } else {
      ctx.fillStyle = "#364555";
    }
    
    // Draw token box with glow
    if (i === Q || (mode === "swa" && i >= start && i <= end)) {
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    roundRect(ctx, x + 4, tokenY, cell - 8, tokenHeight, tokenRadius, true);
    
    ctx.shadowBlur = 0;
    
    // Draw token number
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'Space Mono'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(i + 1, x + cell / 2, tokenY + tokenHeight / 2);
  }
  
  // ===== DRAW CONNECTIONS =====
  
  const sourceX = Q * cell + cell / 2;
  const sourceY = tokenY + tokenHeight + 8;
  const targetY = tokenY - 8;
  
  for (let i = 0; i < N; i++) {
    const shouldDraw = mode === "full" || (i >= start && i <= end);
    
    if (shouldDraw) {
      const targetX = i * cell + cell / 2;
      
      // Cubic bezier curve
      const controlY = sourceY + 80;
      
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.bezierCurveTo(sourceX, controlY, targetX, controlY, targetX, targetY);
      
      if (mode === "full") {
        ctx.strokeStyle = "rgba(255, 107, 107, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(255, 107, 107, 0.3)";
      } else {
        ctx.strokeStyle = "rgba(0, 217, 163, 0.6)";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#00d9a3";
      }
      
      ctx.shadowBlur = 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
  
  // ===== UPDATE STATS =====
  
  const pairsCount = mode === "swa" ? end - start + 1 : N;
  const fullAttention = N * N;
  const memorySaved = mode === "swa" 
    ? Math.round((1 - (pairsCount / fullAttention)) * 100) 
    : 0;
  
  document.getElementById("st-pairs").textContent = pairsCount;
  document.getElementById("st-full").textContent = fullAttention;
  document.getElementById("st-save").textContent = memorySaved + "%";
  
  // ===== UPDATE INSIGHT =====
  
  const insight = generateInsight(Q, start, end, N, W, mode);
  document.getElementById("insight-content").textContent = insight;
}

// ===== UTILITY: ROUNDED RECT =====

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) ctx.fill();
}

// ===== EVENT LISTENERS =====

[seqEl, winEl, qEl].forEach(el => {
  el.addEventListener("input", (e) => {
    // Constrain query to valid range
    const maxQ = parseInt(seqEl.value) - 1;
    if (qEl.value > maxQ) {
      qEl.value = maxQ;
      updateOutput("out-q", maxQ + 1);
    }
    render();
  });
});

// Debounce window resize for better performance
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(render, 100);
});

// Initial render
render();

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggleAutoPlay();
  }
  if (e.code === "ArrowRight") {
    const maxQ = parseInt(seqEl.value) - 1;
    qEl.value = Math.min(parseInt(qEl.value) + 1, maxQ);
    updateOutput("out-q", parseInt(qEl.value) + 1);
    render();
  }
  if (e.code === "ArrowLeft") {
    qEl.value = Math.max(parseInt(qEl.value) - 1, 0);
    updateOutput("out-q", parseInt(qEl.value) + 1);
    render();
  }
});