const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');

let drawing = false;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const { x, y } = getPos(e);
  ctx.lineTo(x, y);
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = '#1e90ff';
  ctx.stroke();
});

['mouseup', 'mouseleave'].forEach(evt =>
  canvas.addEventListener(evt, () => {
    drawing = false;
    ctx.closePath();
  })
);

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
