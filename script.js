// ========================================
// STICKY HEADER ON SCROLL
// ========================================
const header = document.getElementById('header');
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

// ========================================
// SERVICE AREA CHECKER (ZIP CODE VALIDATION)
// ========================================
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

// ========================================
// PROJECT PLANNER WIZARD
// ========================================
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

        // Skip if href is just "#"
        if (href === '#' || href.startsWith('#impressum') || href.startsWith('#datenschutz') || href.startsWith('#agb')) {
            return;
        }

        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
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
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wizard
    updateWizard();

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
