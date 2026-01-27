let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  const slides = document.getElementsByClassName("mySlides");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1 }
  if (slides.length > 0) {
    slides[slideIndex - 1].style.display = "block";
  }
  setTimeout(showSlides, 3000); // Change image every 3 seconds
}

// Universal navbar authentication handler
function initializeNavbar() {
  fetch('/api/user')
    .then(res => res.json())
    .then(user => {
      const userInfo = document.getElementById('user-info');
      const authLinksDefault = document.getElementById('auth-links-default');
      const userButton = document.getElementById('user-button');
      
      if (user && !user.error) {
        // User is logged in
        if (userInfo) {
          userInfo.style.display = '';
          userInfo.classList.remove('d-none');
        }
        if (authLinksDefault) {
          authLinksDefault.style.display = '';
          authLinksDefault.classList.add('d-none');
        }
        if (userButton) {
          userButton.textContent = user.full_name || 'User';
          userButton.title = `Logged in as ${user.full_name || 'User'}`;
        }
      } else {
        // User is not logged in
        if (userInfo) {
          userInfo.style.display = '';
          userInfo.classList.add('d-none');
        }
        if (authLinksDefault) {
          authLinksDefault.style.display = '';
          authLinksDefault.classList.remove('d-none');
        }
      }
    })
    .catch(err => {
      // Error checking auth status, assume not logged in
      const userInfo = document.getElementById('user-info');
      const authLinksDefault = document.getElementById('auth-links-default');
      
      if (userInfo) {
        userInfo.style.display = '';
        userInfo.classList.add('d-none');
      }
      if (authLinksDefault) {
        authLinksDefault.style.display = '';
        authLinksDefault.classList.remove('d-none');
      }
    });
}

// Universal logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    fetch('/api/logout', { method: 'POST' })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          window.location.href = "index.html";
        } else {
          alert("Logout failed: " + (response.error || "Unknown error"));
        }
      })
      .catch(err => {
        console.error('Logout error:', err);
        window.location.href = "index.html";
      });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Initialize navbar on all pages
  initializeNavbar();
  
  // Handle registration form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData);

      // Validate passwords match
      if (data.password !== data.confirm_password) {
        alert("Passwords do not match!");
        return;
      }

      // Send to backend
      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          alert("Registration successful!");
          window.location.href = "login.html";
        } else {
          alert(response.error || "Registration failed!");
        }
      })
      .catch(err => {
        console.error('Error:', err);
        alert("Registration failed! Please try again.");
      });
    });
  }

  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData);

      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          window.location.href = "dashboard.html";
        } else {
          alert(response.error || "Login failed!");
        }
      })
      .catch(err => {
        console.error('Error:', err);
        alert("Login failed! Please try again.");
      });
    });
  }
});
// Universal Mobile Menu Toggle Function
function toggleMobileMenu() {
  const navbarNav = document.querySelector('.navbar-nav');
  const authButtons = document.querySelector('#auth-links-default, .auth-buttons');
  
  if (navbarNav) {
    navbarNav.classList.toggle('show');
  }
  
  if (authButtons) {
    authButtons.classList.toggle('show');
  }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const isClickInsideNavbar = navbar && navbar.contains(event.target);
  const isClickOnToggle = mobileToggle && mobileToggle.contains(event.target);
  
  if (!isClickInsideNavbar && !isClickOnToggle) {
    const navbarNav = document.querySelector('.navbar-nav');
    const authButtons = document.querySelector('#auth-links-default, .auth-buttons');
    
    if (navbarNav) navbarNav.classList.remove('show');
    if (authButtons) authButtons.classList.remove('show');
  }
});

// Close mobile menu when window is resized to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    const navbarNav = document.querySelector('.navbar-nav');
    const authButtons = document.querySelector('#auth-links-default, .auth-buttons');
    
    if (navbarNav) navbarNav.classList.remove('show');
    if (authButtons) authButtons.classList.remove('show');
  }
});