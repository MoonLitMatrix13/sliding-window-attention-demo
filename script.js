const canvas = document.getElementById("cvs");
const ctx = canvas.getContext("2d");

const seqEl = document.getElementById("sl-seq");
const winEl = document.getElementById("sl-win");
const qEl = document.getElementById("sl-q");

let mode = "swa";

document.getElementById("btn-swa").onclick = () => {
  mode = "swa";
  setActive("btn-swa");
  render();
};

document.getElementById("btn-full").onclick = () => {
  mode = "full";
  setActive("btn-full");
  render();
};

function setActive(id) {
  document.querySelectorAll(".mode-btn")
    .forEach(btn => btn.classList.remove("active"));

  document.getElementById(id)
    .classList.add("active");
}

function render() {

  const N = +seqEl.value;
  const W = +winEl.value;
  const Q = +qEl.value;

  document.getElementById("out-seq").textContent = N;
  document.getElementById("out-win").textContent = W;
  document.getElementById("out-q").textContent = Q + 1;

  canvas.width = canvas.clientWidth;
  canvas.height = 220;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const cell = canvas.width / N;

  const start = Math.max(0, Q - Math.floor(W/2));
  const end = Math.min(N-1, start + W - 1);

  // ===== TOKENS =====

  for(let i=0;i<N;i++){

    const x = i * cell;

    if(i === Q){
      ctx.fillStyle = "#665dff";
    }
    else if(mode === "swa" && i >= start && i <= end){
      ctx.fillStyle = "#163e37";
    }
    else{
      ctx.fillStyle = "#2a314d";
    }

    roundRect(ctx, x+4, 70, cell-8, 46, 10, true);

    ctx.fillStyle = "#ffffff";

    ctx.font = "15px Inter";

    ctx.textAlign = "center";

    ctx.fillText(i+1, x + cell/2, 98);
  }

  // ===== CONNECTIONS =====

  const sourceX = Q * cell + cell/2;
  const sourceY = 132;

  for(let i=0;i<N;i++){

    if(mode === "full" || (i >= start && i <= end)){

      const targetX = i * cell + cell/2;

      ctx.beginPath();

      ctx.moveTo(sourceX, sourceY);

      ctx.quadraticCurveTo(
        sourceX,
        sourceY - 32,
        targetX,
        92
      );

      ctx.strokeStyle =
        mode === "full"
          ? "rgba(255,145,102,0.35)"
          : "rgba(53,208,161,0.85)";

      ctx.lineWidth = mode === "full" ? 2 : 3;

      ctx.shadowBlur = 14;

      ctx.shadowColor =
        mode === "full"
          ? "#ff9166"
          : "#35d0a1";

      ctx.stroke();

      ctx.shadowBlur = 0;
    }
  }

  // ===== STATS =====

  document.getElementById("st-pairs").textContent =
    mode === "swa"
      ? end-start+1
      : N;

  document.getElementById("st-full").textContent =
    N*N;

  document.getElementById("st-save").textContent =
    mode === "swa"
      ? Math.round((1 - ((end-start+1)/(N*N))) * 100) + "%"
      : "0%";
}

function roundRect(ctx, x, y, width, height, radius, fill) {

  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  ctx.arcTo(x + width, y, x + width, y + height, radius);

  ctx.arcTo(x + width, y + height, x, y + height, radius);

  ctx.arcTo(x, y + height, x, y, radius);

  ctx.arcTo(x, y, x + width, y, radius);

  ctx.closePath();

  if(fill) ctx.fill();
}

document.querySelectorAll("input")
  .forEach(el => el.addEventListener("input", render));

render();