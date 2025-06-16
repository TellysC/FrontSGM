export function showMessage(elementId, text, type = "success") {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = text;
    el.className = `message ${type}`;
    setTimeout(() => {
      el.textContent = "";
      el.className = "message";
    }, 4000);
  }
}
