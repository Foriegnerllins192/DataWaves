const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

// 1. CRASH PREVENTION HANDLERS
// Catch uncaught exceptions to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1); // Render will restart the service
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err.name, err.message);
  // Don't crash immediately, but log it.
});

// 2. ENVIRONMENT CHECK
// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'PAYSTACK_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`WARNING: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('App may not function correctly in production.');
}

const apiRoutes = require("./routes/api");
const adminRoutes = require("./routes/admin");

const app = express();
// Ensure PORT is set from environment or default to 3003
const PORT = process.env.PORT || 3003;

// 3. MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Trust proxy for Render/Cloud hosting (required for secure cookies behind load balancers)
app.set('trust proxy', 1);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dataway_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Secure in production (requires HTTPS)
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// Serve static files
app.use("/images", express.static(path.join(__dirname, "images")));

// 4. AUTH MIDDLEWARE
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login.html");
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }
  // Redirect regular users trying to access admin pages
  if (req.session && req.session.user && req.session.user.role === "user") {
    return res.redirect("/dashboard.html");
  }
  // Redirect unauthenticated users to login
  res.redirect("/login.html");
};

// 5. ROUTES

// API Routes
app.use("/api", apiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", require("./routes/payment"));
app.use("/api/validation", require("./routes/validation"));

// Health check endpoint for DigitalOcean/Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// -- Public Pages --
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/mtn.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mtn.html"));
});

app.get("/telecel.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "telecel.html"));
});

app.get("/at.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "at.html"));
});

// -- Auth Pages (Public but redirect if logged in) --
app.get("/login.html", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(req.session.user.role === "admin" ? "/admin/dashboard.html" : "/dashboard.html");
  }
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register.html", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(req.session.user.role === "admin" ? "/admin/dashboard.html" : "/dashboard.html");
  }
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// -- Protected User Pages --
app.get("/dashboard.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/account.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/buy-plan.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "buy-plan.html"));
});

app.get("/payment.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment.html"));
});

app.get("/payment-success.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment-success.html"));
});

app.get("/payment-failed.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment-failed.html"));
});

app.get("/receipt.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "receipt.html"));
});

// -- Admin Pages --
app.get("/admin", isAdmin, (req, res) => {
  res.redirect("/admin/dashboard.html");
});

app.get("/admin/dashboard.html", isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "dashboard.html"));
});

app.get("/admin/users.html", isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "users.html"));
});

app.get("/admin/plans.html", isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "plans.html"));
});

app.get("/admin/transactions.html", isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "transactions.html"));
});

// -- Catch-all / Fallback Route --
// Note: This matches any route not defined above, so it must be last among routes.
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  
  // Prevent directory traversal
  if (page.includes('..') || page.includes('/')) {
    return next();
  }

  // Define known pages to avoid serving arbitrary files
  const knownPages = [
    "index", "mtn", "telecel", "at", "login", "register",
    "dashboard", "account", "buy-plan", "payment", 
    "payment-success", "payment-failed", "receipt"
  ];

  // Simple check: if it ends in .html or is in the list, try to serve it from public
  // This legacy logic is preserved but wrapped in safety
  const baseName = page.replace('.html', '');
  
  if (knownPages.includes(baseName)) {
     // Rely on the explicit routes above if possible, but this catches stragglers
     res.sendFile(path.join(__dirname, "public", baseName + ".html"), (err) => {
       if (err) next(); // Pass to 404 handler if not found
     });
  } else {
    next(); // Not a known page, pass to 404
  }
});

// 6. ERROR HANDLING

// 404 Handler
app.use((req, res, next) => {
  res.status(404).send('<h1>404 - Page Not Found</h1><p>The requested resource could not be found.</p>');
});

// Global Error Handler (Must be last)
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR HANDLER:', err.stack);
  
  // Send JSON response for API calls
  if (req.xhr || req.path.startsWith('/api')) {
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
  
  // For HTML requests, send a generic error page
  res.status(500).send('<h1>500 - Internal Server Error</h1><p>Something went wrong on our end.</p>');
});

// 7. SERVER START
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});