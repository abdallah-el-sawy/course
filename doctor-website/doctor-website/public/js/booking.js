import { getAvailability, createAppointment } from './api.js';
import { showToast, setFieldError, clearFieldErrors, setFormStatus } from './ui.js';

const DOCTOR_ID = 1;
const BOOKING_FIELD_IDS = ['date', 'time', 'patientName', 'patientPhone', 'patientEmail'];

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function resetTimeSelect(message) {
  const select = document.getElementById('apptTime');
  select.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = '';
  opt.textContent = message;
  select.appendChild(opt);
  select.disabled = true;
}

async function loadAvailability(date) {
  const statusEl = document.getElementById('availabilityStatus');
  const select = document.getElementById('apptTime');

  resetTimeSelect('Loading available times…');
  statusEl.textContent = '';

  try {
    const { availableSlots } = await getAvailability(DOCTOR_ID, date);

    if (!availableSlots.length) {
      resetTimeSelect('No times available');
      statusEl.textContent = 'No appointments available for this date. Please choose another date.';
      return;
    }

    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose a time';
    select.appendChild(placeholder);

    availableSlots.forEach((slot) => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot;
      select.appendChild(opt);
    });

    select.disabled = false;
    statusEl.textContent = `${availableSlots.length} time slot(s) available.`;
  } catch (err) {
    resetTimeSelect('Unable to load times');
    statusEl.textContent = 'Something went wrong loading availability. Please try again.';
    console.error(err);
  }
}

function validateBookingForm(form) {
  const errors = {};
  if (!form.date.value) errors.date = 'Please select a date.';
  if (!form.time.value) errors.time = 'Please select an available time.';
  if (form.patientName.value.trim().length < 2) errors.patientName = 'Please enter your full name.';
  if (form.patientPhone.value.trim().length < 7) errors.patientPhone = 'Please enter a valid phone number.';

  const email = form.patientEmail.value.trim();
  if (email) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) errors.patientEmail = 'Please enter a valid email address.';
  }

  return errors;
}

function renderConfirmation(appointment) {
  const el = document.getElementById('bookingConfirmation');
  el.classList.remove('hidden');
  el.innerHTML = '';

  const heading = document.createElement('h3');
  heading.textContent = 'Appointment request submitted successfully';

  const details = document.createElement('p');
  const dateFormatted = new Date(`${appointment.date}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  details.textContent = `Date: ${dateFormatted} — Time: ${appointment.time} — Status: ${appointment.status}`;

  const idNote = document.createElement('p');
  idNote.className = 'muted';
  idNote.textContent = `Your appointment ID is #${appointment.id}. You can use it later for the post-visit survey.`;

  el.append(heading, details, idNote);
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function initBookingForm() {
  const dateInput = document.getElementById('apptDate');
  const form = document.getElementById('bookingForm');
  if (!dateInput || !form) return;

  dateInput.min = todayISO();
  resetTimeSelect('Choose a date first');

  dateInput.addEventListener('change', () => {
    setFieldError('date', '');
    if (dateInput.value) {
      loadAvailability(dateInput.value);
    } else {
      resetTimeSelect('Choose a date first');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(BOOKING_FIELD_IDS);
    setFormStatus('bookingStatus', '', null);

    const errors = validateBookingForm(form);
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => setFieldError(field, msg));
      return;
    }

    const submitBtn = document.getElementById('bookingSubmit');
    submitBtn.disabled = true;
    setFormStatus('bookingStatus', 'Submitting your request…', null);

    try {
      const appointment = await createAppointment({
        doctorId: DOCTOR_ID,
        date: form.date.value,
        time: form.time.value,
        patientName: form.patientName.value.trim(),
        patientPhone: form.patientPhone.value.trim(),
        patientEmail: form.patientEmail.value.trim() || undefined,
        notes: form.notes.value.trim() || undefined
      });

      setFormStatus('bookingStatus', '', null);
      showToast('Appointment requested!', 'success');
      renderConfirmation(appointment);
      form.reset();
      resetTimeSelect('Choose a date first');
    } catch (err) {
      if (err.status === 409) {
        setFormStatus('bookingStatus', err.message, 'error');
        // Refresh availability since the slot was just taken.
        if (dateInput.value) loadAvailability(dateInput.value);
      } else if (err.fields) {
        const map = {
          patientName: 'patientName', patientPhone: 'patientPhone',
          patientEmail: 'patientEmail', date: 'date', time: 'time', notes: 'notes'
        };
        Object.entries(err.fields).forEach(([field, msg]) => setFieldError(map[field] || field, msg));
        setFormStatus('bookingStatus', 'Please fix the errors above.', 'error');
      } else {
        setFormStatus('bookingStatus', err.message || 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
}
