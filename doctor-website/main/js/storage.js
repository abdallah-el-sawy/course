(function () {
  const STORAGE_KEYS = {
    appointments: "doctorAppointments",
    reviews: "doctorReviews",
  };

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getAppointments() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.appointments), []);
  }

  function saveAppointments(appointments) {
    localStorage.setItem(
      STORAGE_KEYS.appointments,
      JSON.stringify(appointments),
    );
  }

  function getReviews() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.reviews), []);
  }

  function saveReviews(reviews) {
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  }

  window.doctorStorage = {
    STORAGE_KEYS,
    getAppointments,
    saveAppointments,
    getReviews,
    saveReviews,
  };
})();
