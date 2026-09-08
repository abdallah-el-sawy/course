// All HTTP communication with the backend lives in this module.
// Other frontend modules never call fetch() directly.

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Unexpected server response.');
  }

  if (!response.ok || !result.success) {
    const err = new Error(result?.error?.message || 'Request failed');
    err.fields = result?.error?.fields;
    err.status = response.status;
    throw err;
  }

  return result.data;
}

export async function getDoctor(id = 1) {
  return request(`/api/doctors/${id}`);
}

export async function getReviews(doctorId = 1) {
  return request(`/api/reviews?doctorId=${doctorId}`);
}

export async function createReview(data) {
  return request('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getAvailability(doctorId, date) {
  return request(`/api/appointments/availability?doctorId=${doctorId}&date=${date}`);
}

export async function createAppointment(data) {
  return request('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createSurvey(data) {
  return request('/api/surveys', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
