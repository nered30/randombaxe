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
const resultBox = document.getElementById('result-box');
const itemsList = document.getElementById('items-list');
const spinBtn = document.getElementById('spin-btn');

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

  // 중심 원
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
  resultBox.textContent = '';

  const n = items.length;
  const slice = (Math.PI * 2) / n;
  const winIndex = Math.floor(Math.random() * n);
  const extraSpins = (5 + Math.floor(Math.random() * 5)) * Math.PI * 2;
  const targetAngle = extraSpins + (Math.PI * 2 - (winIndex * slice + slice / 2) - (Math.PI / 2) % (Math.PI * 2));

  const start = currentAngle;
  const duration = 4000;
  let startTime = null;

  function animate(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentAngle = start + targetAngle * easeOut(progress);
    drawWheel(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      spinBtn.disabled = false;
      const normalAngle = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const pointerAngle = (Math.PI * 2 - normalAngle + Math.PI / 2) % (Math.PI * 2);
      const idx = Math.floor(pointerAngle / slice) % n;
      resultBox.textContent = '결과: ' + items[idx];
    }
  }

  requestAnimationFrame(animate);
});

document.getElementById('add-btn').addEventListener('click', () => {
  if (items.length >= 15) {
    alert('최대 15개까지 추가할 수 있어요.');
    return;
  }
  items.push('항목 ' + (items.length + 1));
  renderList();
});

renderList();
