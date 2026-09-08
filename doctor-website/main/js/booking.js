(function () {
  const doctorConfig = window.doctorConfig || {
    name: "د/ باسم إبراهيم الشافعي",
    specialty: "أمراض صدرية وحساسية واضطرابات التنفس أثناء النوم",
    phone: "0403322663",
    appointmentStart: "14:00",
    appointmentEnd: "21:00",
    address: "",
    googleMapsUrl: "",
  };

  const dateInput = document.getElementById("appointmentDate");
  const timeSelect = document.getElementById("appointmentTime");
  const bookingForm = document.getElementById("bookingForm");

  function toMinutes(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function generateTimeSlots(
    start = doctorConfig.appointmentStart,
    end = doctorConfig.appointmentEnd,
    intervalMinutes = 30,
  ) {
    const slots = [];
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);

    for (
      let current = startMinutes;
      current <= endMinutes;
      current += intervalMinutes
    ) {
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      const label = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      slots.push(label);
    }

    return slots;
  }

  function getBookingStorageKey() {
    return "doctorAppointments";
  }

  function getAppointments() {
    return doctorStorage.getAppointments();
  }

  function saveAppointment(appointment) {
    const appointments = getAppointments();
    appointments.push(appointment);
    doctorStorage.saveAppointments(appointments);
  }

  function generateAppointmentId() {
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    const date = new Date();
    const year = date.getFullYear();
    return `APT-${year}-${random}`;
  }

  function isPastDateTime(dateValue, timeValue) {
    if (!dateValue || !timeValue) return true;
    const selectedDateTime = new Date(`${dateValue}T${timeValue}`);
    const now = new Date();
    return selectedDateTime < now;
  }

  function validateBookingForm(formData) {
    const errors = {};
    const requiredName = formData.patientName?.trim();
    const phone = formData.patientPhone?.trim();
    const date = formData.appointmentDate?.trim();
    const time = formData.appointmentTime?.trim();
    const reason = formData.visitReason?.trim();
    const email = formData.patientEmail?.trim();

    if (!requiredName) errors.patientName = "من فضلك أدخل الاسم بالكامل";
    if (!phone) {
      errors.patientPhone = "من فضلك أدخل رقم الهاتف";
    } else if (!/^01[0125]\d{8}$/.test(phone) ) {
      errors.patientPhone = "من فضلك أدخل رقم هاتف صحيح";
    }
    if (!date) errors.appointmentDate = "من فضلك اختر التاريخ";
    if (!time) errors.appointmentTime = "من فضلك اختر الموعد";
    if (!reason || reason.length < 5)
      errors.visitReason =
        "السبب أو الملاحظات يجب أن يحتوي على 5 أحرف على الأقل";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.patientEmail = "من فضلك أدخل بريد إلكتروني صحيح";
    }

    if (date && time && isPastDateTime(date, time)) {
      errors.appointmentTime = "لا يمكن حجز موعد في الماضي";
    }

    return errors;
  }

  function renderTimeSlots(dateValue) {
    if (!dateValue) {
      timeSelect.innerHTML = '<option value="">اختر الموعد</option>';
      return;
    }

    const slots = generateTimeSlots();
    const selectedDate = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    const availableSlots = slots.filter((slot) => {
      if (!isToday) return true;
      const slotDateTime = new Date(`${dateValue}T${slot}`);
      return slotDateTime > new Date();
    });

    const options = ['<option value="">اختر الموعد</option>'];
    availableSlots.forEach((slot) => {
      const formattedTime = toArabicTime(slot);
      options.push(`<option value="${slot}">${formattedTime}</option>`);
    });

    timeSelect.innerHTML = options.join("");
  }

  function toArabicTime(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    const suffix = hours >= 12 ? "م" : "ص";
    let convertedHour = hours % 12;
    if (convertedHour === 0) convertedHour = 12;
    return `${convertedHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }

  function attachFieldState() {
    const allInputs = bookingForm.querySelectorAll("input, select, textarea");
    allInputs.forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("invalid"));
      field.addEventListener("change", () => field.classList.remove("invalid"));
    });
  }

  function showBookingErrors(errors) {
    const fields = bookingForm.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      const name = field.name;
      const errorEl = bookingForm.querySelector(`[data-error-for="${name}"]`);
      const hasError = errors[name];
      field.classList.toggle("invalid", Boolean(hasError));
      if (errorEl) {
        errorEl.textContent = hasError || "";
      }
    });
  }

  function disableDuplicateAppointment(date, time) {
    const appointments = getAppointments();
    return appointments.some((appointment) => {
      return appointment.date === date && appointment.time === time;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(bookingForm).entries());
    const errors = validateBookingForm(formData);

    if (Object.keys(errors).length > 0) {
      showBookingErrors(errors);
      ui.showToast("يرجى مراجعة البيانات المدخلة", "error");
      return;
    }

    const appointmentDate = formData.appointmentDate;
    const appointmentTime = formData.appointmentTime;

    if (disableDuplicateAppointment(appointmentDate, appointmentTime)) {
      showBookingErrors({
        appointmentTime: "هذا الموعد تم حجزه مسبقًا في هذا المتصفح",
      });
      ui.showToast("هذا الموعد غير متاح", "error");
      return;
    }

    const appointment = {
      id: generateAppointmentId(),
      patientName: formData.patientName.trim(),
      patientPhone: formData.patientPhone.trim(),
      patientEmail: formData.patientEmail ? formData.patientEmail.trim() : "",
      date: appointmentDate,
      time: appointmentTime,
      reason: formData.visitReason.trim(),
      createdAt: new Date().toISOString(),
    };

    saveAppointment(appointment);

    const formattedDate = new Date(
      `${appointment.date}T00:00:00`,
    ).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    ui.showModal({
      title: "تم تسجيل طلب الحجز بنجاح",
      icon: "✓",
      bodyHtml: `
        <div class="details">
          <div><strong>رقم الحجز:</strong> ${appointment.id}</div>
          <div><strong>التاريخ:</strong> ${formattedDate}</div>
          <div><strong>الوقت:</strong> ${toArabicTime(appointment.time)}</div>
          <div><strong>اسم المريض:</strong> ${appointment.patientName}</div>
          <div><strong>رقم الهاتف:</strong> ${appointment.patientPhone}</div>
        </div>
        <a class="btn btn-primary" href="tel:0403322663">اتصل بالعيادة</a>
      `,
    });

    bookingForm.reset();
    renderTimeSlots("");
    ui.showToast("تم تأكيد الحجز بنجاح", "success");
  }

  function initializeBooking() {
    if (!bookingForm || !dateInput || !timeSelect) return;

    attachFieldState();
    renderTimeSlots("");

    dateInput.addEventListener("change", (event) => {
      const value = event.target.value;
      renderTimeSlots(value);
    });

    bookingForm.addEventListener("submit", handleSubmit);
  }

  window.booking = {
    generateTimeSlots,
    validateBookingForm,
    saveAppointment,
    getAppointments,
    generateAppointmentId,
    initializeBooking,
    renderTimeSlots,
    toArabicTime,
  };
})();
