// Professional interactions: nav toggle, footer year, and async contact submission
(function(){
  const navToggle = document.getElementById('navToggle');
  navToggle && navToggle.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    document.body.classList.toggle('nav-open');
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form submission: try Netlify function, fallback to /api/contact
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  if(!form) return;

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    statusEl.textContent = '';
    const submitBtn = form.querySelector('button[type="submit"]');
    const data = {
      name: form.elements['name'].value.trim(),
      email: form.elements['email'].value.trim(),
      message: form.elements['message'].value.trim(),
      _hp: (form.elements['_hp'] && form.elements['_hp'].value) || ''
    };

    // If branding config enables reCAPTCHA, fetch token
    if (window.__branding && window.__branding.recaptchaEnabled && window.__branding.recaptchaSiteKey && window.grecaptcha) {
      try {
        const token = await grecaptcha.execute(window.__branding.recaptchaSiteKey, { action: 'submit' });
        data.recaptchaToken = token;
      } catch (err) {
        console.warn('reCAPTCHA execute failed', err);
      }
    }

    // Basic client-side validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email)) {
      statusEl.textContent = 'Please enter a valid email address.';
      return;
    }
    if (!data.message || data.message.length < 5) {
      statusEl.textContent = 'Please enter a longer message.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Try Netlify function first, fallback to backend API
    const endpoints = ['/.netlify/functions/contact', 'http://localhost:5000/api/contact'];
    let ok = false;
    let lastErr = null;

    for(const url of endpoints){
      try{
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if(res.ok){
          statusEl.textContent = 'Thanks — your message has been sent.';
          statusEl.style.color = '#0f76ef';
          form.reset();
          ok = true;
          break;
        } else {
          lastErr = await res.text().catch(()=>res.statusText);
        }
      }catch(err){
        lastErr = err.message || String(err);
      }
    }

    if(!ok){
      statusEl.textContent = 'Sorry, we could not send your message. Please try again later.';
      statusEl.style.color = '#d93025';
      console.error('Contact send failed:', lastErr);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  });

  const missionsContainer = document.getElementById('missionsList');
  const missionsStatus = document.getElementById('missionsStatus');

  async function loadMissions() {
    if(!missionsContainer) return;
    missionsStatus.textContent = 'Loading missions...';
    try {
      const res = await fetch('http://localhost:5000/api/missions');
      if (!res.ok) throw new Error('Unable to load missions');
      const missions = await res.json();
      missionsContainer.innerHTML = missions.length ? missions.map(m => `
        <article class="card">
          <h3>${m.title || 'Untitled Mission'}</h3>
          <p>${m.description || 'No description provided.'}</p>
          <p><strong>Status:</strong> ${m.published ? 'Published' : 'Draft'}</p>
          <p><strong>Reward:</strong> ${m.reward || 'N/A'}</p>
          <p><strong>Deadline:</strong> ${m.deadline ? new Date(m.deadline).toLocaleDateString() : 'N/A'}</p>
        </article>
      `).join('') : '<p class="form-status">No missions currently available.</p>';
      missionsStatus.textContent = '';
    } catch (err) {
      missionsStatus.textContent = 'Failed to load missions. Is backend running?';
      missionsStatus.style.color = '#d93025';
      missionsContainer.innerHTML = '';
      console.error(err);
    }
  }

  loadMissions();

  if (window.io) {
    const socket = io('http://localhost:5000');
    socket.on('mission:created', loadMissions);
    socket.on('mission:updated', loadMissions);
    socket.on('mission:deleted', loadMissions);
    socket.on('mission:progress', (data) => {
      missionsStatus.textContent = `Mission progress updated: ${data.completionStatus || 'changed'}`;
      setTimeout(() => { if (missionsStatus) missionsStatus.textContent = ''; }, 4500);
    });
    socket.on('connect', () => console.log('Connected to mission websocket')); 
    socket.on('disconnect', () => console.log('Disconnected from mission websocket'));
  }
})();
