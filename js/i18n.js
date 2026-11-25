const translations = {
  ar: {
    'nav.logo': 'عبدالرحمن',
    'nav.about': 'نبذة عني',
    'nav.skills': 'المهارات',
    'nav.projects': 'المشاريع',
    'nav.experience': 'الخبرات',
    'nav.contact': 'تواصل معي',
    'hero.greeting': 'أهلاً بك في مساحتي الرقمية 👋',
    'hero.name': 'عبدالرحمن محمد',
    'hero.role': 'مطور نظم معلومات | تطوير الويب والأمن السيبراني',
    'hero.bio': 'أبني تطبيقات ويب متكاملة تجمع بين واجهات المستخدم السلسة، وقواعد البيانات المحكمة، ومعايير الحماية والأمان.',
    'hero.cta_projects': 'استعراض أعمالي',
    'hero.cta_contact': 'تواصل معي',
    'about.title': 'نبذة عني',
    'about.p1': 'طالب ومطور مهتم بهندسة البرمجيات وبناء الحلول التقنية العملية. أركز على فهم الأساسيات من الجذور بدءاً من تصميم واجهات الويب المتجاوبة، مروراً بهيكلة قواعد البيانات، وصولاً إلى تأمين التطبيقات ضد الثغرات.',
    'about.p2': 'أسعى دائماً لتحويل الأفكار إلى منتجات رقمية قابلة للاستخدام الفعلي وتقدم قيمة حقيقية للمستخدمين.',
    'about.download_cv': 'تحميل السيرة الذاتية (PDF)',
    'about.stat_projects': 'مشاريع تطبيقية',
    'about.stat_domains': 'مسارات تقنية',
    'about.stat_certs': 'شهادات وتدريبات',
    'skills.title': 'المهارات التقنية',
    'skills.frontend': 'تطوير الواجهات (Frontend)',
    'skills.backend': 'الخلفية وقواعد البيانات (Backend & DB)',
    'skills.security': 'الأمن السيبراني (Cybersecurity)',
    'skills.tools': 'الأدوات وبيئات العمل (Tools)',
    'projects.title': 'المشاريع والأعمال',
    'projects.filter_all': 'الكل',
    'experience.title': 'الخبرات والشهادات',
    'contact.title': 'تواصل معي',
    'contact.subtitle': 'هل لديك مشروع، فرصة تدريبية، أو استفسار تقني؟ يسعدني تواصلك.',
    'contact.label_name': 'الاسم الكامل',
    'contact.label_email': 'البريد الإلكتروني',
    'contact.label_message': 'الرسالة',
    'contact.submit': 'إرسال الرسالة',
    'footer.rights': '© 2026 عبدالرحمن. جميع الحقوق محفوظة.',
    'footer.back_to_top': 'العودة للأعلى ↑'
  },
  en: {
    'nav.logo': 'Abdulrhman',
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'hero.greeting': 'Welcome to my digital space 👋',
    'hero.name': 'Abdulrhman Mohammad',
    'hero.role': 'Information Systems Developer | Web & Cybersecurity',
    'hero.bio': 'I build full-stack web applications combining smooth user interfaces, solid databases, and security best practices.',
    'hero.cta_projects': 'View Projects',
    'hero.cta_contact': 'Contact Me',
    'about.title': 'About Me',
    'about.p1': 'A developer focused on software engineering and practical technical solutions, from responsive frontend design and database architecture to application security.',
    'about.p2': 'I always strive to turn ideas into functional digital products that deliver real value.',
    'about.download_cv': 'Download CV (PDF)',
    'about.stat_projects': 'Applied Projects',
    'about.stat_domains': 'Tech Domains',
    'about.stat_certs': 'Certifications',
    'skills.title': 'Technical Skills',
    'skills.frontend': 'Frontend Development',
    'skills.backend': 'Backend & Databases',
    'skills.security': 'Cybersecurity',
    'skills.tools': 'Tools & Environments',
    'projects.title': 'Projects & Work',
    'projects.filter_all': 'All',
    'experience.title': 'Experience & Certifications',
    'contact.title': 'Contact Me',
    'contact.subtitle': 'Have a project, internship opportunity, or technical inquiry? Feel free to reach out.',
    'contact.label_name': 'Full Name',
    'contact.label_email': 'Email Address',
    'contact.label_message': 'Message',
    'contact.submit': 'Send Message',
    'footer.rights': '© 2026 Abdulrhman. All rights reserved.',
    'footer.back_to_top': 'Back to Top ↑'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('lang-toggle');
  const htmlEl = document.documentElement;
  const STORAGE_KEY = 'portfolio-lang';

  const applyLanguage = (lang) => {
    const dict = translations[lang] || translations.ar;
    htmlEl.setAttribute('lang', lang);
    htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    if (langToggle) {
      langToggle.textContent = lang === 'ar' ? 'EN' : 'AR';
      langToggle.setAttribute(
        'aria-label',
        lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'
      );
    }
  };

  const savedLang = localStorage.getItem(STORAGE_KEY) || 'ar';
  applyLanguage(savedLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('lang');
      const nextLang = currentLang === 'ar' ? 'en' : 'ar';
      applyLanguage(nextLang);
      localStorage.setItem(STORAGE_KEY, nextLang);
    });
  }
});