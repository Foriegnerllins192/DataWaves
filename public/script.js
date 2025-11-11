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
  slides[slideIndex - 1].style.display = "block";
  setTimeout(showSlides, 3000); // Change image every 3 seconds
}

document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

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
document.addEventListener("DOMContentLoaded", function () {
  // Fetch real user data from API
  fetch('/api/user')
    .then(res => res.json())
    .then(user => {
      if (user.error) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return;
      }
      
      // Show user info
      document.getElementById("userFullName").textContent = user.full_name || "User";
      document.getElementById("userEmail").textContent = user.email || "-";
      document.getElementById("userPhone").textContent = user.phone || "-";
      
      // Also update account page elements if they exist
      if (document.getElementById("userName")) {
        document.getElementById("userName").textContent = user.full_name || "User";
      }
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
    });

  // Fetch real transactions from API
  fetch('/api/transactions')
    .then(res => res.json())
    .then(transactions => {
      const transactionList = document.getElementById("transactionList");
      
      if (transactions.error) {
        transactionList.innerHTML = "<tr><td colspan='4'>Please log in to view transactions.</td></tr>";
        return;
      }
      
      if (transactions.length === 0) {
        transactionList.innerHTML = "<tr><td colspan='4'>No transactions found.</td></tr>";
      } else {
        transactions.forEach(tx => {
          const row = document.createElement("tr");
          const date = new Date(tx.created_at).toLocaleDateString();
          row.innerHTML = `
            <td>${date}</td>
            <td>${tx.size || tx.plan}</td>
            <td>${tx.network}</td>
            <td><span class="status success">${tx.status}</span></td>
          `;
          transactionList.appendChild(row);
        });
      }
    })
    .catch(err => {
      console.error('Error fetching transactions:', err);
      const transactionList = document.getElementById("transactionList");
      transactionList.innerHTML = "<tr><td colspan='4'>Error loading transactions.</td></tr>";
    });
});

// Check user authentication status and update UI
function checkAuthStatus() {
  fetch('/api/user')
    .then(res => res.json())
    .then(user => {
      if (user && !user.error) {
        // User is logged in
        if (document.getElementById('auth-links-default')) {
          document.getElementById('auth-links-default').style.display = 'none';
        }
        if (document.getElementById('user-info')) {
          document.getElementById('user-info').style.display = 'block';
        }
        if (document.getElementById('user-button')) {
          document.getElementById('user-button').textContent = user.full_name || 'User';
        }
      } else {
        // User is not logged in
        if (document.getElementById('auth-links-default')) {
          document.getElementById('auth-links-default').style.display = 'block';
        }
        if (document.getElementById('user-info')) {
          document.getElementById('user-info').style.display = 'none';
        }
      }
    })
    .catch(err => {
      // Error checking auth status, assume not logged in
      if (document.getElementById('auth-links-default')) {
        document.getElementById('auth-links-default').style.display = 'block';
      }
      if (document.getElementById('user-info')) {
        document.getElementById('user-info').style.display = 'none';
      }
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Only check auth status on pages that have the user-info element
  checkAuthStatus();
});

// Logout function
function logout() {
  fetch('/api/logout', {
    method: 'POST'
  })
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      // Redirect to home page after logout
      window.location.href = "index.html";
    } else {
      alert("Logout failed: " + (response.error || "Unknown error"));
    }
  })
  .catch(err => {
    console.error('Logout error:', err);
    // Even if there's an error, redirect to home page
    window.location.href = "index.html";
  });
}
