// Share functionality
window.toggleShare = function(e, p) {
    e.preventDefault();
    e.stopPropagation();
    const d = document.getElementById('share-' + p);
    const btn = e.target.closest('.btn_share');
    const a = document.querySelectorAll('.share-dropdown');
    
    // Close all other dropdowns
    a.forEach(function(s) {
        if (s !== d) {
            s.classList.remove('active');
            const shareBtn = s.previousElementSibling;
            if (shareBtn) {
                shareBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });
    
    // Toggle current dropdown
    d.classList.toggle('active');
    btn.setAttribute('aria-expanded', d.classList.contains('active'));
};

// Copy link functionality
window.copyLink = function(url, p) {
    const d = document.getElementById('share-' + p);
    const c = d.querySelector('.share-option:last-child');
    const originalText = c.querySelector('span').textContent;
    
    navigator.clipboard.writeText(url).then(function() {
        c.querySelector('span').textContent = 'Copied!';
        c.style.background = '#10b981';
        c.style.color = 'white';
        
        setTimeout(function() {
            c.querySelector('span').textContent = originalText;
            c.style.background = '';
            c.style.color = '';
        }, 2000);
    }).catch(function() {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        c.querySelector('span').textContent = 'Copied!';
        c.style.background = '#10b981';
        c.style.color = 'white';
        
        setTimeout(function() {
            c.querySelector('span').textContent = originalText;
            c.style.background = '';
            c.style.color = '';
        }, 2000);
    });
};

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.btn_share') && !e.target.closest('.share-dropdown')) {
        document.querySelectorAll('.share-dropdown').forEach(function(d) {
            d.classList.remove('active');
            const shareBtn = d.previousElementSibling;
            if (shareBtn) {
                shareBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
});

// Close dropdowns on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.share-dropdown').forEach(function(d) {
            d.classList.remove('active');
            const shareBtn = d.previousElementSibling;
            if (shareBtn) {
                shareBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
});

// Tours Swiper Configuration
document.addEventListener('DOMContentLoaded', function() {
    const toursSwiper = new Swiper('.tours-swiper', {
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        speed: 800,
 
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
 
        breakpoints: {
            // Mobile (up to 767px): 1 slide
            320: {
                slidesPerView: 1,
                spaceBetween: 15,
            },
            // Tablet (768px and up): 2 slides
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            // Desktop (1024px and up): 3 slides
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            // Large screens (1200px and up): 3 slides with more space
            1200: {
                slidesPerView: 3,
                spaceBetween: 30,
            }
        },

    });
});