document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const heroImage = document.querySelector('.hero-image');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Parallax effect for hero image
    window.addEventListener('mousemove', (e) => {
        if (!heroImage) return;
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        heroImage.style.transform = `scale(1.1) rotate(-10deg) translate(${moveX}px, ${moveY}px)`;
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply reveal animation to sections
    document.querySelectorAll('.collection-card, .featured-info, .featured-visual').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        observer.observe(el);
    });

    // Cart and Search Button Mock interactions
    const cartBtn = document.querySelector('.cart-btn');
    const searchBtn = document.querySelector('.search-btn');

    cartBtn.addEventListener('click', () => {
        alert('Cart functionality coming soon!');
    });

    searchBtn.addEventListener('click', () => {
        const query = prompt('Search Casio collections:');
        if (query) {
            alert(`Searching for: ${query}`);
        }
    });
});
