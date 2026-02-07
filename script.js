// ========================================
// STICKY HEADER ON SCROLL
// ========================================
const header = document.getElementById('header');

if (header) {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// SERVICE AREA CHECKER (ZIP CODE VALIDATION)
// ========================================
if (document.getElementById('zipInput')) {
    const zipInput = document.getElementById('zipInput');
    const checkBtn = document.getElementById('checkBtn');
    const checkerResult = document.getElementById('checkerResult');

    // Valid Berlin zip codes (mock data)
    const validZipCodes = [
        '10115', '10117', '10119', '10178', '10179',
        '10243', '10245', '10247', '10249',
        '10435', '10437', '10439',
        '10551', '10553', '10555', '10557', '10559',
        '10623', '10625', '10627', '10629',
        '10707', '10709', '10711', '10713', '10715', '10717', '10719',
        '10825', '10827', '10829',
        '12043', '12045', '12047', '12049',
        '12051', '12053', '12055', '12057', '12059',
        '12099', '12101', '12103', '12105', '12107', '12109',
        '12157', '12159', '12161', '12163', '12165', '12167', '12169',
        '13347', '13349', '13351', '13353', '13355', '13357', '13359'
    ];

    checkBtn.addEventListener('click', checkServiceArea);
    zipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkServiceArea();
        }
    });

    function checkServiceArea() {
        const zip = zipInput.value.trim();

        // Validation
        if (zip === '') {
            showResult('Bitte geben Sie eine PLZ ein.', false);
            return;
        }

        if (zip.length !== 5 || isNaN(zip)) {
            showResult('Bitte geben Sie eine gültige 5-stellige PLZ ein.', false);
            return;
        }

        // Check if zip code is valid
        if (validZipCodes.includes(zip)) {
            showResult('<i class="fas fa-check-circle"></i> Wir kommen zu Ihnen! Wir sind in Ihrer Nähe tätig.', true);
        } else {
            showResult('<i class="fas fa-times-circle"></i> Leider außerhalb unseres Servicegebiets. Rufen Sie uns dennoch an!', false);
        }
    }

    function showResult(message, isSuccess) {
        checkerResult.innerHTML = message;
        checkerResult.classList.remove('success', 'error');
        checkerResult.classList.add(isSuccess ? 'success' : 'error');
    }
}

// ========================================
// PROJECT PLANNER WIZARD
// ========================================
// Only run wizard logic if wizard elements exist on the page
if (document.getElementById('wizardForm')) {
    let currentStep = 1;
    let wizardData = {
        serviceType: null,
        urgency: null
    };

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const wizardForm = document.getElementById('wizardForm');

    // Card selection logic
    document.querySelectorAll('.wizard-card').forEach(card => {
        card.addEventListener('click', function () {
            const step = this.closest('.wizard-step').dataset.step;

            // Remove selected class from siblings
            this.parentElement.querySelectorAll('.wizard-card').forEach(c => {
                c.classList.remove('selected');
            });

            // Add selected class to clicked card
            this.classList.add('selected');

            // Store selection
            const value = this.dataset.value;
            if (step === '1') {
                wizardData.serviceType = value;

                // Auto-advance on Step 1 after short delay
                setTimeout(() => {
                    if (currentStep === 1) {
                        currentStep++;
                        updateWizard();
                    }
                }, 400);
            } else if (step === '2') {
                wizardData.urgency = value;
            }

            // Enable next button
            nextBtn.disabled = false;
        });
    });

    // Next button
    nextBtn.addEventListener('click', () => {
        if (currentStep === 3) {
            // Final step - submit form
            submitWizard();
        } else {
            // Go to next step
            currentStep++;
            updateWizard();
        }
    });

    // Previous button
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizard();
        }
    });

    function updateWizard() {
        // Update step visibility
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        // Update progress bar
        document.querySelectorAll('.progress-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');

            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });

        // Update navigation buttons
        if (currentStep === 1) {
            prevBtn.style.display = 'none';
            // Hide next button on Step 1 since auto-advance is enabled
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }

        if (currentStep === 3) {
            nextBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Absenden';
            nextBtn.disabled = false; // Enable submit button
        } else {
            nextBtn.innerHTML = 'Weiter <i class="fas fa-arrow-right"></i>';

            // Check if selection made for current step
            const hasSelection = document.querySelector(`.wizard-step[data-step="${currentStep}"] .wizard-card.selected`);
            nextBtn.disabled = !hasSelection;
        }
    }

    function submitWizard() {
        // Validate form
        if (!wizardForm.checkValidity()) {
            wizardForm.reportValidity();
            return;
        }

        // Collect form data
        const formData = new FormData(wizardForm);
        const data = {
            serviceType: wizardData.serviceType,
            urgency: wizardData.urgency,
            name: formData.get('name'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            zip: formData.get('zip'),
            date: formData.get('date'),
            time: formData.get('time'),
            message: formData.get('message')
        };

        // Log data (in production, send to backend)
        console.log('Wizard Data:', data);

        // Build success message with optional date/time
        let successMsg = `Vielen Dank, ${data.name}!\n\nWir haben Ihre Anfrage erhalten und melden uns in Kürze.\n\nService: ${data.serviceType}\nDringlichkeit: ${data.urgency}`;
        if (data.date) {
            successMsg += `\nWunschtermin: ${data.date}`;
        }
        if (data.time) {
            successMsg += `\nUhrzeit: ${data.time}`;
        }

        // Show success message
        alert(successMsg);

        // Reset wizard
        resetWizard();
    }

    function resetWizard() {
        currentStep = 1;
        wizardData = {
            serviceType: null,
            urgency: null
        };

        // Clear selections
        document.querySelectorAll('.wizard-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Clear form
        wizardForm.reset();

        // Update display
        updateWizard();
    }

    // Initialize wizard on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        updateWizard();
    });
}


