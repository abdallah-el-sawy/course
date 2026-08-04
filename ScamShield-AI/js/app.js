/* =========================================================================
   ScamShield AI — app.js
   Single shared JS file, organized by feature. Every block checks for the
   relevant DOM element before running, so this file works unmodified across
   index.html, scanner.html, assistant.html, and dashboard.html.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScrollState();
  initButtonRipple();
  initScrollReveal();
  initStatCounters();
  initHeroTerminal();
  initScannerCenter();
  initAssistantChat();
  initDashboard();
  initContactForm();
});

/* ============================ NAVBAR SCROLL STATE ======================== */
function initNavbarScrollState() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const applyState = () => {
    if (window.scrollY > 12) {
      nav.style.background = 'rgba(15, 23, 42, 0.92)';
      nav.style.borderBottomColor = 'rgba(248, 250, 252, 0.12)';
    } else {
      nav.style.background = 'rgba(15, 23, 42, 0.75)';
      nav.style.borderBottomColor = 'rgba(248, 250, 252, 0.08)';
    }
  };

  applyState();
  window.addEventListener('scroll', applyState, { passive: true });
}

/* ============================ BUTTON RIPPLE =============================== */
function initButtonRipple() {
  const buttons = document.querySelectorAll('.ss-btn-gradient, .ss-btn-outline');

  buttons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.classList.add('ss-ripple');
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });
  });
}

/* ============================ SCROLL REVEAL =============================== */
function initScrollReveal() {
  const targets = document.querySelectorAll('.fade-in-up');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ============================ ANIMATED COUNTERS ============================ */
function initStatCounters() {
  const counters = document.querySelectorAll('.ss-stat-num, .ss-dash-kpi[data-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = `${value.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = `${target.toLocaleString()}${suffix}`;
      }
    };

    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ============================ HERO TERMINAL (index.html) =================== */
function initHeroTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const meterFill = document.getElementById('heroMeterFill');
  const meterValue = document.getElementById('heroMeterValue');

  const script = [
    { text: '$ scamshield analyze --input "sms_inbox_247.txt"', cls: 'ss-line-prompt' },
    { text: '> Reading message content...', cls: 'ss-line-muted' },
    { text: '> "Your account will be suspended. Verify now: bit.ly/2xK9a"', cls: '' },
    { text: '⚠ Flag: urgency language detected', cls: 'ss-line-flag' },
    { text: '⚠ Flag: shortened URL masking destination', cls: 'ss-line-flag' },
    { text: '⚠ Flag: sender not in verified contacts', cls: 'ss-line-flag' },
    { text: '> Cross-checking domain reputation...', cls: 'ss-line-muted' },
    { text: '✔ Verdict: HIGH RISK — Bank Phishing (92%)', cls: 'ss-line-ok' },
  ];

  let i = 0;
  const cursor = body.querySelector('.ss-scan-line');

  const typeNextLine = () => {
    if (i >= script.length) {
      if (meterFill && meterValue) {
        requestAnimationFrame(() => {
          meterFill.style.width = '92%';
          animateMeterNumber(meterValue, 92);
        });
      }
      window.setTimeout(resetTerminal, 4500);
      return;
    }

    const line = document.createElement('div');
    line.className = `ss-line ${script[i].cls}`;
    line.textContent = script[i].text;
    body.insertBefore(line, cursor);

    i += 1;
    window.setTimeout(typeNextLine, 650);
  };

  const resetTerminal = () => {
    body.querySelectorAll('.ss-line').forEach((el) => el.remove());
    if (meterFill && meterValue) {
      meterFill.style.width = '0%';
      meterValue.textContent = '0%';
    }
    i = 0;
    window.setTimeout(typeNextLine, 500);
  };

  window.setTimeout(typeNextLine, 700);
}

