const { MAX_COMMENT_LENGTH, MAX_NAME_LENGTH } = require('./config');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

function validateAppointment(data) {
  const errors = {};

  if (!data.patientName || String(data.patientName).trim().length < 2) {
    errors.patientName = 'Patient name is required.';
  } else if (String(data.patientName).length > MAX_NAME_LENGTH) {
    errors.patientName = 'Patient name is too long.';
  }

  if (!data.patientPhone || String(data.patientPhone).trim().length < 7) {
    errors.patientPhone = 'Valid phone number is required.';
  }

  if (data.patientEmail) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(String(data.patientEmail))) {
      errors.patientEmail = 'Email address is invalid.';
    }
  }

  if (!data.date || !DATE_RE.test(data.date) || Number.isNaN(Date.parse(data.date))) {
    errors.date = 'A valid appointment date is required.';
  }

  if (!data.time || !TIME_RE.test(data.time)) {
    errors.time = 'A valid appointment time is required.';
  }

  if (data.notes && String(data.notes).length > MAX_COMMENT_LENGTH) {
    errors.notes = 'Notes are too long.';
  }

  if (!data.doctorId) {
    errors.doctorId = 'Doctor is required.';
  }

  return errors;
}

function validateReview(data) {
  const errors = {};

  if (!data.patientName || String(data.patientName).trim().length < 2) {
    errors.patientName = 'Patient name is required.';
  } else if (String(data.patientName).length > MAX_NAME_LENGTH) {
    errors.patientName = 'Patient name is too long.';
  }

  const rating = Number(data.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Rating must be between 1 and 5.';
  }

  if (!data.comment || String(data.comment).trim().length < 2) {
    errors.comment = 'A comment is required.';
  } else if (String(data.comment).length > MAX_COMMENT_LENGTH) {
    errors.comment = `Comment must be under ${MAX_COMMENT_LENGTH} characters.`;
  }

  if (!data.doctorId) {
    errors.doctorId = 'Doctor is required.';
  }

  return errors;
}

function validateSurvey(data) {
  const errors = {};

  const checkScale = (field, label) => {
    const val = Number(data[field]);
    if (!Number.isFinite(val) || val < 1 || val > 5) {
      errors[field] = `${label} must be between 1 and 5.`;
    }
  };

  if (!data.patientName || String(data.patientName).trim().length < 2) {
    errors.patientName = 'Patient name is required.';
  }

  if (!data.appointmentId) {
    errors.appointmentId = 'Appointment ID is required.';
  }

  checkScale('satisfaction', 'Overall satisfaction');
  checkScale('communication', 'Doctor communication');
  checkScale('waitingTime', 'Waiting time');

  if (typeof data.wouldRecommend !== 'boolean') {
    errors.wouldRecommend = 'Would-recommend must be true or false.';
  }

  if (data.comments && String(data.comments).length > MAX_COMMENT_LENGTH) {
    errors.comments = 'Comments are too long.';
  }

  return errors;
}

module.exports = { hasErrors, validateAppointment, validateReview, validateSurvey, DATE_RE, TIME_RE };
