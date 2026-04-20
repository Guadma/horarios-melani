import "./styles.css";
import { renderWeek, changeWeek } from "./render.js";
import { toggleEdit, checkPin, guardarCambios, closeModal, pinInput } from "./editMode.js";

// ── Wiring de controles del header y modal de PIN ──
document.querySelector('[data-action="prev-week"]').addEventListener("click", () => changeWeek(-1));
document.querySelector('[data-action="next-week"]').addEventListener("click", () => changeWeek(1));
document.getElementById("saveBtn").addEventListener("click", guardarCambios);
document.getElementById("editBtn").addEventListener("click", toggleEdit);

document.getElementById("pinInput").addEventListener("input", pinInput);
document.querySelector('[data-action="pin-cancel"]').addEventListener("click", closeModal);
document.querySelector('[data-action="pin-confirm"]').addEventListener("click", checkPin);
document.getElementById("pinModal").addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

// Render inicial
renderWeek();