function animateMeterNumber(el, target) {
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = `${Math.round(target * progress)}%`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/* ============================ SCANNER CENTER (scanner.html) ================= */
/* Fake AI report profiles, keyed by scan type, used by the Analyze buttons. */
const SS_REPORT_PROFILES = {
  text: {
    score: 92, level: 'danger', attackType: 'Bank Phishing (Smishing)', confidence: 95,
    reasons: ['Requests one-time password (OTP)', 'Uses urgent, threatening language', 'Impersonates a bank sender ID', 'Contains a shortened, masked link'],
    recommendation: 'Never share an OTP with anyone, including “bank staff.” Contact your bank directly using the number on your card, not the one in this message.',
  },
  link: {
    score: 87, level: 'danger', attackType: 'Credential Harvesting Page', confidence: 91,
    reasons: ['Domain registered less than 30 days ago', 'Lookalike spelling of a known brand', 'Redirect chain hides the final destination', 'No valid security certificate'],
    recommendation: 'Do not enter any login details on this page. Report the link to your IT/security team and delete it.',
  },
  email: {
    score: 78, level: 'warning', attackType: 'Business Email Compromise', confidence: 84,
    reasons: ['Sender domain differs from the display name', 'Requests an urgent wire transfer', 'Unusual reply-to address', 'Generic greeting instead of your name'],
    recommendation: 'Verify the request with the sender through a separate channel (phone call) before taking any financial action.',
  },
  image: {
    score: 65, level: 'warning', attackType: 'Fake Prize / Lottery Scam', confidence: 79,
    reasons: ['Screenshot shows unrealistic reward claims', 'Requests personal ID upload', 'Poor grammar consistent with template scams', 'Unofficial logo usage detected'],
    recommendation: 'Do not upload any personal identification. Legitimate organizations never request ID via chat to claim a prize.',
  },
  qr: {
    score: 71, level: 'warning', attackType: 'QR Code Redirect Scam', confidence: 82,
    reasons: ['QR destination differs from printed context', 'Shortened URL detected after decoding', 'Landing domain flagged in threat feeds', 'No merchant verification found'],
    recommendation: 'Avoid scanning this code. If it was on a physical poster or sticker, report it to the venue — it may have been tampered with.',
  },
  voice: {
    score: 89, level: 'danger', attackType: 'AI Voice Cloning / Authority Scam', confidence: 88,
    reasons: ['Voice pattern shows signs of synthetic generation', 'Caller claims urgent legal/family emergency', 'Requests immediate payment via gift cards', 'Caller ID does not match claimed identity'],
    recommendation: 'Hang up and call the person or organization back directly using a known number. Never pay in gift cards under pressure.',
  },
};

function initScannerCenter() {
  const analyzeButtons = document.querySelectorAll('.ss-analyze-btn');
  if (!analyzeButtons.length) return;

  // Show the chosen filename inside each upload zone.
  document.querySelectorAll('.ss-upload-zone input[type="file"]').forEach((fileInput) => {
    fileInput.addEventListener('change', () => {
      const labelEl = document.getElementById(`${fileInput.id}FileName`);
      if (labelEl && fileInput.files && fileInput.files[0]) {
        labelEl.textContent = fileInput.files[0].name;
      }
    });
  });

  analyzeButtons.forEach((btn) => {

    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const resultEl = document.getElementById(`result-${type}`);
      if (!resultEl) return;

      btn.disabled = true;
      const originalLabel = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Analyzing...';

      resultEl.innerHTML = `
        <div class="ss-spinner-wrap">
          <div class="ss-spinner"></div>
          <span>Running detection models…</span>
        </div>`;

      window.setTimeout(() => {
        resultEl.innerHTML = buildReportMarkup(SS_REPORT_PROFILES[type] || SS_REPORT_PROFILES.text);
        btn.disabled = false;
        btn.innerHTML = originalLabel;
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 2000);
    });
  });
}

function buildReportMarkup(profile) {
  const badgeClass = profile.level === 'danger' ? 'ss-badge-danger'
    : profile.level === 'warning' ? 'ss-badge-warning'
    : 'ss-badge-success';

  const badgeLabel = profile.level === 'danger' ? 'High Risk'
    : profile.level === 'warning' ? 'Medium Risk'
    : 'Low Risk';

  const reasons = profile.reasons.map((r) => `
    <li><i class="bi bi-check-circle-fill"></i><span>${r}</span></li>
  `).join('');

  return `
    <div class="ss-report">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div class="ss-mono text-uppercase" style="font-size:0.75rem;color:var(--text-dim);letter-spacing:0.08em;">Security Report</div>
          <h4 class="mt-1 mb-0">${profile.attackType}</h4>
        </div>
        <span class="ss-badge ${badgeClass}"><i class="bi bi-shield-exclamation"></i>${badgeLabel}</span>
      </div>

      <div class="row g-4 mb-4 text-center">
        <div class="col-4">
          <div class="ss-dash-kpi ss-mono">${profile.score}%</div>
          <div class="ss-dash-kpi-label">Threat Score</div>
        </div>
        <div class="col-4">
          <div class="ss-dash-kpi ss-mono">${profile.confidence}%</div>
          <div class="ss-dash-kpi-label">Confidence</div>
        </div>
        <div class="col-4">
          <div class="ss-dash-kpi ss-mono" style="font-size:1.1rem;">${badgeLabel}</div>
          <div class="ss-dash-kpi-label">Attack Type</div>
        </div>
      </div>

      <h6 class="ss-footer-heading">Reasons</h6>
      <ul class="ss-reason-list mb-4">${reasons}</ul>

      <h6 class="ss-footer-heading">Recommendation</h6>
      <div class="ss-recommendation">
        <i class="bi bi-shield-check me-2"></i>${profile.recommendation}
      </div>
    </div>
  `;
}

