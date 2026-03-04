 
    // Header scroll effect
    window.addEventListener("scroll", function () {
      const header = document.getElementById("mainHeader");
      header.classList.toggle("scrolled", window.scrollY > 50);
    });

    // Mobile nav toggle
    document.getElementById("menuToggle").addEventListener("click", function () {
      document.querySelector("nav").classList.toggle("active");
    });

    // Toggle dropdowns on mobile
    document.querySelectorAll(".menu-li").forEach((item) => {
      item.addEventListener("click", function (e) {
        if (window.innerWidth <= 768 && item.querySelector(".i-dropdown-menu")) {
          e.preventDefault();
          item.classList.toggle("show");
        }
      });
    });
    const cursort = document.querySelector('.cursor');

    // Create just one trail element
    const trail = document.createElement('div');
    trail.className = 'trail';
    document.body.appendChild(trail);

    // Store its position
    const trailData = {
      el: trail,
      x: 0,
      y: 0
    };

    // Mouse position
    let mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    // Update mouse position
    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Optional: move the main cursor directly
      cursort.style.top = mouse.y + 'px';
      cursort.style.left = mouse.x + 'px';
    });

    // Animate single trail
    function animate() {
      trailData.x += (mouse.x - trailData.x) * 0.2;
      trailData.y += (mouse.y - trailData.y) * 0.2;

      trailData.el.style.left = trailData.x + 'px';
      trailData.el.style.top = trailData.y + 'px';

      requestAnimationFrame(animate);
    }

    animate();


    // Optional: Apply stored colors on page load
    document.querySelectorAll('.color-circle').forEach(circle => {
      circle.addEventListener('click', function () {
        const selectedColor = this.getAttribute('data-color');

        // Change background of buttons
        document.querySelectorAll('.my-button').forEach(btn => {
          btn.style.backgroundColor = selectedColor;
        });

        // Change text color
        document.querySelectorAll('.my-text').forEach(text => {
          text.style.color = selectedColor;
        });

        // Change border color
        document.querySelectorAll('.my_border').forEach(borderEl => {
          borderEl.style.borderColor = selectedColor;
        });
      });
    });

    document.querySelector('.toggle-palette').addEventListener('click', function () {
      const palette = document.querySelector('.color-palette');
      palette.classList.toggle('show');
      const icon = this.querySelector('i');
      icon.classList.toggle('bx-palette');
      icon.classList.toggle('bx-palette');
    });
    document.addEventListener("DOMContentLoaded", function () {
      const buttons = document.querySelectorAll('.features-btn');
      const contents = document.querySelectorAll('.experience-content');

      // Show the first content by default
      contents.forEach(content => content.style.display = "none");
      contents[0].style.display = "flex";
      contents[0].classList.add("active");
      buttons[0].classList.add("active");

      buttons.forEach((btn, index) => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();

          // Remove active classes
          buttons.forEach(b => b.classList.remove('active'));
          contents.forEach(c => {
            c.classList.remove('active');
            c.style.display = "none";
          });

          // Add active class to clicked tab and show corresponding content
          this.classList.add('active');
          contents[index].classList.add('active');
          contents[index].style.display = "flex";
        });
      });
    });
  const sections = document.querySelectorAll('.scroll-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting) {
        el.classList.add('visible');
        el.classList.remove('fade-out');
      } else {
        if (entry.boundingClientRect.top < 0) {
          el.classList.add('fade-out');
        }
        el.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.3
  });

  sections.forEach(section => {
    observer.observe(section);
  });
  const toggle = document.getElementById('toggleSwitchPlans');
  const monthlyLabel = document.querySelector('.toggle-label-plans.monthly');
  const yearlyLabel = document.querySelector('.toggle-label-plans.yearly');

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      yearlyLabel.classList.add('active');
      monthlyLabel.classList.remove('active');
    } else {
      monthlyLabel.classList.add('active');
      yearlyLabel.classList.remove('active');
    }
  });
