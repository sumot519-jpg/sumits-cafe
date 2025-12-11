// Liquid Canvas Effect for Hero Section
class LiquidEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.ripples = [];

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    init() {
        this.blobs = [];
        const blobCount = 8;

        for (let i = 0; i < blobCount; i++) {
            this.blobs.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 80 + Math.random() * 120,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: this.getRandomColor(),
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(56, 42, 35, 0.4)',
            'rgba(44, 24, 16, 0.5)',
            'rgba(184, 134, 11, 0.3)',
            'rgba(139, 105, 20, 0.4)',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouseX = e.clientX - rect.left;
        this.targetMouseY = e.clientY - rect.top;

        // Create ripple on mouse move
        if (Math.random() > 0.9) {
            this.ripples.push({
                x: this.targetMouseX,
                y: this.targetMouseY,
                radius: 0,
                maxRadius: 150,
                alpha: 0.5,
            });
        }
    }

    animate() {
        // Smooth mouse following
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update and draw blobs
        this.blobs.forEach((blob, index) => {
            // Move blobs
            blob.x += blob.vx;
            blob.y += blob.vy;

            // Mouse interaction
            const dx = this.mouseX - blob.x;
            const dy = this.mouseY - blob.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200) {
                const force = (200 - dist) / 200;
                blob.x -= dx * force * 0.02;
                blob.y -= dy * force * 0.02;
            }

            // Bounce off edges
            if (blob.x < 0 || blob.x > this.width) blob.vx *= -1;
            if (blob.y < 0 || blob.y > this.height) blob.vy *= -1;

            // Keep blobs in bounds
            blob.x = Math.max(0, Math.min(this.width, blob.x));
            blob.y = Math.max(0, Math.min(this.height, blob.y));

            // Draw blob with gradient
            const gradient = this.ctx.createRadialGradient(
                blob.x, blob.y, 0,
                blob.x, blob.y, blob.radius
            );
            gradient.addColorStop(0, blob.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Update and draw ripples
        this.ripples = this.ripples.filter(ripple => {
            ripple.radius += 2;
            ripple.alpha -= 0.01;

            if (ripple.alpha > 0) {
                this.ctx.strokeStyle = `rgba(184, 134, 11, ${ripple.alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                return true;
            }
            return false;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Page Transition Effect
class PageTransition {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9998;
      pointer-events: none;
    `;
        this.ctx = this.canvas.getContext('2d');
        this.isTransitioning = false;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    transition(callback) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        document.body.appendChild(this.canvas);
        this.resize();

        let progress = 0;
        const animate = () => {
            progress += 0.02;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Liquid dissolve effect
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const radius = maxRadius * progress;
                const x = centerX + Math.cos(angle) * radius * (1 + Math.sin(progress * 10) * 0.1);
                const y = centerY + Math.sin(angle) * radius * (1 + Math.cos(progress * 10) * 0.1);

                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 150);
                gradient.addColorStop(0, 'rgba(56, 42, 35, 0.8)');
                gradient.addColorStop(1, 'rgba(56, 42, 35, 0)');

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 150, 0, Math.PI * 2);
                this.ctx.fill();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (callback) callback();
                setTimeout(() => {
                    this.fadeOut();
                }, 300);
            }
        };

        animate();
    }

    fadeOut() {
        let alpha = 1;
        const fade = () => {
            alpha -= 0.05;
            this.ctx.globalAlpha = alpha;

            if (alpha > 0) {
                requestAnimationFrame(fade);
            } else {
                document.body.removeChild(this.canvas);
                this.isTransitioning = false;
            }
        };
        fade();
    }
}

// Menu Card Liquid Hover Effect
function initMenuCardEffects() {
    const menuCards = document.querySelectorAll('.menu-card');

    menuCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// Smooth Scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Navigation Scroll Effect
function initNavScroll() {
    const nav = document.querySelector('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Custom Cursor
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('cursor-glow');
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Expand cursor on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .menu-card, .product-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
}

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');

    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 2000);
    });
}

