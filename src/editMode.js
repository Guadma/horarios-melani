import { SUPA_KEY, VERIFY_PIN_URL, TOKEN_STORAGE_KEY } from "./config.js";
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

export async function checkPin() {
  const input = document.getElementById("pinInput");
  const errorEl = document.getElementById("pinError");
  const pin = input.value;
  errorEl.textContent = "Validando...";
  try {
    const res = await fetch(VERIFY_PIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPA_KEY
      },
      body: JSON.stringify({ pin })
    });
    if (res.status === 401) {
      errorEl.textContent = "PIN incorrecto";
      input.value = "";
      return;
    }
    if (!res.ok) {
      errorEl.textContent = "Error del servidor";
      return;
    }
    const { token } = await res.json();
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    state.editMode = true;
    applyEditModeUI();
    closeModal();
    renderWeek();
  } catch {
    errorEl.textContent = "Error de red";
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
