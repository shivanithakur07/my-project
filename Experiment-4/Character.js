const textarea = document.getElementById("text1");
const character1 = document.getElementById("character1");

textarea.addEventListener("input", () => {
  character1.textContent = textarea.value.length;
});
