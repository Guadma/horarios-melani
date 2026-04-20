import { PIN } from "./config.js";
import { state } from "./state.js";
import { renderWeek } from "./render.js";
import { showToast } from "./utils.js";

function applyEditModeUI() {
  document.body.classList.toggle("edit-mode", state.editMode);
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  if (state.editMode) {
    editBtn.textContent = "✓ Editando";
    editBtn.classList.add("active");
    saveBtn.style.display = "";
  } else {
    editBtn.textContent = "✏ Editar";
    editBtn.classList.remove("active");
    saveBtn.style.display = "none";
  }
}

export function toggleEdit() {
  if (state.editMode) {
    state.editMode = false;
    applyEditModeUI();
    renderWeek();
  } else {
    document.getElementById("pinModal").classList.add("open");
    document.getElementById("pinInput").value = "";
    document.getElementById("pinError").textContent = "";
    setTimeout(() => document.getElementById("pinInput").focus(), 100);
  }
}

export function checkPin() {
  const v = document.getElementById("pinInput").value;
  if (v === PIN) {
    state.editMode = true;
    applyEditModeUI();
    closeModal();
    renderWeek();
  } else {
    document.getElementById("pinError").textContent = "PIN incorrecto";
    document.getElementById("pinInput").value = "";
  }
}

export function guardarCambios() {
  state.editMode = false;
  applyEditModeUI();
  showToast("✓ Cambios guardados");
  renderWeek();
}

export function pinInput() {
  document.getElementById("pinError").textContent = "";
  if (document.getElementById("pinInput").value.length === 4) checkPin();
}

export function closeModal() {
  document.getElementById("pinModal").classList.remove("open");
}
