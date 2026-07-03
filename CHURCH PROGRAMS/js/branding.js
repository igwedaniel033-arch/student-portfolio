// Loads branding.json and applies simple theme and text replacements
(async function(){
  try{
    const res = await fetch('/branding.json');
    if(!res.ok) return;
    const cfg = await res.json();

    if(cfg.siteTitle) document.title = cfg.siteTitle + ' — Home';
    if(cfg.primaryColor) document.documentElement.style.setProperty('--primary', cfg.primaryColor);
    if(cfg.accentColor) document.documentElement.style.setProperty('--accent', cfg.accentColor);
    // expose config globally for other scripts
    window.__branding = cfg;

    const brandText = document.querySelector('.brand-text');
    if(brandText && cfg.brandText) brandText.textContent = cfg.brandText;

    const logo = document.querySelector('.logo');
    if(logo && cfg.logoPath) logo.src = cfg.logoPath;

    const contactLink = document.getElementById('contactEmail') || document.querySelector('.contact-info a[href^="mailto:"]');
    if(contactLink && cfg.contactEmail){
      contactLink.href = 'mailto:' + cfg.contactEmail;
      contactLink.textContent = cfg.contactEmail;
    }

    // Footer brand replace
    const footerBrand = document.querySelector('.site-footer .brand-text');
    if(!footerBrand){
      const footerP = document.querySelector('.site-footer p');
      if(footerP && cfg.brandText){
        footerP.innerHTML = `&copy; <span id="year"></span> ${cfg.brandText}`;
      }
    }

    // Apply theme presets if provided
    const applyThemeVars = (vars) => {
      for(const k in vars){
        document.documentElement.style.setProperty(k, vars[k]);
      }
    }

    const headerRow = document.querySelector('.header-row');
    if(cfg.themes && Array.isArray(cfg.themes) && headerRow){
      // Create a theme selector UI
      const select = document.createElement('select');
      select.id = 'themeSelector';
      select.title = 'Choose site theme';
      select.className = 'theme-selector';

      cfg.themes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        select.appendChild(opt);
      });

      // Insert selector into header (right side)
      const wrapper = document.createElement('div');
      wrapper.style.display = 'inline-block';
      wrapper.style.marginLeft = '0.75rem';
      wrapper.appendChild(select);
      headerRow.appendChild(wrapper);

      const saved = localStorage.getItem('siteTheme') || cfg.defaultTheme;
      const initial = cfg.themes.find(t => t.id === saved) || cfg.themes[0];
      if(initial) applyThemeVars(initial.vars);
      select.value = initial.id;

      select.addEventListener('change', () => {
        const id = select.value;
        const theme = cfg.themes.find(t => t.id === id);
        if(theme){
          applyThemeVars(theme.vars);
          localStorage.setItem('siteTheme', id);
        }
      });
    }

    // Load reCAPTCHA script if configured
    if (cfg.recaptchaEnabled && cfg.recaptchaSiteKey) {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${cfg.recaptchaSiteKey}`;
      s.async = true;
      document.head.appendChild(s);
    }

  }catch(err){
    console.warn('Branding load failed', err);
  }
})();
