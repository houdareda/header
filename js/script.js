// Share functionality - Class-based approach
window.toggleShare = function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.target.closest('.btn_share');
    const dropdown = btn.nextElementSibling; // Get the dropdown next to the button
    const allDropdowns = document.querySelectorAll('.share-dropdown');
    
    // Close all other dropdowns
    allDropdowns.forEach(function(d) {
        if (d !== dropdown) {
            d.classList.remove('active');
            const shareBtn = d.previousElementSibling;
            if (shareBtn) {
                shareBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('active');
    btn.setAttribute('aria-expanded', dropdown.classList.contains('active'));
};

// Copy link functionality - Class-based approach
window.copyLink = function(e, url) {
    e.preventDefault();
    e.stopPropagation();
    
    const copyBtn = e.target.closest('.share-option');
    const dropdown = copyBtn.closest('.share-dropdown');
    const originalText = copyBtn.querySelector('span').textContent;
    
    navigator.clipboard.writeText(url).then(function() {
        copyBtn.querySelector('span').textContent = 'Copied!';
        copyBtn.style.background = '#10b981';
        copyBtn.style.color = 'white';
        
        setTimeout(function() {
            copyBtn.querySelector('span').textContent = originalText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
        }, 2000);
    }).catch(function() {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyBtn.querySelector('span').textContent = 'Copied!';
        copyBtn.style.background = '#10b981';
        copyBtn.style.color = 'white';
        
        setTimeout(function() {
            copyBtn.querySelector('span').textContent = originalText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
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

    const categoriesSwiper = new Swiper('.categories-swiper', {
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 200000,
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
                slidesPerView: 2,
                spaceBetween: 10,
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