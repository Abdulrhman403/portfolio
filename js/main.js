document.addEventListener('DOMContentLoaded', () => {
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
  };