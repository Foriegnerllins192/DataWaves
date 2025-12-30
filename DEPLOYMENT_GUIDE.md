# DigitalOcean App Platform Deployment Guide

This guide explains how to deploy your DataWaves Node.js application on DigitalOcean App Platform and fix common deployment issues.

## Fixed package.json

Your package.json file has been corrected and is now valid JSON. Here's the final version:

```json
{
  "name": "datawaves",
  "version": "1.0.0",
  "description": "Mobile Data Purchase Application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "axios": "^1.13.2",
    "bcrypt": "^5.1.0",
    "crypto": "^1.0.1",
    "dotenv": "^16.6.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "pg": "^8.11.0",
    "nodemailer": "^7.0.10",
    "paystack": "^2.0.1",
    "twilio": "^5.10.4",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["mobile-data", "data-purchase", "nodejs", "express"],
  "author": "DataWaves Team",
  "license": "MIT"
}
```

## Why DigitalOcean Threw the "malformed package.json" Error

DigitalOcean App Platform threw the "target source directory contains malformed package.json: invalid argument" error because:

1. **Missing commas**: JSON requires commas between fields, but your original file had missing commas
2. **Invalid JSON syntax**: Comments, trailing commas, or improperly quoted values make JSON invalid
3. **JSON parser strictness**: Unlike Node.js, DigitalOcean's build system has a stricter JSON parser

## Correct Project Structure for DigitalOcean

Your project structure should look like this:

```
DataWaves/
├── package.json
├── server.js
├── .env
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── DataPlan.js
│   └── Transaction.js
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── login.html
│   ├── register.html
│   ├── style.css
│   ├── script.js
│   └── ... (other HTML files)
├── routes/
│   ├── api.js
│   ├── admin.js
│   └── payment.js
├── services/
│   ├── emailService.js
│   ├── smsService.js
│   └── ... (other service files)
└── ... (other files and folders)
```

## Source / Root Directory Configuration

In DigitalOcean App Platform, set the **Source Directory** (or **Root Directory**) to:

```
./
```

This means the root of your repository, where your `package.json` and `server.js` files are located.

## Step-by-Step Deployment Process

### 1. Prepare Your Repository

- Ensure your `package.json` is valid JSON (fixed now)
- Make sure `server.js` is in the root directory
- Confirm your `start` script in `package.json` is `"node server.js"`

### 2. Push to GitHub/GitLab

```bash
git add .
git commit -m "Fix package.json for DigitalOcean deployment"
git push origin main
```

### 3. Deploy on DigitalOcean

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub/GitLab account
4. Select your repository
5. Set **Source Directory** to `./` (root of your project)
6. Under "Autodeploy," enable automatic deploys
7. In the "Environment Variables" section, add all your .env variables:
   - PAYSTACK_SECRET_KEY
   - PAYSTACK_PUBLIC_KEY
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASS
   - SMTP_FROM
   - DB_HOST
   - DB_USER
   - DB_PASSWORD
   - DB_NAME
   - DB_PORT
   - DB_SSL
   - SESSION_SECRET
   - APP_URL
8. Click "Next" and then "Deploy"

### 4. Configure Environment Variables in DigitalOcean

Instead of using a `.env` file, add your environment variables in the DigitalOcean App Platform UI:

- Go to your app in DigitalOcean
- Click on "Settings"
- Scroll to "Environment Variables"
- Add each variable from your `.env` file as a separate environment variable

## Common Issues and Solutions

### Issue: "Application Crashes After Deployment"

**Solution:** Check the logs in DigitalOcean App Platform to see the error message. Common causes:

- Missing environment variables
- Database connection issues
- Incorrect start command

### Issue: "Build Fails"

**Solution:**

- Ensure package.json is valid JSON
- Make sure all dependencies are listed in package.json
- Verify your start script is correct

### Issue: "App Won't Start"

**Solution:**

- Check that your server.js listens on the PORT environment variable:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Verifying Your server.js File

Your `server.js` file is already properly configured for DigitalOcean with:

- A PORT environment variable that defaults to 3003
- A health check endpoint at `/health` for DigitalOcean monitoring
- Proper Express.js setup with middleware

## Testing Your Local Setup

Before deploying, test your application locally:

```bash
npm install
npm start
```

Visit `http://localhost:3003` to verify everything works.

## How to Avoid This Error in the Future

1. **Validate JSON**: Always use a JSON validator to check your package.json
2. **No Comments**: Don't put comments in package.json (JSON doesn't support them)
3. **Proper Quotes**: Use double quotes for all keys and string values
4. **No Trailing Commas**: Don't put commas after the last item in arrays or objects
5. **Proper Syntax**: Use a code editor with JSON syntax highlighting

## Summary

Your package.json file has been fixed and is now valid JSON. The DigitalOcean deployment error should be resolved. Just follow the deployment steps above, ensuring you set the correct source directory and environment variables in the DigitalOcean App Platform UI.
