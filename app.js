const COLORS = [
  '#7F77DD', '#1D9E75', '#D85A30', '#378ADD', '#D4537E',
  '#639922', '#BA7517', '#E24B4A', '#5DCAA5', '#AFA9EC',
  '#F0997B', '#85B7EB', '#ED93B1', '#97C459', '#EF9F27'
];

let items = ['항목 1', '항목 2', '항목 3', '항목 4'];
let spinning = false;
let currentAngle = 0;

const canvas = document.getElementById('roulette');
const ctx = canvas.getContext('2d');
const itemsList = document.getElementById('items-list');
const spinBtn = document.getElementById('spin-btn');
const addBtn = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');

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
    del.addEventListener('click', () => {
      if (items.length <= 2) { alert('항목은 최소 2개 필요해요.'); return; }
      items.splice(i, 1);
      renderList();
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

  const winCenter = winIndex * slice + slice / 2;
  const extraSpins = (6 + Math.floor(Math.random() * 4)) * Math.PI * 2;
  const targetFinalAngle = -Math.PI / 2 - winCenter;

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
      alert('🎉 결과: ' + items[winIndex]);
    }
  }

  requestAnimationFrame(animate);
});

addBtn.addEventListener('click', () => {
  if (items.length >= 15) { alert('최대 15개까지 추가할 수 있어요.'); return; }
  items.push('항목 ' + (items.length + 1));
  renderList();
});

clearBtn.addEventListener('click', () => {
  if (!confirm('모든 항목을 삭제할까요?')) return;
  items = [];
  renderList();
});

renderList();