/* ============================ AI ASSISTANT CHAT (assistant.html) ============ */
const SS_ASSISTANT_RESPONSES = [
  {
    keywords: ['safe', 'website', 'site', 'domain'],
    reply: 'This depends on a few signals: domain age, certificate validity, and reported history. In this demo, a newly registered domain with no security certificate is treated as suspicious.',
  },
  {
    keywords: ['otp', 'code', 'verification'],
    reply: 'Never share an OTP with anyone, even someone claiming to be from your bank. Banks never ask for OTPs over the phone or by message.',
  },
  {
    keywords: ['link', 'url'],
    reply: 'Paste the link into the Scanner Center under the “Link” tab. I’ll check the domain age, redirect chain, and reputation, then explain the risk in plain terms.',
  },
  {
    keywords: ['email'],
    reply: 'Forward the sender, subject, and body into the Scanner Center “Email” tab. I look for spoofed sender addresses and urgency tactics typical of business email compromise.',
  },
  {
    keywords: ['call', 'voice', 'phone'],
    reply: 'Scam calls often use urgency and a request for immediate payment. If in doubt, hang up and call the organization back on a number you already know.',
  },
  {
    keywords: ['qr'],
    reply: 'QR codes can hide redirect links. Use the Scanner Center “QR” tab to decode and check the destination before opening it on your device.',
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    reply: 'Hi! I’m the ScamShield AI Assistant. Ask me about a suspicious message, link, email, call, or QR code and I’ll walk you through what to look for.',
  },
];

const SS_ASSISTANT_FALLBACK = 'I don’t have a specific answer for that in this demo, but you can run a full check in the Scanner Center — it covers text, links, emails, screenshots, QR codes, and voice recordings.';

function initAssistantChat() {
  const form = document.getElementById('assistantForm');
  const input = document.getElementById('assistantInput');
  const messages = document.getElementById('chatMessages');
  if (!form || !input || !messages) return;

  document.querySelectorAll('.ss-suggested-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.text || chip.textContent.trim();
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendChatMessage(messages, text, 'user');
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    const typingEl = appendTypingIndicator(messages);
    messages.scrollTop = messages.scrollHeight;

    window.setTimeout(() => {
      typingEl.remove();
      const reply = getAssistantReply(text);
      appendChatMessage(messages, reply, 'assistant');
      messages.scrollTop = messages.scrollHeight;
    }, 1100);
  });
}

function getAssistantReply(userText) {
  const lower = userText.toLowerCase();
  const match = SS_ASSISTANT_RESPONSES.find((entry) =>
    entry.keywords.some((kw) => lower.includes(kw))
  );
  return match ? match.reply : SS_ASSISTANT_FALLBACK;
}

function appendChatMessage(container, text, role) {
  const msg = document.createElement('div');
  msg.className = `ss-chat-msg ${role}`;
  msg.textContent = text;
  container.appendChild(msg);
}

function appendTypingIndicator(container) {
  const wrap = document.createElement('div');
  wrap.className = 'ss-chat-msg assistant ss-typing-dots';
  wrap.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(wrap);
  return wrap;
}

/* ============================ CONTACT FORM (about.html) ===================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    success.classList.remove('d-none');
    form.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
function initDashboard() {
  const distributionCanvas = document.getElementById('threatDistributionChart');
  const categoriesCanvas = document.getElementById('topCategoriesChart');
  const riskCanvas = document.getElementById('riskTrendChart');

  if (!distributionCanvas && !categoriesCanvas && !riskCanvas) return;
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = '#94A3B8';
  Chart.defaults.font.family = "'Poppins', sans-serif";

  if (distributionCanvas) {
    new Chart(distributionCanvas, {
      type: 'doughnut',
      data: {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{
          data: [42, 35, 23],
          backgroundColor: ['#EF4444', '#F59E0B', '#22C55E'],
          borderColor: '#1E293B',
          borderWidth: 3,
        }],
      },
      options: {
        plugins: { legend: { position: 'bottom', labels: { padding: 16 } } },
        cutout: '68%',
      },
    });
  }

  if (categoriesCanvas) {
    new Chart(categoriesCanvas, {
      type: 'bar',
      data: {
        labels: ['Phishing', 'Fake Delivery', 'Prize Scam', 'BEC', 'Voice Clone', 'QR Redirect'],
        datasets: [{
          label: 'Cases detected',
          data: [186, 142, 98, 76, 54, 41],
          backgroundColor: '#3B82F6',
          borderRadius: 8,
          maxBarThickness: 28,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(248,250,252,0.06)' }, beginAtZero: true },
        },
      },
    });
  }

  if (riskCanvas) {
    new Chart(riskCanvas, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Average risk score',
          data: [58, 63, 60, 71, 68, 74, 69],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.12)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(248,250,252,0.06)' }, min: 0, max: 100 },
        },
      },
    });
  }
}
