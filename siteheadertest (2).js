// Egyptra Header JavaScript - Complete Version with FA icon toggle
(function () {
  'use strict';

  const EgyptraHeader = {
    elements: {},
    state: {
      isMenuOpen: false,
      isSearchOpen: false,
      isCurrencyModalOpen: false,
      lastScrollTop: 0,
      isMobile: window.innerWidth < 992,
      currentSuggestions: [],
      selectedSuggestionIndex: -1,
      hoverTimeout: null
    },

    init() {
      this.cacheElements();
      this.bindEvents();
      this.syncCartCount();
      this.handleScroll();
      this.initCurrencyModal();
      this.enhanceDesktopDropdowns();
      this.initMobileSearch();
    },

    cacheElements() {
      this.elements = {
        header: document.querySelector('.site-header'),
        mobileMenuButton: document.querySelector('.mobile-menu-button'),
        navbarCollapse: document.querySelector('.navbar-collapse'),
        dropdownToggles: document.querySelectorAll('.dropdown-toggle'),
        // desktop search
        searchTrigger: document.getElementById('searchTrigger'),
        searchDropdown: document.getElementById('searchDropdown'),
        searchInput: document.getElementById('searchInput'),
        searchForm: document.getElementById('searchForm'),
        searchClearBtn: document.getElementById('searchClearBtn'),
        suggestionsContainer: document.getElementById('searchSuggestions'),
        // cart
        mainCartCount: document.getElementById('cartCount'),
        mobileCartCount: document.getElementById('mobileCartCount'),
        // currency
        mobileCurrencyButton: document.getElementById('mobileCurrencyButton'),
        mobileCurrencyModal: document.getElementById('mobileCurrencyModal'),
        closeCurrencyModal: document.getElementById('closeCurrencyModal'),
        // mobile search
        mobileSearchButton: document.getElementById('mobileSearchButton'),
        mobileSearchModal: document.getElementById('mobileSearchModal'),
        closeSearchModal: document.getElementById('closeSearchModal'),
        mobileSearchInput: document.getElementById('mobileSearchInput'),
        mobileSearchForm: document.getElementById('mobileSearchForm')
      };
    },

    bindEvents() {
      // Mobile menu toggle
      this.elements.mobileMenuButton?.addEventListener('click', () => {
        this.toggleMenu(!this.state.isMenuOpen);
      });

      // Desktop search trigger
      this.elements.searchTrigger?.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSearch();
      });

      // Desktop search input
      this.elements.searchInput?.addEventListener('input', this.handleSearchInput.bind(this));
      this.elements.searchInput?.addEventListener('keydown', this.handleSearchKeyboard.bind(this));

      // Search clear
      this.elements.searchClearBtn?.addEventListener('click', () => {
        this.resetSearch();
        this.elements.searchInput?.focus();
      });

      // Global click handler
      document.addEventListener('click', this.handleOutsideClicks.bind(this));

      // Window events
      window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

      // Initialize dropdowns
      this.initDropdowns();
    },

    // ---------- Menu ----------
    toggleMenu(open) {
      const shouldOpen = open ?? !this.state.isMenuOpen;
      this.state.isMenuOpen = shouldOpen;

      // Collapse/expand navbar
      this.elements.navbarCollapse?.classList.toggle('show', shouldOpen);
      this.elements.mobileMenuButton?.setAttribute('aria-expanded', String(shouldOpen));

      // Body scroll lock on mobile
      if (this.state.isMobile) {
        document.body.style.overflow = shouldOpen ? 'hidden' : '';
      }

      // Backdrop & search
      if (shouldOpen) {
        this.addBackdrop('navbar-backdrop');
        this.closeSearch();
      } else {
        this.removeBackdrop('navbar-backdrop');
      }

      // ✅ Toggle Font Awesome icon (bars <-> times)
      const icon = this.elements.mobileMenuButton?.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !shouldOpen);
        icon.classList.toggle('fa-times', shouldOpen); // FA5 "X" icon
      }
      this.elements.mobileMenuButton?.setAttribute(
        'aria-label',
        shouldOpen ? 'Close navigation' : 'Open navigation'
      );
    },

    handleOutsideClicks(e) {
      // Close dropdowns
      if (!e.target.closest('.dropdown')) {
        this.closeAllDropdowns();
      }

      // Close desktop search
      if (
        this.state.isSearchOpen &&
        this.elements.searchDropdown &&
        !this.elements.searchDropdown.contains(e.target) &&
        this.elements.searchTrigger &&
        !this.elements.searchTrigger.contains(e.target)
      ) {
        this.toggleSearch(false);
      }

      // Close mobile menu
      if (
        this.state.isMobile &&
        this.state.isMenuOpen &&
        this.elements.navbarCollapse &&
        !this.elements.navbarCollapse.contains(e.target) &&
        this.elements.mobileMenuButton &&
        !this.elements.mobileMenuButton.contains(e.target)
      ) {
        this.toggleMenu(false);
      }
    },

    // ---------- Dropdowns ----------
    initDropdowns() {
      this.elements.dropdownToggles.forEach((toggle) => {
        toggle.addEventListener('click', (e) => {
          if (window.innerWidth < 992) {
            e.preventDefault();
            e.stopPropagation();

            const menu = toggle.nextElementSibling;
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';

            // Close all other dropdowns
            this.elements.dropdownToggles.forEach((t) => {
              if (t !== toggle) {
                t.setAttribute('aria-expanded', 'false');
                t.nextElementSibling?.classList.remove('show');
              }
            });

            // Toggle current dropdown
            toggle.setAttribute('aria-expanded', String(!isOpen));
            menu?.classList.toggle('show');
          }
        });
      });
    },

    closeAllDropdowns() {
      this.elements.dropdownToggles.forEach((toggle) => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.nextElementSibling?.classList.remove('show');
      });
    },

    // ---------- Desktop Search ----------
    toggleSearch(open) {
      this.state.isSearchOpen = open ?? !this.state.isSearchOpen;

      if (!this.elements.searchDropdown) return;

      if (this.state.isSearchOpen) {
        this.elements.searchDropdown.classList.add('show', 'active');
        this.elements.searchInput?.focus();
        if (this.state.isMobile) {
          document.body.style.overflow = 'hidden';
          this.addBackdrop('search-backdrop');
        }
      } else {
        this.elements.searchDropdown.classList.remove('show', 'active');
        if (this.state.isMobile) {
          document.body.style.overflow = '';
          this.removeBackdrop('search-backdrop');
        }
        this.resetSearch();
      }

      this.elements.searchTrigger?.setAttribute(
        'aria-expanded',
        String(this.state.isSearchOpen)
      );
    },

    resetSearch() {
      if (!this.elements.searchInput) return;
      this.elements.searchInput.value = '';
      if (this.elements.suggestionsContainer) this.elements.suggestionsContainer.innerHTML = '';
      if (this.elements.searchClearBtn) this.elements.searchClearBtn.style.display = 'none';
      this.state.currentSuggestions = [];
      this.state.selectedSuggestionIndex = -1;
    },

    closeSearch() {
      if (this.state.isSearchOpen) {
        this.toggleSearch(false);
      }
    },

    handleSearchInput(e) {
      const query = e.target.value;
      if (this.elements.searchClearBtn) {
        this.elements.searchClearBtn.style.display = query ? 'block' : 'none';
      }
      this.fetchSuggestions(query);
    },

    fetchSuggestions(query) {
      clearTimeout(this._fetchTimeout);

      this._fetchTimeout = setTimeout(async () => {
        if (!this.elements.suggestionsContainer) return;
        if (query.length < 2) {
          this.elements.suggestionsContainer.innerHTML = '';
          return;
        }

        try {
          const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
          const data = await response.json();

          if (data.suggestions?.length > 0) {
            this.displaySuggestions(data.suggestions);
          } else {
            this.elements.suggestionsContainer.innerHTML = '<div class="p-3">No results found</div>';
          }
        } catch (error) {
          console.error('Search error:', error);
          this.elements.suggestionsContainer.innerHTML = '<div class="p-3">Error fetching results</div>';
        }
      }, 300);
    },

    displaySuggestions(suggestions) {
      if (!this.elements.suggestionsContainer || !this.elements.searchInput) return;

      this.state.currentSuggestions = suggestions;
      this.elements.suggestionsContainer.innerHTML = suggestions
        .map(
          (suggestion, index) => `
          <div class="suggestion-item ${index === this.state.selectedSuggestionIndex ? 'selected' : ''}"
               role="option"
               aria-selected="${index === this.state.selectedSuggestionIndex}"
               data-index="${index}">
            <i class="fas fa-search" aria-hidden="true"></i>
            ${this.highlightMatch(suggestion, this.elements.searchInput.value)}
          </div>
        `
        )
        .join('');

      // Click handlers
      this.elements.suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item) => {
        item.addEventListener('click', () => {
          const index = parseInt(item.getAttribute('data-index'), 10);
          this.elements.searchInput.value = this.state.currentSuggestions[index];
          this.elements.searchForm?.submit();
        });
      });
    },

    highlightMatch(text, query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<strong>$1</strong>');
    },

    handleSearchKeyboard(e) {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          e.preventDefault();
          const direction = e.key === 'ArrowDown' ? 1 : -1;
          this.state.selectedSuggestionIndex = Math.max(
            -1,
            Math.min(
              this.state.selectedSuggestionIndex + direction,
              this.state.currentSuggestions.length - 1
            )
          );
          this.displaySuggestions(this.state.currentSuggestions);
          break;
        }
        case 'Enter':
          if (this.state.selectedSuggestionIndex >= 0) {
            e.preventDefault();
            const value = this.state.currentSuggestions[this.state.selectedSuggestionIndex];
            if (this.elements.searchInput) this.elements.searchInput.value = value;
            this.elements.searchForm?.submit();
          }
          break;
        case 'Escape':
          e.preventDefault();
          this.toggleSearch(false);
          break;
      }
    },

    // ---------- Currency Modal ----------
    initCurrencyModal() {
      // Open modal
      this.elements.mobileCurrencyButton?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleCurrencyModal(true);
      });

      // Close modal
      this.elements.closeCurrencyModal?.addEventListener('click', () => {
        this.toggleCurrencyModal(false);
      });

      // Click outside to close
      this.elements.mobileCurrencyModal?.addEventListener('click', (e) => {
        if (e.target === this.elements.mobileCurrencyModal) {
          this.toggleCurrencyModal(false);
        }
      });
    },

    toggleCurrencyModal(open) {
      if (!this.elements.mobileCurrencyModal) return;
      this.state.isCurrencyModalOpen = open ?? !this.state.isCurrencyModalOpen;
      this.elements.mobileCurrencyModal.classList.toggle('show', this.state.isCurrencyModalOpen);

      if (this.state.isCurrencyModalOpen) {
        document.body.style.overflow = 'hidden';
        this.addBackdrop('currency-backdrop');
      } else {
        document.body.style.overflow = '';
        this.removeBackdrop('currency-backdrop');
      }
    },

    // ---------- Mobile Search Modal ----------
    initMobileSearch() {
      this.elements.mobileSearchButton?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.elements.mobileSearchModal) return;
        this.elements.mobileSearchModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.addBackdrop('search-backdrop');
        this.elements.mobileSearchInput?.focus();
      });

      this.elements.closeSearchModal?.addEventListener('click', () => {
        this.closeMobileSearchModal();
      });

      // Submit
      this.elements.mobileSearchForm?.addEventListener('submit', () => {
        this.closeMobileSearchModal();
      });
    },

    closeMobileSearchModal() {
      if (!this.elements.mobileSearchModal) return;
      this.elements.mobileSearchModal.classList.remove('show');
      document.body.style.overflow = '';
      this.removeBackdrop('search-backdrop');
    },

    // ---------- Backdrop ----------
    addBackdrop(className = 'navbar-backdrop') {
      if (!document.querySelector(`.${className}`)) {
        const backdrop = document.createElement('div');
        backdrop.className = className;
        backdrop.addEventListener('click', () => {
          if (className === 'search-backdrop') {
            // close search or mobile search
            if (this.state.isSearchOpen) {
              this.closeSearch();
            } else {
              this.closeMobileSearchModal();
            }
          } else if (className === 'currency-backdrop') {
            this.toggleCurrencyModal(false);
          } else {
            this.toggleMenu(false);
          }
        });
        document.body.appendChild(backdrop);
        requestAnimationFrame(() => backdrop.classList.add('show'));
      }
    },

    removeBackdrop(className = 'navbar-backdrop') {
      const backdrop = document.querySelector(`.${className}`);
      if (backdrop) {
        backdrop.classList.remove('show');
        backdrop.addEventListener('transitionend', () => backdrop.remove(), { once: true });
        // Fallback in case no CSS transition is present
        setTimeout(() => backdrop.remove(), 300);
      }
    },

    // ---------- Scroll / Resize ----------
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 100) {
        this.elements.header?.classList.add('scrolled');
        if (scrollTop > this.state.lastScrollTop && !this.state.isMenuOpen && !this.state.isSearchOpen) {
          this.elements.header?.classList.add('header-hidden');
        } else {
          this.elements.header?.classList.remove('header-hidden');
        }
      } else {
        this.elements.header?.classList.remove('scrolled', 'header-hidden');
      }

      this.state.lastScrollTop = scrollTop;
    },

    handleResize() {
      const wasMobile = this.state.isMobile;
      this.state.isMobile = window.innerWidth < 992;

      if (wasMobile !== this.state.isMobile) {
        if (!this.state.isMobile) {
          // Leaving mobile -> reset menu and icon
          this.toggleMenu(false);
          document.body.style.overflow = '';

          const icon = this.elements.mobileMenuButton?.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
          this.elements.mobileMenuButton?.setAttribute('aria-label', 'Open navigation');
        }
        this.closeAllDropdowns();
        this.closeSearch();
        this.toggleCurrencyModal(false);
        this.enhanceDesktopDropdowns();
      }
    },

    // ---------- Utilities ----------
    debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    // ---------- Desktop UX Enhancements ----------
    enhanceDesktopDropdowns() {
      if (window.innerWidth >= 992) {
        const dropdowns = document.querySelectorAll('.navbar-nav .dropdown');

        dropdowns.forEach((dropdown) => {
          const toggle = dropdown.querySelector('.dropdown-toggle');
          const menu = dropdown.querySelector('.dropdown-menu');

          // Prevent default click on desktop
          toggle?.addEventListener('click', (e) => {
            if (window.innerWidth >= 992) {
              e.preventDefault();
            }
          });

          // Hover open
          dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 992) {
              clearTimeout(this.state.hoverTimeout);
              dropdowns.forEach((d) => {
                if (d !== dropdown) {
                  d.querySelector('.dropdown-menu')?.classList.remove('show');
                }
              });
              menu?.classList.add('show');
            }
          });

          // Hover close (delayed)
          dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 992) {
              this.state.hoverTimeout = setTimeout(() => {
                menu?.classList.remove('show');
              }, 300);
            }
          });

          // Keep menu open when hovering over it
          menu?.addEventListener('mouseenter', () => {
            clearTimeout(this.state.hoverTimeout);
          });

          menu?.addEventListener('mouseleave', () => {
            this.state.hoverTimeout = setTimeout(() => {
              menu?.classList.remove('show');
            }, 300);
          });
        });
      }
    },

    // ---------- Cart Count ----------
    syncCartCount() {
      if (this.elements.mainCartCount && this.elements.mobileCartCount) {
        // initial sync
        this.elements.mobileCartCount.textContent = this.elements.mainCartCount.textContent;

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
              this.elements.mobileCartCount.textContent = this.elements.mainCartCount.textContent;
            }
          }
        });

        observer.observe(this.elements.mainCartCount, {
          characterData: true,
          childList: true,
          subtree: true
        });
      }
    }
  };

  // Helper to update cart count from localStorage (if you use it elsewhere)
  function updateCartCount() {
    const cart = localStorage.getItem('egyptraCart');
    const items = cart ? JSON.parse(cart) : [];
    const count = items.length;

    document.querySelectorAll('#cartCount, #mobileCartCount').forEach((el) => {
      if (el) {
        el.textContent = String(count);
        if (count > 0) el.classList.add('has-items');
        else el.classList.remove('has-items');
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EgyptraHeader.init());
  } else {
    EgyptraHeader.init();
  }

  // Expose for debugging if needed
  window.EgyptraHeader = EgyptraHeader;
  window.updateCartCount = updateCartCount;
})();
