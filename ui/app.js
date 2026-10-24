/**
 * SnipURL Frontend — Interactive Demo
 * Handles: variant picker, form submission, drawing animation, travelling product, wordmark spread
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    activeVariant: 'basic',
    pathLengths: {},
    drawingAnimated: false,
  };

  // ==================== DOM References ====================
  const els = {
    nav: document.querySelector('.nav'),
    hero: document.querySelector('.hero'),
    wordmarkSpread: document.querySelector('.wordmark-spread'),
    closeWordmark: document.querySelector('.close-wordmark'),
    travellingProduct: document.getElementById('travelling-product'),
    variantBtns: document.querySelectorAll('.variant-btn'),
    demoPanels: document.querySelectorAll('.demo-panel'),
    shortenForms: {
      basic: document.getElementById('shorten-form'),
      custom: document.getElementById('shorten-form-custom'),
      stats: document.getElementById('shorten-form-stats'),
    },
    results: {
      basic: document.getElementById('result-basic'),
      custom: document.getElementById('result-custom'),
      stats: document.getElementById('result-stats'),
    },
    errors: {
      basic: document.getElementById('error-basic'),
      custom: document.getElementById('error-custom'),
      stats: document.getElementById('error-stats'),
    },
    shortUrlDisplays: {
      basic: document.getElementById('short-url-basic'),
      custom: document.getElementById('short-url-custom'),
      stats: document.getElementById('short-url-stats'),
    },
    codeDisplays: {
      basic: document.getElementById('code-basic'),
      custom: document.getElementById('code-custom'),
      stats: document.getElementById('code-stats'),
    },
    clicksDisplay: document.getElementById('clicks-stats'),
    urlInputs: {
      basic: document.getElementById('url-input'),
      custom: document.getElementById('url-input-custom'),
      stats: document.getElementById('url-input-stats'),
    },
    customCodeInput: document.getElementById('custom-code'),
    copyBtns: document.querySelectorAll('.btn-copy'),
    drawing: document.querySelector('.drawing'),
    activePath: document.getElementById('active-path'),
    drawPaths: {
      basic: document.getElementById('draw-path-basic'),
      custom: document.getElementById('draw-path-custom'),
      stats: document.getElementById('draw-path-stats'),
    },
    drawNodes: document.querySelector('.draw-nodes'),
    factLatency: document.getElementById('fact-latency'),
    factEncoding: document.getElementById('fact-encoding'),
    factChars: document.getElementById('fact-chars'),
  };

  // ==================== Travelling Product Path ====================
  // Keyframes: { progress: 0-1, x: %, y: %, rotation: deg, scale: factor, opacity: 0-1 }
  const productKeyframes = [
    { progress: 0.00, x: 5, y: 15, rotation: -3, scale: 1.0, opacity: 1 },
    { progress: 0.15, x: 12, y: 18, rotation: -1, scale: 1.05, opacity: 1 },
    { progress: 0.30, x: 25, y: 22, rotation: 2, scale: 1.1, opacity: 1 },
    { progress: 0.45, x: 42, y: 30, rotation: 5, scale: 1.0, opacity: 1 },
    { progress: 0.60, x: 60, y: 42, rotation: 8, scale: 0.95, opacity: 1 },
    { progress: 0.72, x: 78, y: 55, rotation: 10, scale: 0.9, opacity: 0.8 },
    { progress: 0.82, x: 88, y: 68, rotation: 12, scale: 0.8, opacity: 0.4 },
    { progress: 0.92, x: 92, y: 80, rotation: 15, scale: 0.6, opacity: 0.1 },
    { progress: 1.00, x: 95, y: 90, rotation: 18, scale: 0.4, opacity: 0 },
  ];

  // ==================== Drawing Facts per Variant ====================
  const variantFacts = {
    basic: { latency: '~0.8ms', encoding: 'Base62', chars: '4–6' },
    custom: { latency: '~1.1ms', encoding: 'Base62*', chars: '1–32' },
    stats: { latency: '~1.5ms', encoding: 'Base62', chars: '4–6' },
  };

  // ==================== Init ====================
  function init() {
    setupVariantPicker();
    setupForms();
    setupCopyButtons();
    setupDrawing();
    setupScrollEffects();
    setupTravellingProduct();
    setupWordmarkSpread();
    setupSmoothScroll();
  }

  // ==================== Variant Picker ====================
  function setupVariantPicker() {
    els.variantBtns.forEach(btn => {
      btn.addEventListener('click', () => switchVariant(btn.dataset.variant));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchVariant(btn.dataset.variant);
        }
      });
    });
  }

  function switchVariant(variant) {
    state.activeVariant = variant;

    // Update buttons
    els.variantBtns.forEach(btn => {
      const isActive = btn.dataset.variant === variant;
      btn.setAttribute('aria-selected', isActive);
      btn.setAttribute('aria-controls', `panel-${variant}`);
    });

    // Update panels
    els.demoPanels.forEach(panel => {
      const isActive = panel.id === `panel-${variant}`;
      panel.hidden = !isActive;
      panel.setAttribute('aria-hidden', !isActive);
    });

    // Update drawing
    updateDrawing(variant);

    // Update facts
    updateFacts(variant);

    // Clear any previous results/errors
    clearResults(variant);
    clearErrors(variant);
  }

  // ==================== Drawing Animation ====================
  function setupDrawing() {
    // Pre-calculate path lengths
    Object.entries(els.drawPaths).forEach(([key, path]) => {
      if (path) {
        const length = path.getTotalLength();
        state.pathLengths[key] = length;
        path.style.setProperty('--path-length', length);
      }
    });

    // Set initial path
    updateDrawing('basic');

    // Trigger animation on first view (IntersectionObserver)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !state.drawingAnimated) {
          animateDrawing();
          state.drawingAnimated = true;
        }
      });
    }, { threshold: 0.3 });

    if (els.drawing) {
      observer.observe(els.drawing);
    }
  }

  function updateDrawing(variant) {
    const path = els.drawPaths[variant];
    if (!path || !els.activePath) return;

    // Update the <use> href
    els.activePath.setAttribute('href', `#draw-path-${variant}`);

    // Reset animation
    els.activePath.classList.remove('drawn');
    if (els.drawNodes) els.drawNodes.style.opacity = '0';

    // Force reflow then animate
    requestAnimationFrame(() => {
      const length = state.pathLengths[variant] || 1000;
      els.activePath.style.setProperty('--path-length', length);
      els.activePath.style.strokeDashoffset = length;

      requestAnimationFrame(() => {
        els.activePath.classList.add('drawn');
      });
    });
  }

  function animateDrawing() {
    if (els.activePath) {
      els.activePath.classList.add('drawn');
    }
    if (els.drawNodes) {
      setTimeout(() => { els.drawNodes.style.opacity = '1'; }, 1800);
    }
  }

  function updateFacts(variant) {
    const facts = variantFacts[variant];
    if (!facts) return;

    if (els.factLatency) els.factLatency.textContent = facts.latency;
    if (els.factEncoding) els.factEncoding.textContent = facts.encoding;
    if (els.factChars) els.factChars.textContent = facts.chars;
  }

  // ==================== Forms ====================
  function setupForms() {
    Object.entries(els.shortenForms).forEach(([variant, form]) => {
      if (form) {
        form.addEventListener('submit', e => handleSubmit(e, variant));
      }
    });
  }

  async function handleSubmit(event, variant) {
    event.preventDefault();

    const urlInput = els.urlInputs[variant];
    const url = urlInput?.value?.trim();

    if (!url) {
      showError(variant, 'Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      showError(variant, 'Please enter a valid HTTP/HTTPS URL');
      return;
    }

    const customCode = variant === 'custom' ? els.customCodeInput?.value?.trim() : null;
    if (customCode && !/^[a-zA-Z0-9_-]+$/.test(customCode)) {
      showError(variant, 'Custom code: alphanumeric, hyphen, underscore only');
      return;
    }

    clearErrors(variant);
    hideResult(variant);

    // Prepare request
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Shortening...';
    }

    try {
      const apiBase = window.SNIPURL?.apiBase || '';
      const apiKey = window.SNIPURL?.apiKey || 'dev-key';
      const url = `${apiBase}/shorten`;

      const body = { url };
      if (customCode) body.code = customCode;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to shorten. Please try again.';

        if (response.status === 400) {
          const data = await response.json();
          errorMessage = data.detail || 'Invalid request. Check your custom code format (1-32 alphanumeric, hyphen, underscore).';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Check your API key.';
        } else if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 5;
          errorMessage = `Rate limit exceeded. Try again in ${retryAfter}s.`;
        } else {
          const data = await response.json();
          errorMessage = data.detail || errorMessage;
        }

        showError(variant, errorMessage);
        return;
      }

      const data = await response.json();
      showResult(variant, data.short_url, data.code);

      // If stats variant, fetch and display stats
      if (variant === 'stats') {
        const stats = await fetchStats(data.code);
        if (stats) {
          if (els.clicksDisplay) els.clicksDisplay.textContent = stats.clicks;
        }
      }
    } catch (err) {
      showError(variant, 'Network error. Please check your connection and try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  // generateCode removed – backend now generates codes
  // function generateCode() {
  //   const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  //   let code = '';
  //   for (let i = 0; i < 5; i++) {
  //     code += chars[Math.floor(Math.random() * chars.length)];
  //   }
  //   return code;
  // }

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function showResult(variant, shortUrl, code) {
    const result = els.results[variant];
    const shortUrlEl = els.shortUrlDisplays[variant];
    const codeEl = els.codeDisplays[variant];

    if (shortUrlEl) shortUrlEl.textContent = shortUrl;
    if (codeEl) codeEl.textContent = code;

    // For stats variant, reset clicks
    if (variant === 'stats' && els.clicksDisplay) {
      els.clicksDisplay.textContent = '0';
    }

    if (result) result.hidden = false;
  }

  function hideResult(variant) {
    const result = els.results[variant];
    if (result) result.hidden = true;
  }

  function showError(variant, message) {
    const error = els.errors[variant];
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  }

  function clearErrors(variant) {
    const error = els.errors[variant];
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
  }

  // fetchStats helper for stats variant
  async function fetchStats(code) {
    try {
      const apiBase = window.SNIPURL?.apiBase || '';
      const apiKey = window.SNIPURL?.apiKey || 'dev-key';
      const url = `${apiBase}/stats/${code}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          showError('stats', 'Authentication failed. Check your API key.');
        } else if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 5;
          showError('stats', `Rate limit exceeded. Try again in ${retryAfter}s.`);
        } else {
          showError('stats', 'Failed to load stats. Please try again.');
        }
        return null;
      }

      const data = await response.json();
      return data;
    } catch (err) {
      showError('stats', 'Failed to load stats. Please try again.');
      return null;
    }
  }

  function clearResults(variant) {
    hideResult(variant);
    clearErrors(variant);
  }

  // ==================== Copy Buttons ====================
  function setupCopyButtons() {
    els.copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
          const text = target.textContent;
          navigator.clipboard.writeText(text).then(() => {
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.color = 'var(--blue)';
            btn.style.borderColor = 'var(--blue)';
            setTimeout(() => {
              btn.textContent = original;
              btn.style.color = '';
              btn.style.borderColor = '';
            }, 1500);
          }).catch(() => {
            // Fallback
            const original = btn.textContent;
            btn.textContent = 'Failed';
            setTimeout(() => { btn.textContent = original; }, 1500);
          });
        }
      });
    });
  }

  // ==================== Scroll Effects ====================
  function setupScrollEffects() {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateWordmarkSpread();
          updateTravellingProduct();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial
    updateWordmarkSpread();
    updateTravellingProduct();
  }

  // ==================== Wordmark Spread ====================
  function setupWordmarkSpread() {
    // Already handled in scroll
  }

  function updateWordmarkSpread() {
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = els.hero?.offsetHeight || 0;
    const heroBottom = heroHeight;

    // Hero wordmark spread
    if (els.wordmarkSpread) {
      const progress = Math.min(scrollY / (heroBottom * 0.7), 1);
      if (progress > 0.1) {
        els.wordmarkSpread.classList.add('scrolled');
      } else {
        els.wordmarkSpread.classList.remove('scrolled');
      }
    }

    // Close wordmark spread
    if (els.closeWordmark) {
      const closeSection = document.getElementById('close');
      if (closeSection) {
        const closeTop = closeSection.offsetTop;
        const closeHeight = closeSection.offsetHeight;
        const progress = Math.min(Math.max((scrollY - closeTop + window.innerHeight * 0.3) / (closeHeight * 0.5), 0), 1);

        // Scale and fade
        const scale = 1 + progress * 0.5;
        const opacity = 0.12 * (1 - progress * 0.5);
        const translateY = -40 + progress * 40;

        els.closeWordmark.style.transform = `translateY(${translateY}px) scale(${scale})`;
        els.closeWordmark.style.opacity = opacity;
      }
    }
  }

  // ==================== Travelling Product ====================
  function setupTravellingProduct() {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced && els.travellingProduct) {
      els.travellingProduct.classList.add('hidden');
      return;
    }

    // Initial position
    updateTravellingProduct();
  }

  function updateTravellingProduct() {
    if (!els.travellingProduct || els.travellingProduct.classList.contains('hidden')) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / docHeight, 1);

    // Find keyframe interval
    let frame = productKeyframes[0];
    for (let i = 0; i < productKeyframes.length - 1; i++) {
      if (progress >= productKeyframes[i].progress && progress <= productKeyframes[i + 1].progress) {
        const t = (progress - productKeyframes[i].progress) /
                  (productKeyframes[i + 1].progress - productKeyframes[i].progress);
        frame = interpolateKeyframe(productKeyframes[i], productKeyframes[i + 1], t);
        break;
      }
    }

    // Apply transform
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = (frame.x / 100) * vw;
    const y = (frame.y / 100) * vh;

    els.travellingProduct.style.transform = `
      translate(${x}px, ${y}px)
      rotate(${frame.rotation}deg)
      scale(${frame.scale})
    `;
    els.travellingProduct.style.opacity = frame.opacity;

    if (frame.opacity <= 0) {
      els.travellingProduct.classList.add('hidden');
    } else {
      els.travellingProduct.classList.remove('hidden');
    }
  }

  function interpolateKeyframe(a, b, t) {
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    return {
      progress: a.progress + (b.progress - a.progress) * t,
      x: a.x + (b.x - a.x) * ease,
      y: a.y + (b.y - a.y) * ease,
      rotation: a.rotation + (b.rotation - a.rotation) * ease,
      scale: a.scale + (b.scale - a.scale) * ease,
      opacity: a.opacity + (b.opacity - a.opacity) * ease,
    };
  }

  // ==================== Smooth Scroll for Anchor Links ====================
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight = els.nav?.offsetHeight || 58;
          const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });

          // Update URL without scroll
          history.pushState(null, '', targetId);
        }
      });
    });
  }

  // ==================== Ready ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();