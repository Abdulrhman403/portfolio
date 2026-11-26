// Global Fullscreen helpers for immersive intro gate
const enterIntroFullscreen = () => {
  const docEl = document.documentElement;
  if (!document.fullscreenElement && docEl.requestFullscreen) {
    docEl.requestFullscreen().catch(() => {});
  }
};

const exitIntroFullscreen = () => {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
};
document.addEventListener('DOMContentLoaded', () => {
 // Interactive Gate (Spotlight + Hold to Split)
  const gate = document.getElementById('hero');
  const spotlight = document.getElementById('gate-spotlight');
  const holdBtn = document.getElementById('gate-hold-btn');
  const holdText = document.getElementById('gate-hold-text');
  const progressCircle = document.getElementById('gate-progress');
  const skipBtn = document.getElementById('skip-journey-btn');

  const CIRCUMFERENCE = 339.29;
  const HOLD_DURATION = 1300; // 1.3 seconds
  let holdStart = null;
  let rafId = null;
  let isUnlocked = false;
// Interactive Cinema Curtain Pull Cord
  const curtainLeft = document.getElementById('curtain-left');
  const curtainRight = document.getElementById('curtain-right');
  const curtainRope = document.getElementById('curtain-rope');

  let isPullingRope = false;
  let ropeStartY = 0;
  let ropePullDistance = 0;
  let curtainsOpened = false;
  const PULL_THRESHOLD = 110; // Pixels needed to trigger full curtain open

  const openCurtains = () => {
    if (curtainsOpened) return;
    curtainsOpened = true;
    isPullingRope = false;
    if (gate) gate.classList.add('curtains-opened');
  };

  if (curtainRope && curtainLeft && curtainRight) {
    curtainRope.addEventListener('pointerdown', (e) => {
      if (curtainsOpened) return;
      e.preventDefault();
      isPullingRope = true;
      ropeStartY = e.clientY;
      curtainRope.classList.add('pulling');
      curtainRope.setPointerCapture(e.pointerId);
    });

    curtainRope.addEventListener('pointermove', (e) => {
      if (!isPullingRope || curtainsOpened) return;
      const deltaY = Math.max(0, Math.min(e.clientY - ropeStartY, 160));
      ropePullDistance = deltaY;

      // Move rope down and slightly part curtains in real time
      curtainRope.style.transform = `translateY(${deltaY}px)`;
      const partRatio = deltaY / PULL_THRESHOLD;
      const shiftX = Math.min(partRatio * 22, 25);
      const scaleX = Math.max(1 - partRatio * 0.08, 0.9);

      curtainLeft.style.transform = `translateX(-${shiftX}%) scaleX(${scaleX})`;
      curtainRight.style.transform = `translateX(${shiftX}%) scaleX(${scaleX})`;

      if (deltaY >= PULL_THRESHOLD) {
        openCurtains();
      }
    });

    const releaseRope = (e) => {
      if (!isPullingRope) return;
      isPullingRope = false;
      curtainRope.classList.remove('pulling');

      if (e && e.pointerId && curtainRope.hasPointerCapture(e.pointerId)) {
        curtainRope.releasePointerCapture(e.pointerId);
      }

      // If pulled halfway or clicked quickly, complete opening; otherwise spring back
      if (ropePullDistance >= PULL_THRESHOLD * 0.45 || ropePullDistance < 6) {
        openCurtains();
      } else {
        curtainRope.style.transform = '';
        curtainLeft.style.transition = 'transform 0.4s ease';
        curtainRight.style.transition = 'transform 0.4s ease';
        curtainLeft.style.transform = '';
        curtainRight.style.transform = '';
        setTimeout(() => {
          if (!curtainsOpened) {
            curtainLeft.style.transition = '';
            curtainRight.style.transition = '';
          }
        }, 400);
      }
      ropePullDistance = 0;
    };

    curtainRope.addEventListener('pointerup', releaseRope);
    curtainRope.addEventListener('pointercancel', releaseRope);
  }
// Draggable flashlight logic with seamless button auto-trigger
  const torch = document.getElementById('gate-torch');
  let isDraggingTorch = false;
  let isTorchOverHold = false;
  let skipHoverTimer = null;

  const isInsideElement = (x, y, el, padding = 10) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      x >= rect.left - padding &&
      x <= rect.right + padding &&
      y >= rect.top - padding &&
      y <= rect.bottom + padding
    );
  };
 const updateHoldProgress = (timestamp) => {
    if (!holdStart) holdStart = timestamp;
    const elapsed = timestamp - holdStart;
    const progress = Math.min(elapsed / HOLD_DURATION, 1);

    if (progressCircle) {
      progressCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(updateHoldProgress);
    } else {
      completeUnlock();
    }
  };

 const startHold = (e) => {
    if (isUnlocked) return;
    enterIntroFullscreen();
    if (e && e.preventDefault) e.preventDefault();
    if (rafId) return; // Prevent duplicate triggers while already holding
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    holdStart = null;
    if (holdBtn) holdBtn.classList.add('holding');
    if (holdText) holdText.textContent = lang === 'ar' ? 'استمر...' : 'Keep holding...';
    rafId = requestAnimationFrame(updateHoldProgress);
  };

  const cancelHold = () => {
    if (isUnlocked) return;
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    cancelAnimationFrame(rafId);
    rafId = null;
    holdStart = null;
    if (holdBtn) holdBtn.classList.remove('holding');
    if (holdText) holdText.textContent = lang === 'ar' ? 'اضغط مطولاً' : 'Press & Hold';
    if (progressCircle) progressCircle.style.strokeDashoffset = CIRCUMFERENCE;
  };

  if (holdBtn) {
    holdBtn.addEventListener('pointerdown', startHold);
    holdBtn.addEventListener('pointerup', cancelHold);
    holdBtn.addEventListener('pointerleave', cancelHold);
    holdBtn.addEventListener('pointercancel', cancelHold);
  }
  const checkTorchInteractions = (x, y) => {
    if (!torch || isUnlocked) return;

    const overHold = isInsideElement(x, y, holdBtn, 8);
    const overSkip = isInsideElement(x, y, skipBtn, 12);

    // Smoothly hide yellow torch handle when over either button
    if (overHold || overSkip) {
      torch.classList.add('gate__torch--hidden');
    } else {
      torch.classList.remove('gate__torch--hidden');
    }

    // Auto-start or cancel Hold button seamlessly
    if (overHold && !isTorchOverHold) {
      isTorchOverHold = true;
      startHold();
    } else if (!overHold && isTorchOverHold) {
      isTorchOverHold = false;
      cancelHold();
    }

    // Auto-trigger Skip button after brief hover (350ms)
    if (overSkip) {
      if (!skipHoverTimer) {
        skipHoverTimer = setTimeout(() => {
          completeUnlock();
        }, 350);
      }
    } else if (skipHoverTimer) {
      clearTimeout(skipHoverTimer);
      skipHoverTimer = null;
    }
  };

  const setLightPosition = (x, y) => {
    if (spotlight) {
      spotlight.style.setProperty('--x', `${x}px`);
      spotlight.style.setProperty('--y', `${y}px`);
    }
    if (torch) {
      torch.style.setProperty('--x', `${x}px`);
      torch.style.setProperty('--y', `${y}px`);
    }
  };

  if (gate && torch && spotlight) {
    setLightPosition(window.innerWidth * 0.2, window.innerHeight * 0.25);

    torch.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      isDraggingTorch = true;
      torch.classList.add('dragging');
      torch.setPointerCapture(e.pointerId);
    });

    torch.addEventListener('pointermove', (e) => {
      if (!isDraggingTorch) return;
      setLightPosition(e.clientX, e.clientY);
      checkTorchInteractions(e.clientX, e.clientY);
    });

    const stopDraggingTorch = (e) => {
      if (!isDraggingTorch) return;
      isDraggingTorch = false;
      torch.classList.remove('dragging', 'gate__torch--hidden');
      if (isTorchOverHold) {
        isTorchOverHold = false;
        cancelHold();
      }
      if (skipHoverTimer) {
        clearTimeout(skipHoverTimer);
        skipHoverTimer = null;
      }
      if (e && e.pointerId && torch.hasPointerCapture(e.pointerId)) {
        torch.releasePointerCapture(e.pointerId);
      }
    };

    torch.addEventListener('pointerup', stopDraggingTorch);
    torch.addEventListener('pointercancel', stopDraggingTorch);
  }
  const startJourneyBtn = document.getElementById('gate-start-btn');
