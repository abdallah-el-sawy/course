(function () {
  function initializeNavigation() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const panel = document.querySelector(".nav-panel");
    const navLinks = document.querySelectorAll(".nav-links a, .nav-cta");

    const setHeaderState = () => {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const isOpen = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        panel?.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
      });
    });

    const currentPath = window.location.hash || "#top";
    document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPath) {
        link.classList.add("active");
      }
    });
  }

  function initializeAnimations() {
    const revealItems = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function showModal({ title, bodyHtml, icon = "✓", actions = [] }) {
    const overlay = document.getElementById("modalOverlay");
    const modalContent = document.getElementById("modalContent");
    const closeButton = document.querySelector(".modal-close");

    if (!overlay || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-icon">${icon}</div>
      <h3 id="modalTitle">${title}</h3>
      <div class="details">${bodyHtml}</div>
      ${actions.length ? `<div class="modal-actions">${actions.map((action) => action).join("")}</div>` : ""}
    `;

    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");

    const closeModal = () => {
      overlay.classList.remove("visible");
      overlay.setAttribute("aria-hidden", "true");
    };

    closeButton?.addEventListener("click", closeModal, { once: true });
    overlay.addEventListener(
      "click",
      (event) => {
        if (event.target === overlay) closeModal();
      },
      { once: true },
    );
  }

  function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.classList.remove("visible");
    toast.textContent = message;
    toast.dataset.type = type;
    requestAnimationFrame(() => {
      toast.classList.add("visible");
    });

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove("visible");
    }, 2600);
  }

  function initializeLocationConfig() {
    const clinicAddressText = document.getElementById("clinic-address-text");
    const locationAddressText = document.getElementById("locationAddressText");
    const mapsLink = document.getElementById("mapsLink");
    const directionsLink = document.getElementById("directionsLink");
    const locationButton = document.getElementById("locationButton");

    const addressLabel =
      doctorConfig && doctorConfig.address
        ? doctorConfig.address
        : "سيتم إضافة عنوان العيادة قريبًا";
    const googleMapsUrl =
      doctorConfig && doctorConfig.googleMapsUrl
        ? doctorConfig.googleMapsUrl
        : "#";

    if (clinicAddressText) {
      clinicAddressText.textContent = addressLabel;
    }

    if (locationAddressText) {
      locationAddressText.textContent = addressLabel;
    }

    if (mapsLink) {
      mapsLink.href = googleMapsUrl;
      mapsLink.classList.toggle(
        "disabled",
        !doctorConfig || !doctorConfig.googleMapsUrl,
      );
      if (!doctorConfig || !doctorConfig.googleMapsUrl) {
        mapsLink.setAttribute("aria-disabled", "true");
        mapsLink.setAttribute("tabindex", "-1");
      }
    }

    if (directionsLink) {
      directionsLink.href = googleMapsUrl;
      directionsLink.classList.toggle(
        "disabled",
        !doctorConfig || !doctorConfig.googleMapsUrl,
      );
      if (!doctorConfig || !doctorConfig.googleMapsUrl) {
        directionsLink.setAttribute("aria-disabled", "true");
        directionsLink.setAttribute("tabindex", "-1");
      }
    }

    if (locationButton) {
      locationButton.href = String(googleMapsUrl || "#");
    }
  }

  window.ui = {
    initializeNavigation,
    initializeAnimations,
    showModal,
    showToast,
    initializeLocationConfig,
  };
})();
