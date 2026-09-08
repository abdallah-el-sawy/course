// Minimal, dependency-free sanitization for a small educational MVP.
// Goal: strip characters that could enable HTML/script injection when
// values are ever rendered, and normalize whitespace. This is NOT a
// substitute for a real sanitization library in a production system.

function stripTags(value) {
  return String(value).replace(/<[^>]*>/g, '');
}

function sanitizeText(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  const cleaned = stripTags(String(value)).trim().replace(/\s+/g, ' ');
  return cleaned.slice(0, maxLength);
}

function sanitizeEmail(value) {
  if (!value) return '';
  return stripTags(String(value)).trim().toLowerCase().slice(0, 254);
}

function sanitizePhone(value) {
  if (!value) return '';
  // Keep digits, spaces, +, -, and parentheses only.
  return String(value).replace(/[^\d+\-() ]/g, '').trim().slice(0, 30);
}

module.exports = { stripTags, sanitizeText, sanitizeEmail, sanitizePhone };
