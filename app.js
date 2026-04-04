const COLORS = [
  '#7F77DD', '#1D9E75', '#D85A30', '#378ADD', '#D4537E',
  '#639922', '#BA7517', '#E24B4A', '#5DCAA5', '#AFA9EC',
  '#F0997B', '#85B7EB', '#ED93B1', '#97C459', '#EF9F27'
];

let items = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'];
let spinning = false;
let currentAngle = 0;

const canvas = document.getElementById('roulette');
const ctx = canvas.getContext('2d');
const resultBox = document.getElementById('result-box');
const itemsList = document.getElementById('items-list');
const spinBtn = document.getElementById('spin-btn');
const overlay = document.getElementById('winner-overlay');
const winnerText = document.getElementById('winner-text');

function drawWheel(angle) {
  const cx = 150, cy = 150, r = 145;
  ctx.clearRect(0, 0, 300, 300);
  const n = items.length;
  if (n === 0) return;
  const slice = (Math.PI * 2) / n;

  for (let i = 0; i < n; i++) {
    const start = angle + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.min(14, 120 / n + 4)}px sans-serif`;
    const text = items[i].length > 10 ? items[i].slice(0, 10) + '…' : items[i];
    ctx.fillText(text, r - 10, 5);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function getWinnerIndex() {
  const n = items.length;
  const slice = (Math.PI * 2) / n;
  const normalized = (((-currentAngle - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.floor(normalized / slice) % n;
}

function launchConfetti(winColor) {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = [winColor, '#FFD700', '#FF6B6B', '#74b9ff', '#a29bfe'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = Math.random() * 0.8 + 's';
    el.style.animationDuration = (1.2 + Math.random() * 1.2) + 's';
    el.style.width = (6 + Math.random() * 8) + 'px';
    el.style.height = (6 + Math.random() * 8) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(el);
  }
  setTimeout(() => container.innerHTML = '', 3000);
}

function showWinner(idx) {
  const color = COLORS[idx % COLORS.length];
  winnerText.textContent = items[idx];
  winnerText.style.color = color;
  overlay.style.display = 'flex';
  launchConfetti(color);
}

overlay.addEventListener('click', () => {
  overlay.style.display = 'none';
});

function renderList() {
  itemsList.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const dot = document.createElement('div');
    dot.className = 'color-dot';
    dot.style.background = COLORS[i % COLORS.length];

    const inp = document.createElement('input');
    inp.className = 'item-input';
    inp.value = item;
    inp.addEventListener('input', e => {
      items[i] = e.target.value;
      drawWheel(currentAngle);
    });

    const del = document.createElement('button');
    del.className = 'del-btn';
    del.textContent = '−';
    del.title = '삭제';
    del.addEventListener('click', () => {
      if (items.length <= 2) {
        alert('항목은 최소 2개 필요해요.');
        return;
      }
      items.splice(i, 1);
      renderList();
      drawWheel(currentAngle);
    });

    row.appendChild(dot);
    row.appendChild(inp);
    row.appendChild(del);
    itemsList.appendChild(row);
  });

  drawWheel(currentAngle);
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

spinBtn.addEventListener('click', () => {
  if (spinning || items.length < 2) return;
  spinning = true;
  spinBtn.disabled = true;

  const n = items.length;
  const slice = (Math.PI * 2) / n;
  const winIndex = Math.floor(Math.random() * n);

  // winIndex 칸 중심이 포인터(위쪽, -π/2)에 정확히 오도록 계산
  const winCenter = winIndex * slice + slice / 2;
  const extraSpins = (6 + Math.floor(Math.random() * 4)) * Math.PI * 2;
  const targetFinalAngle = -(winCenter + Math.PI / 2);
  const currentNorm = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const targetNorm = ((targetFinalAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  let delta = targetNorm - currentNorm;
  if (delta <= 0) delta += Math.PI * 2;
  const totalRotation = extraSpins + delta;

  const startAngle = currentAngle;
  const duration = 4000;
  let startTime = null;

  function animate(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentAngle = startAngle + totalRotation * easeOut(progress);
    drawWheel(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      spinBtn.disabled = false;
      showWinner(winIndex);
    }
  }

  requestAnimationFrame(animate);
});

document.getElementById('add-btn').addEventListener('click', () => {
  if (items.length >= 50) {
    alert('최대 49개까지 추가할 수 있어요.');
    return;
  }
  items.push((items.length + 1));
  renderList();
});

renderList();
