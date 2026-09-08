const doctorConfig = {
  name: "د/ باسم إبراهيم الشافعي",
  specialty: "أمراض صدرية وحساسية واضطرابات التنفس أثناء النوم",
  phone: "0403322663",
  appointmentStart: "14:00",
  appointmentEnd: "21:00",
  address: "",
  googleMapsUrl: "",
};

window.doctorConfig = doctorConfig;

document.addEventListener("DOMContentLoaded", () => {
  ui.initializeNavigation();
  ui.initializeAnimations();
  ui.initializeLocationConfig();
  booking.initializeBooking();
  reviews.initializeReviews();

  const whatsappLink = document.getElementById("whatsappLink");
  if (whatsappLink) {
    whatsappLink.hidden = true;
  }

  const mapsLink = document.getElementById("mapsLink");
  const directionsLink = document.getElementById("directionsLink");
  if (mapsLink && !doctorConfig.googleMapsUrl) {
    mapsLink.href = "#";
  }
  if (directionsLink && !doctorConfig.googleMapsUrl) {
    directionsLink.href = "#";
  }

  const phoneButtons = document.querySelectorAll('a[href="tel:0403322663"]');
  phoneButtons.forEach((button) => {
    button.setAttribute("aria-label", "اتصال مباشر");
  });
});
