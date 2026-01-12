    // Header scroll effect
    window.addEventListener('scroll', function() {
      const header = document.getElementById('header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backToTop.classList.add('active');
      } else {
        backToTop.classList.remove('active');
      }
    });
    
    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Students Carousel
    const studentSlide = document.getElementById("studentSlide");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const indicators = document.querySelectorAll(".indicator");
    let currentIndex = 0;
    const totalSlides = 6;
    let autoSlideInterval;

    function updateCarousel() {
    studentSlide.style.transform = `translateX(${-100 * currentIndex}%)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index === currentIndex) {
        indicator.classList.add('active');
        } else {
        indicator.classList.remove('active');
        }
    });
    }

    function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoSlide();
    }

    function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
    }

    function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
    }

    function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000);
    }

    function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
    }

    // Event listeners
    prevBtn.addEventListener('click', function() {
    prevSlide();
    resetAutoSlide();
    });

    nextBtn.addEventListener('click', function() {
    nextSlide();
    resetAutoSlide();
    });

    indicators.forEach(indicator => {
    indicator.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        goToSlide(index);
    });
    });

    // Start auto sliding
    startAutoSlide();

    // Form submission
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const messageData = {
        sender_name: formData.get('name'),
        sender_email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };
      
      try {
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Thank you for your message! We will get back to you soon.');
          this.reset();
        } else {
          alert('Failed to send message. Please try again.');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    });

    // Scroll animations and active navigation
    const fadeElements = document.querySelectorAll('.fade-in');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Update active navigation
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.3 });
    
    fadeElements.forEach(el => {
      observer.observe(el);
    });
    
    sections.forEach(section => {
      observer.observe(section);
    });

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav ul');
    
    mobileMenu.addEventListener('click', function() {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        // Allow external links and login page to work normally
        if (targetId === '#' || targetId.includes('.html') || !targetId.startsWith('#')) return;
        
        e.preventDefault();
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (window.innerWidth <= 768) {
            nav.style.display = 'none';
          }
        }
      });
    });