// CTA Button Ripple Effect
function initCTAEffects() {
    const ctaButtons = document.querySelectorAll('.cta-button');

    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function (e) {
            const liquidCanvas = document.querySelector('.liquid-canvas');
            if (liquidCanvas && liquidCanvas.liquidEffect) {
                // Trigger extra ripples on CTA hover
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const rect = liquidCanvas.getBoundingClientRect();
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        liquidCanvas.liquidEffect.ripples.push({
                            x: centerX + (Math.random() - 0.5) * 200,
                            y: centerY + (Math.random() - 0.5) * 200,
                            radius: 0,
                            maxRadius: 200,
                            alpha: 0.6,
                        });
                    }, i * 100);
                }
            }
        });
    });
}

// Product Animation on Scroll
function initProductAnimations() {
    const products = document.querySelectorAll('.product-card');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    products.forEach(product => {
        product.style.opacity = '0';
        product.style.transform = 'translateY(50px)';
        product.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(product);
    });
}

// Menu Card Animations
function initMenuAnimations() {
    const menuCards = document.querySelectorAll('.menu-card');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 150);
            }
        });
    }, observerOptions);

    menuCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(card);
    });
}

// Add to Cart Animation
function initAddToCart() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const originalText = this.textContent;
            this.textContent = 'Added! ✓';
            this.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 2000);
        });
    });
}

// Form Handling
function initFormHandling() {
    // Reservation Form
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const button = this.querySelector('.form-submit');
            const originalHTML = button.innerHTML;

            // Show loading state
            button.innerHTML = '<span>Processing...</span>';
            button.disabled = true;

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Show success message
                button.innerHTML = '<span>✓ Reservation Confirmed!</span>';
                button.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

                // Reset form
                setTimeout(() => {
                    this.reset();
                    button.innerHTML = originalHTML;
                    button.style.background = '';
                    button.disabled = false;

                    // Show notification
                    showNotification('Your reservation has been confirmed! We\'ll send you a confirmation email shortly.');
                }, 2000);
            }, 1500);
        });
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const button = this.querySelector('.form-submit');
            const originalHTML = button.innerHTML;

            // Show loading state
            button.innerHTML = '<span>Sending...</span>';
            button.disabled = true;

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Show success message
                button.innerHTML = '<span>✓ Message Sent!</span>';
                button.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

                // Reset form
                setTimeout(() => {
                    this.reset();
                    button.innerHTML = originalHTML;
                    button.style.background = '';
                    button.disabled = false;

                    // Show notification
                    showNotification('Thank you for your message! We\'ll get back to you within 24 hours.');
                }, 2000);
            }, 1500);
        });
    }
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, var(--gold), var(--dark-gold));
    color: var(--matte-black);
    padding: 1.5rem 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(184, 134, 11, 0.4);
    z-index: 10000;
    font-family: var(--font-body);
    font-weight: 600;
    max-width: 400px;
    animation: slideIn 0.4s ease-out;
  `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease-out';
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize liquid effect on hero canvas
    const liquidCanvas = document.querySelector('.liquid-canvas');
    if (liquidCanvas) {
        liquidCanvas.liquidEffect = new LiquidEffect(liquidCanvas);
    }

    // Initialize all features
    initLoadingScreen();
    initSmoothScroll();
    initNavScroll();
    initScrollAnimations();
    initMenuCardEffects();
    initCustomCursor();
    initCTAEffects();
    initProductAnimations();
    initMenuAnimations();
    initAddToCart();
    initFormHandling();

    // Add fade-in class to animated elements
    const animatedElements = document.querySelectorAll('.section-header, .story-content, .experience-content');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        // Make story and experience sections immediately visible without scroll
        if (el.classList.contains('story-content') || el.classList.contains('experience-content')) {
            setTimeout(() => el.classList.add('visible'), 100);
        }
    });
});

// Page Transition for Navigation
const pageTransition = new PageTransition();

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        if (this.classList.contains('cta-button')) {
            e.preventDefault();
            pageTransition.transition(() => {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });
});
