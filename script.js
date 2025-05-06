document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Switcher ---
    const themeCheckbox = document.getElementById('theme-checkbox');
    const htmlElement = document.documentElement;
    const lightLogo = document.querySelector('.top-nav-logo');
    const darkLogo = document.querySelector('.top-nav-logo-dark');

    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            htmlElement.classList.add('dark-mode');
            htmlElement.classList.remove('light-mode');
            if(lightLogo) lightLogo.style.display = 'none';
            if(darkLogo) darkLogo.style.display = 'block';
        } else {
            htmlElement.classList.add('light-mode');
            htmlElement.classList.remove('dark-mode');
            if(lightLogo) lightLogo.style.display = 'block';
            if(darkLogo) darkLogo.style.display = 'none';
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme === 'dark');
        if (themeCheckbox) themeCheckbox.checked = (savedTheme === 'dark');
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
        if (themeCheckbox) themeCheckbox.checked = prefersDark;
    }

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            if (this.checked) {
                applyTheme(true);
                localStorage.setItem('theme', 'dark');
            } else {
                applyTheme(false);
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- Smooth Scroll for Nav Links ---
    const scrollLinks = document.querySelectorAll('#top-nav a[href^="#"], a.cta-button[href^="#"], #floating-roller-nav a[href^="#"]');
    let topNavHeight = 70;
    const topNavElement = document.getElementById('top-nav');
    if (topNavElement) topNavHeight = topNavElement.offsetHeight;


    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (topNavElement) topNavHeight = topNavElement.offsetHeight;

            if (this.getAttribute('href') !== '#' && !this.classList.contains('disabled-link')) {
                e.preventDefault();
                let targetId = this.getAttribute('href');
                let targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - topNavHeight;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            } else if (this.classList.contains('disabled-link')) {
                e.preventDefault();
            }
        });
    });

    // --- Intersection Observer for Scroll Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = {
        root: null,
        rootMargin: `-${topNavHeight || 70}px 0px -50px 0px`,
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    animatedElements.forEach(el => observer.observe(el));


    // --- Active State for Top Nav & Floating Roller Nav ---
    const sections = document.querySelectorAll('main section[id], header[id]');
    const topNavLinks = document.querySelectorAll('#top-nav ul li a');
    const rollerNavLinks = document.querySelectorAll('#floating-roller-nav ul li a');
    const rollerIndicator = document.querySelector('#floating-roller-nav .roller-indicator');
    const rollerNavList = document.querySelector('#floating-roller-nav ul');

    function updateActiveNav() {
        if (topNavElement) topNavHeight = topNavElement.offsetHeight;
        let currentSectionId = '';
        const scrollBuffer = topNavHeight + window.innerHeight * 0.3;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (pageYOffset + scrollBuffer >= sectionTop && pageYOffset < sectionTop + sectionHeight - topNavHeight) {
                 currentSectionId = section.getAttribute('id');
            }
        });

        if (window.pageYOffset < (sections[0]?.offsetTop - topNavHeight || 0)) {
             currentSectionId = sections[0]?.getAttribute('id') || '';
        } else if ((window.innerHeight + Math.ceil(window.pageYOffset)) >= document.body.offsetHeight - 2 && sections.length > 0) {
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        }


        topNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });

        let activeRollerLink = null;
        rollerNavLinks.forEach(link => {
            link.classList.remove('active-roller-item');
            if (link.dataset.section === currentSectionId) {
                link.classList.add('active-roller-item');
                activeRollerLink = link;
            }
        });

        if (activeRollerLink && rollerIndicator && rollerNavList) {
            rollerIndicator.style.left = `${activeRollerLink.offsetLeft}px`;
            rollerIndicator.style.width = `${activeRollerLink.offsetWidth}px`;
        } else if (rollerIndicator && rollerNavLinks.length > 0 && !activeRollerLink) {
             const previouslyActive = rollerNavList.querySelector('.active-roller-item');
             if(!previouslyActive && rollerNavLinks[0]) {
                rollerNavLinks[0].classList.add('active-roller-item');
                rollerIndicator.style.left = `${rollerNavLinks[0].offsetLeft}px`;
                rollerIndicator.style.width = `${rollerNavLinks[0].offsetWidth}px`;
             }
        }
    }

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('resize', updateActiveNav);
    setTimeout(updateActiveNav, 100);

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- Set RGB Vars ---
    function setRgbVar(cssVarName, fallbackRgbVarName) {
        try {
            const rootStyle = getComputedStyle(document.documentElement);
            let colorStyle = rootStyle.getPropertyValue(cssVarName)?.trim(); // Use optional chaining

             // Handle cases where the variable might point to another variable first
            if (colorStyle?.startsWith('var(')) {
                 const nestedVarName = colorStyle.match(/var\((--[^)]+)\)/)?.[1]; // Safer regex
                if(nestedVarName) {
                    colorStyle = rootStyle.getPropertyValue(nestedVarName)?.trim();
                } else {
                     colorStyle = null; // Could not resolve nested variable
                }
            }

            // Only proceed if we have a hex color and the target RGB var isn't already set
            if (colorStyle?.startsWith('#') && !rootStyle.getPropertyValue(fallbackRgbVarName)?.trim()) {
                const r = parseInt(colorStyle.slice(1, 3), 16);
                const g = parseInt(colorStyle.slice(3, 5), 16);
                const b = parseInt(colorStyle.slice(5, 7), 16);
                 if (!isNaN(r) && !isNaN(g) && !isNaN(b)) { // Check if parsing was successful
                     document.documentElement.style.setProperty(fallbackRgbVarName, `${r}, ${g}, ${b}`);
                 }
            }
        } catch (e) {
            // console.warn(`Could not parse ${cssVarName} for RGB conversion. Ensure ${fallbackRgbVarName} is set in CSS or the base color is a hex.`);
        }
    }
    setRgbVar('--primary-accent', '--primary-accent-rgb');
    setRgbVar('--border-color-strong', '--border-color-strong-rgb');
    setRgbVar('--idh-near-black', '--idh-near-black-rgb');
    setRgbVar('--idh-off-white-cool', '--idh-off-white-cool-rgb');
    setRgbVar('--idh-light-blue-grey', '--idh-light-blue-grey-rgb');

    // For dark mode
    setRgbVar('--primary-accent-dm', '--primary-accent-rgb-dm');
    setRgbVar('--border-color-strong-dm', '--border-color-strong-rgb-dm');
    setRgbVar('--idh-near-black', '--idh-near-black-rgb'); // Also needed in dark mode rgba

});