// Small, dependency-free UI helpers shared across modules.

export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message; // textContent only — never innerHTML with user data
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4500);
}

export function starString(rating) {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

export function setFieldError(fieldId, message) {
  const el = document.getElementById(`${fieldId}Error`);
  if (el) el.textContent = message || '';
}

export function clearFieldErrors(fieldIds) {
  fieldIds.forEach((id) => setFieldError(id, ''));
}

export function setFormStatus(elId, message, state) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  if (state) {
    el.dataset.state = state;
  } else {
    delete el.dataset.state;
  }
}

export function setLoading(elId, message = 'Loading…') {
  const el = document.getElementById(elId);
  if (el) el.textContent = message;
}

export function setEmptyState(elId, message) {
  const el = document.getElementById(elId);
  if (el) el.textContent = message;
}
