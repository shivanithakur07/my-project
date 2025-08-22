const svg = document.getElementById("drawing-area");

let drawing = false;
let currentPath;

svg.addEventListener("mousedown", (e) => {
  drawing = true;
  currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  currentPath.setAttribute("stroke", "blue");
  currentPath.setAttribute("fill", "none");
  currentPath.setAttribute("stroke-width", "2");
  
  // Start path at mouse position
  const x = e.offsetX;
  const y = e.offsetY;
  currentPath.setAttribute("d", `M ${x} ${y}`);
  
  svg.appendChild(currentPath);
});

svg.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  // Append line segments as mouse moves
  const d = currentPath.getAttribute("d");
  currentPath.setAttribute("d", `${d} L ${x} ${y}`);
});

svg.addEventListener("mouseup", () => {
  drawing = false;
});