// ========================================
// FLOATING BUTTONS FOOTER COLLISION DETECTION
// ========================================
const emergencyBtn = document.querySelector('.emergency-btn');
const whatsappBtn = document.querySelector('.whatsapp-btn');
const footerBottom = document.querySelector('.footer-bottom');

if (footerBottom) {
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Footer is visible, dock the buttons
                if (emergencyBtn) emergencyBtn.classList.add('docked');
                if (whatsappBtn) whatsappBtn.classList.add('docked');
            } else {
                // Footer not visible, keep buttons fixed
                if (emergencyBtn) emergencyBtn.classList.remove('docked');
                if (whatsappBtn) whatsappBtn.classList.remove('docked');
            }
        });
    }, {
        threshold: 0,
        rootMargin: '0px 0px -80px 0px' // Trigger slightly before footer appears
    });

    footerObserver.observe(footerBottom);
}

// ========================================
// FAQ ACCORDION TOGGLE
// ========================================
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const isActive = item.classList.contains('active');

        // Close all accordion items
        document.querySelectorAll('.accordion-item').forEach(accordionItem => {
            accordionItem.classList.remove('active');
        });

        // Toggle current item (if it wasn't already active)
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ========================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip if href is just "#" or legal links
        if (href === '#' || href.startsWith('#impressum') || href.startsWith('#datenschutz') || href.startsWith('#agb')) {
            return;
        }

        e.preventDefault();

        const target = document.querySelector(href);
        const header = document.getElementById('header');

        if (target && header) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// GALLERY FILTER FUNCTIONALITY
// ========================================
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filterValue = this.dataset.filter;

            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter gallery items
            galleryItems.forEach(item => {
                const itemCategory = item.dataset.category;

                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'block';
                    // Add fade-in animation
                    item.style.animation = 'fadeIn 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// ========================================
// LIGHTBOX MODAL FUNCTIONALITY
// ========================================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Lightbox state
let currentLightboxData = {
    beforeSrc: '',
    afterSrc: '',
    caption: '',
    showingBefore: true
};

if (lightbox && galleryItems.length > 0) {
    // Add click listeners to all gallery items
    galleryItems.forEach(item => {
        item.style.cursor = 'pointer';

        item.addEventListener('click', function () {
            // Extract image sources and caption
            const beforeImg = this.querySelector('.before img');
            const afterImg = this.querySelector('.after img');
            const captionEl = this.querySelector('.gallery-caption');

            if (beforeImg && afterImg && captionEl) {
                currentLightboxData = {
                    beforeSrc: beforeImg.src,
                    afterSrc: afterImg.src,
                    caption: captionEl.textContent,
                    showingBefore: true
                };

                openLightbox();
            }
        });
    });

    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Navigation buttons
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showBeforeImage);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showAfterImage);
    }

    // Close lightbox on overlay click
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showBeforeImage();
        } else if (e.key === 'ArrowRight') {
            showAfterImage();
        }
    });

    // Touch swipe detection for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe

        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped left - show after image
            showAfterImage();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped right - show before image
            showBeforeImage();
        }
    }

    function openLightbox() {
        // Show before image first
        lightboxImage.src = currentLightboxData.beforeSrc;
        lightboxImage.alt = 'Projekt Vorher';
        lightboxCaption.textContent = currentLightboxData.caption + ' - Vorher';

        // Update button states
        updateNavigationButtons();

        // Show lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    function showBeforeImage() {
        if (!currentLightboxData.showingBefore) {
            currentLightboxData.showingBefore = true;
            lightboxImage.src = currentLightboxData.beforeSrc;
            lightboxImage.alt = 'Projekt Vorher';
            lightboxCaption.textContent = currentLightboxData.caption + ' - Vorher';
            updateNavigationButtons();
        }
    }

    function showAfterImage() {
        if (currentLightboxData.showingBefore) {
            currentLightboxData.showingBefore = false;
            lightboxImage.src = currentLightboxData.afterSrc;
            lightboxImage.alt = 'Projekt Nachher';
            lightboxCaption.textContent = currentLightboxData.caption + ' - Nachher';
            updateNavigationButtons();
        }
    }

    function updateNavigationButtons() {
        if (currentLightboxData.showingBefore) {
            // On before image - disable prev, enable next
            if (lightboxPrev) {
                lightboxPrev.style.opacity = '0.5';
                lightboxPrev.style.cursor = 'not-allowed';
            }
            if (lightboxNext) {
                lightboxNext.style.opacity = '1';
                lightboxNext.style.cursor = 'pointer';
            }
        } else {
            // On after image - enable prev, disable next
            if (lightboxPrev) {
                lightboxPrev.style.opacity = '1';
                lightboxPrev.style.cursor = 'pointer';
            }
            if (lightboxNext) {
                lightboxNext.style.opacity = '0.5';
                lightboxNext.style.cursor = 'not-allowed';
            }
        }
    }
}


// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to sections on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});
