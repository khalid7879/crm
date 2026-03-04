// Header scroll effect
window.addEventListener("scroll", function () {
  const header = document.getElementById("mainHeader");
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 50);
  }
});

// Mobile nav toggle
const menuToggle = document.getElementById("menuToggle");
if (menuToggle) {
  menuToggle.addEventListener("click", function () {
    const nav = document.querySelector("nav");
    if (nav) nav.classList.toggle("active");
  });
}

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
  if (cursort) {
    cursort.style.top = mouse.y + 'px';
    cursort.style.left = mouse.x + 'px';
  }
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

// Toggle palette show/hide - safer with existence checks
const togglePalette = document.querySelector('.toggle-palette');
if (togglePalette) {
  togglePalette.addEventListener('click', function () {
    const palette = document.querySelector('.color-palette');
    if (palette) palette.classList.toggle('show');


  });
}

// Color circle click to apply colors - safe if elements exist
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

// Features tabs logic
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll('.features-btn');
  const contents = document.querySelectorAll('.experience-content');

  if (buttons.length && contents.length) {
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
  }
});

// Scroll reveal effect - works globally for all .scroll-section
document.addEventListener('scroll', () => {
  const scrollSections = document.querySelectorAll('.scroll-section');
  const triggerBottom = window.innerHeight * 0.9;

  scrollSections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;

    if (sectionTop < triggerBottom) {
      section.classList.add('visible');
    } else {
      section.classList.remove('visible');
    }
  });
});

// Toggle monthly/yearly plans label active class
const toggle = document.getElementById('toggleSwitchPlans');
const monthlyLabel = document.querySelector('.toggle-label-plans.monthly');
const yearlyLabel = document.querySelector('.toggle-label-plans.yearly');

if (toggle && monthlyLabel && yearlyLabel) {
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      yearlyLabel.classList.add('active');
      monthlyLabel.classList.remove('active');
    } else {
      monthlyLabel.classList.add('active');
      yearlyLabel.classList.remove('active');
    }
  });
}