// Fullscreen helpers for immersive intro gate
  const enterIntroFullscreen = () => {
    const docEl = document.documentElement;
    if (!document.fullscreenElement && docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {
        // Silently ignore if browser blocks fullscreen
      });
    }
  };

  const exitIntroFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };
  const completeUnlock = () => {
    if (isUnlocked) return;
    isUnlocked = true;
    cancelAnimationFrame(rafId);

    if (gate) {
      gate.classList.add('curtains-opened', 'unlocked');
    }
    document.body.classList.remove('journey-locked');

    // Reveal the "Ready to start the journey?" button after panels split
    setTimeout(() => {
      if (holdBtn) holdBtn.hidden = true;
      if (startJourneyBtn) startJourneyBtn.hidden = false;
    }, 650);
  };

 

 if (skipBtn) {
  skipBtn.addEventListener('click', () => {
    enterIntroFullscreen();
    completeUnlock();
  });
}
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('main section[id]');
  const projectsGrid = document.getElementById('projects-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const langToggle = document.getElementById('lang-toggle');

  let allProjects = [];
  let currentFilter = 'all';

  // Mobile Menu Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.textContent = isOpen ? '✕' : '☰';
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      });
    });
  }

  // Active Nav Link on Scroll
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
          });
        }
      });
    },
    { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  // Render Projects Safely
  const renderProjects = () => {
    if (!projectsGrid) return;
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const filtered =
      currentFilter === 'all'
        ? allProjects
        : allProjects.filter((project) => project.category === currentFilter);

    projectsGrid.innerHTML = '';

    filtered.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'project-card';

      const body = document.createElement('div');
      body.className = 'project-card__body';

      const tag = document.createElement('span');
      tag.className = 'project-card__tag';
      tag.textContent = project.tag;

      const title = document.createElement('h3');
      title.className = 'project-card__title';
      title.textContent = project.title[lang] || project.title.ar;

      const desc = document.createElement('p');
      desc.className = 'project-card__desc';
      desc.textContent = project.description[lang] || project.description.ar;

      const techList = document.createElement('div');
      techList.className = 'project-card__tech';
      project.tech.forEach((item) => {
        const span = document.createElement('span');
        span.textContent = item;
        techList.appendChild(span);
      });

      const links = document.createElement('div');
      links.className = 'project-card__links';

      const liveLink = document.createElement('a');
      liveLink.href = project.liveUrl;
      liveLink.target = '_blank';
      liveLink.rel = 'noopener noreferrer';
      liveLink.textContent = lang === 'ar' ? 'معاينة حية ↗' : 'Live Demo ↗';

      const repoLink = document.createElement('a');
      repoLink.href = project.repoUrl;
      repoLink.target = '_blank';
      repoLink.rel = 'noopener noreferrer';
      repoLink.textContent = lang === 'ar' ? 'الكود (GitHub)' : 'Source Code';

      links.append(liveLink, repoLink);
      body.append(tag, title, desc, techList, links);
      card.appendChild(body);
      projectsGrid.appendChild(card);
    });
  };

  // Load Projects from JSON
  const loadProjects = async () => {
    try {
      const response = await fetch('data/projects.json');
      if (!response.ok) throw new Error('Failed to fetch projects');
      allProjects = await response.json();
      renderProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Filter Buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderProjects();
    });
  });

  // Re-render projects when language switches
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      setTimeout(renderProjects, 0);
    });
  }

  loadProjects();
})
// Contact Form Validation
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const lang = document.documentElement.getAttribute('lang') || 'ar';

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (name.length < 2 || !emailRegex.test(email) || message.length < 10) {
        formStatus.style.color = '#ef4444';
        formStatus.textContent =
          lang === 'ar'
            ? 'يرجى التأكد من إدخال اسم صحيح، بريد إلكتروني سليم، ورسالة لا تقل عن 10 أحرف.'
            : 'Please enter a valid name, email address, and a message of at least 10 characters.';
        return;
      }

      formStatus.style.color = 'var(--color-secondary)';
      formStatus.textContent =
        lang === 'ar'
          ? 'تم استلام رسالتك بنجاح! (وضع المعاينة التجريبي)'
          : 'Your message has been received! (Demo Preview Mode)';
      contactForm.reset();
    });
    // Interactive 3-Step Onboarding Ritual Logic
  const onboardModal = document.getElementById('onboarding-modal');
  const stepIndicators = document.querySelectorAll('.onboard__step');
  const pane1a = document.getElementById('onboard-step-1a');
  const pane1b = document.getElementById('onboard-step-1b');
  const pane2 = document.getElementById('onboard-step-2');
  const pane3 = document.getElementById('onboard-step-3');

  const yesBtn = document.getElementById('onboard-yes-btn');
  const gamePromptEl = document.getElementById('game-prompt');
  const gameSeqEl = document.getElementById('game-sequence');
  const gameTiles = document.querySelectorAll('.onboard__tile');
  const gameWinBox = document.getElementById('game-win-box');
  const toStep2Btn = document.getElementById('to-step-2-btn');

  const colorBtns = document.querySelectorAll('.onboard__color-btn');
  const colorResultBox = document.getElementById('color-result-box');
  const colorTipText = document.getElementById('color-tip-text');
  const toStep3Btn = document.getElementById('to-step-3-btn');

  const step3Greeting = document.getElementById('step-3-greeting');
  const successInput = document.getElementById('success-definition-input');
  const finishOnboardBtn = document.getElementById('finish-onboard-btn');

  let selectedTitle = '';
  let selectedAccent = '#e33e14';

  const t = (key, fallback = '') => (window.currentTranslations && window.currentTranslations[key]) || fallback;

  const setActiveStep = (stepNum) => {
    stepIndicators.forEach((ind) => {
      const s = Number(ind.getAttribute('data-step-indicator'));
      ind.classList.toggle('active', s === stepNum);
      ind.classList.toggle('completed', s < stepNum);
    });
  };

  const launchConfetti = (count = 35) => {
    const colors = [selectedAccent, '#facc15', '#22c55e', '#3b82f6', '#ec4899'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.setProperty('--fall-duration', `${1.4 + Math.random() * 1.4}s`);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2900);
    }
  };

