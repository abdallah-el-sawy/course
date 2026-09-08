import { createSurvey } from './api.js';
import { showToast, setFieldError, clearFieldErrors, setFormStatus } from './ui.js';

const SURVEY_FIELD_IDS = ['surveyApptId', 'surveyPatientName'];

function validateSurveyForm(form) {
  const errors = {};
  if (!form.appointmentId.value) errors.surveyApptId = 'Please enter your appointment ID.';
  if (form.patientName.value.trim().length < 2) errors.surveyPatientName = 'Please enter your name.';

  const recommend = form.querySelector('input[name="wouldRecommend"]:checked');
  if (!recommend) {
    // No dedicated element for this fieldset error; surface via form status.
    errors._wouldRecommend = 'Please select Yes or No.';
  }

  return errors;
}

export function initSurveyForm() {
  const form = document.getElementById('surveyForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(SURVEY_FIELD_IDS);
    setFormStatus('surveyStatus', '', null);

    const errors = validateSurveyForm(form);
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => {
        if (field !== '_wouldRecommend') setFieldError(field, msg);
      });
      setFormStatus('surveyStatus', errors._wouldRecommend || 'Please fix the errors above.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      await createSurvey({
        appointmentId: Number(form.appointmentId.value),
        patientName: form.patientName.value.trim(),
        satisfaction: Number(form.satisfaction.value),
        communication: Number(form.communication.value),
        waitingTime: Number(form.waitingTime.value),
        wouldRecommend: form.querySelector('input[name="wouldRecommend"]:checked').value === 'true',
        comments: form.comments.value.trim() || undefined
      });

      setFormStatus('surveyStatus', 'Thank you for your feedback!', 'success');
      showToast('Survey submitted. Thank you!', 'success');
      form.reset();
    } catch (err) {
      if (err.fields) {
        const map = { appointmentId: 'surveyApptId', patientName: 'surveyPatientName' };
        Object.entries(err.fields).forEach(([field, msg]) => {
          if (map[field]) setFieldError(map[field], msg);
        });
      }
      setFormStatus('surveyStatus', err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}