// Open Onboarding Modal when clicking "Ready to start the journey?"
  const readyGateBtn = document.getElementById('gate-start-btn');
  const heroGateEl = document.getElementById('hero');
  if (readyGateBtn) {
    readyGateBtn.addEventListener('click', () => {
      enterIntroFullscreen();
      if (onboardModal) {
        onboardModal.hidden = false;
        setActiveStep(1);
      }
    });
  }
  // Step 1A -> Step 1B (Brain Warmup Sequence Game)
  let targetSequence = [];
  let userSequence = [];
  let isGameLocked = true;

  const startBrainGame = () => {
    const symbols = ['💡', '⚙️', '🛡️', '🚀'];
    targetSequence = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    userSequence = [];
    isGameLocked = true;

    gameTiles.forEach((tile) => {
      tile.disabled = true;
      tile.classList.remove('is-correct', 'is-wrong');
    });

    if (gamePromptEl) gamePromptEl.textContent = t('onboard.game.watch', 'ركّز واحفظ الترتيب...');
    if (gameSeqEl) gameSeqEl.textContent = targetSequence.join('  ');

    setTimeout(() => {
      if (gameSeqEl) gameSeqEl.textContent = '❓  ❓  ❓';
      if (gamePromptEl) gamePromptEl.textContent = t('onboard.game.go', 'دورك الحين! اضغطها بالترتيب:');
      isGameLocked = false;
      gameTiles.forEach((tile) => {
        tile.disabled = false;
      });
    }, 2000);
  };

  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      if (pane1a) pane1a.hidden = true;
      if (pane1b) pane1b.hidden = false;
      startBrainGame();
    });
  }

  gameTiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      if (isGameLocked) return;
      const picked = tile.getAttribute('data-symbol');
      const expected = targetSequence[userSequence.length];

      if (picked === expected) {
        userSequence.push(picked);
        tile.classList.add('is-correct');
        setTimeout(() => tile.classList.remove('is-correct'), 250);
        if (gameSeqEl) {
          const revealed = targetSequence.map((sym, idx) => (idx < userSequence.length ? sym : '❓'));
          gameSeqEl.textContent = revealed.join('  ');
        }

        if (userSequence.length === targetSequence.length) {
          isGameLocked = true;
          gameTiles.forEach((b) => (b.disabled = true));
          launchConfetti(30);
          if (gameWinBox) gameWinBox.hidden = false;
        }
      } else {
        isGameLocked = true;
        tile.classList.add('is-wrong');
        if (gamePromptEl) gamePromptEl.textContent = t('onboard.game.retry', 'قربت! ركّز بالترتيب وجرب مرة ثانية:');
        setTimeout(startBrainGame, 900);
      }
    });
  });

  // Step 1B -> Step 2 (Color Psychology & Nickname)
  if (toStep2Btn) {
    toStep2Btn.addEventListener('click', () => {
      if (pane1b) pane1b.hidden = true;
      if (pane2) pane2.hidden = false;
      setActiveStep(2);
    });
  }

  // Step 2: Color Selection -> Reveal Frequency Profile -> Step 3
  const pane2b = document.getElementById('onboard-step-2b');
  const colorActionBox = document.getElementById('color-action-box');
  const revealFrequencyBtn = document.getElementById('reveal-frequency-btn');
  const freqBadge = document.getElementById('freq-badge');
  const freqTitle = document.getElementById('freq-title');
  const freqBio = document.getElementById('freq-bio');
  const freqAdvice = document.getElementById('freq-advice');

  let selectedColorKey = 'orange';

  colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const hex = btn.getAttribute('data-color');
      const key = btn.getAttribute('data-key');

      colorBtns.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');

      selectedColorKey = key;
      selectedAccent = hex;
      selectedTitle = t(`onboard.color.${key}.title`, 'صانع الأثر');

      if (onboardModal) {
        onboardModal.style.setProperty('--onboard-accent', hex);
      }
      if (colorActionBox) {
        colorActionBox.hidden = false;
      }
    });
  });

  if (revealFrequencyBtn) {
    revealFrequencyBtn.addEventListener('click', () => {
      if (pane2) pane2.hidden = true;
      if (pane2b) pane2b.hidden = false;

      if (freqBadge) {
        freqBadge.textContent = t(`onboard.color.${selectedColorKey}.name`, '');
      }
      if (freqTitle) {
        freqTitle.textContent = selectedTitle;
      }
      if (freqBio) {
        freqBio.textContent = t(`onboard.color.${selectedColorKey}.bio`, '');
      }
      if (freqAdvice) {
        freqAdvice.textContent = t(`onboard.color.${selectedColorKey}.advice`, '');
      }
    });
  }

  // Step 2B -> Step 3 (Success Definition)
  if (toStep3Btn) {
    toStep3Btn.addEventListener('click', () => {
      if (pane2b) pane2b.hidden = true;
      if (pane3) pane3.hidden = false;
      setActiveStep(3);

      const greetingTpl = t('onboard.third.greeting', 'بصمتك الخاصة يا {title}');
      if (step3Greeting) {
        step3Greeting.textContent = greetingTpl.replace('{title}', selectedTitle);
      }
    });
  }

  if (successInput && finishOnboardBtn) {
    successInput.addEventListener('input', () => {
      finishOnboardBtn.disabled = successInput.value.trim().length < 2;
    });

    finishOnboardBtn.addEventListener('click', () => {
      const answer = successInput.value.trim();
      sessionStorage.setItem('visitorTitle', selectedTitle);
      sessionStorage.setItem('visitorSuccessDef', answer);
      sessionStorage.setItem('visitorAccent', selectedAccent);

      const finaleTpl = t('onboard.third.finale', 'إجابة تُكتب بماء الذهب يا {title}! تشرفني معرفتك، يلا نبدأ!');
      if (step3Greeting) {
        step3Greeting.textContent = finaleTpl.replace('{title}', selectedTitle);
      }
      finishOnboardBtn.disabled = true;

      // Grand Celebration & Transition into Main Portfolio
      launchConfetti(85);
     setTimeout(() => {
        exitIntroFullscreen();
        if (onboardModal) onboardModal.hidden = true;
        if (heroGateEl) heroGateEl.classList.add('journey-completed');
        document.body.classList.add('journey-started');
       window.scrollTo({ top: 0, behavior: 'instant' });
      }, 1600);
    });
  }

  // =========================================================
  // Scroll-Reveal System (IntersectionObserver)
  // =========================================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
  });

  // =========================================================
  // Interactive Sequential Philosophy Section + WhatsApp Link
  // =========================================================
  const philSlides = document.querySelectorAll('[data-phil-slide]');
  const philStepDots = document.querySelectorAll('[data-phil-step]');
  const philPrevBtn = document.getElementById('phil-prev-btn');
  const philNextBtn = document.getElementById('phil-next-btn');
  const philCounter = document.getElementById('phil-counter');
  const philWhatsappBtn = document.getElementById('philosophy-whatsapp-btn');

  let currentPhilIndex = 0;

  const updatePhilosophyWhatsAppLink = () => {
    if (!philWhatsappBtn) return;
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const rawTitle = sessionStorage.getItem('visitorTitle');
    const title = rawTitle && rawTitle.trim()
      ? rawTitle.trim()
      : (lang === 'en' ? 'a curious mind' : 'زائر شغوف');

    const message = lang === 'en'
      ? `Peace be upon you Abdulrahman, this is "${title}"! Your life philosophies genuinely sparked my curiosity, and I would love to arrange a short meeting with you to discuss one of your ideas. When works best for you?`
      : `السلام عليكم عبدالرحمن، معك (${title})! استوقفتني فلسفتك في الحياة وأثارت فضولي، وأودّ أن نعقد اجتماعاً قصيراً نتناقش فيه حول إحدى أفكارك. متى يناسبك الوقت؟`;

    philWhatsappBtn.href = `https://wa.me/966547189427?text=${encodeURIComponent(message)}`;
  };

  const showPhilSlide = (index) => {
    if (!philSlides.length) return;
    const total = philSlides.length;
    currentPhilIndex = Math.max(0, Math.min(index, total - 1));

    philSlides.forEach((slide, idx) => {
      const isActive = idx === currentPhilIndex;
      slide.hidden = !isActive;
      slide.classList.toggle('active', isActive);
    });

    philStepDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentPhilIndex);
      dot.classList.toggle('done', idx < currentPhilIndex);
      dot.setAttribute('aria-selected', idx === currentPhilIndex ? 'true' : 'false');
    });

    if (philCounter) {
      philCounter.textContent = `0${currentPhilIndex + 1} / 0${total}`;
    }
    if (philPrevBtn) {
      philPrevBtn.disabled = currentPhilIndex === 0;
    }
    if (philNextBtn) {
      philNextBtn.disabled = currentPhilIndex === total - 1;
      philNextBtn.hidden = currentPhilIndex === total - 1;
    }
  };

  if (philSlides.length) {
    showPhilSlide(0);
    updatePhilosophyWhatsAppLink();

    if (philPrevBtn) {
      philPrevBtn.addEventListener('click', () => showPhilSlide(currentPhilIndex - 1));
    }
    if (philNextBtn) {
      philNextBtn.addEventListener('click', () => showPhilSlide(currentPhilIndex + 1));
    }
    philStepDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIndex = Number(dot.getAttribute('data-phil-step'));
        showPhilSlide(targetIndex);
      });
    });

    if (philWhatsappBtn) {
      philWhatsappBtn.addEventListener('click', updatePhilosophyWhatsAppLink);
    }

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', () => {
        setTimeout(updatePhilosophyWhatsAppLink, 0);
      });
    }
  }

};
