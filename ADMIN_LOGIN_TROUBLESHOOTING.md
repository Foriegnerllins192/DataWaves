# Admin Login Troubleshooting Guide

## ✅ Admin Account Status: WORKING

The admin account has been successfully created and tested. The login API is functioning correctly.

## 🔑 Admin Credentials

**Email:** `admin@datawaves.com`  
**Password:** `DataWaves2026!`

## 🌐 Login URLs

- **Login Page:** http://localhost:3003/login.html
- **Admin Dashboard:** http://localhost:3003/admin (redirects to login if not authenticated)

## ✅ Verified Working Components

1. ✅ Admin user exists in database
2. ✅ Password hash is correct
3. ✅ Admin role is properly set
4. ✅ Login API endpoint works
5. ✅ Admin dashboard access works
6. ✅ Session management works

## 🔧 If You Still Can't Login

### Step 1: Clear Browser Data
1. **Clear cookies and cache** for localhost:3003
2. **Try incognito/private browsing mode**
3. **Try a different browser**

### Step 2: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try logging in and check for JavaScript errors
4. Look for network errors in Network tab

### Step 3: Verify Server is Running
```bash
# Check if server is running
curl http://localhost:3003/api/user
# Should return: {"error":"Authentication required"}

# Or check the login page loads
curl http://localhost:3003/login.html
```

### Step 4: Test Login via API (Command Line)
```bash
# Test login directly
node scripts/test-login-api.js
```

### Step 5: Manual Browser Test
1. Go to: http://localhost:3003/login.html
2. Open Developer Tools (F12) → Console
3. Enter these credentials:
   - Email: `admin@datawaves.com`
   - Password: `DataWaves2026!`
4. Click "Sign In"
5. Check console for any errors

### Step 6: Reset Admin Password
If you suspect password issues:
```bash
node scripts/create-admin-direct.js
```

## 🐛 Common Issues & Solutions

### Issue: "Invalid credentials" error
**Solution:** 
- Double-check email and password (case-sensitive)
- Ensure no extra spaces in email/password
- Try copying credentials from this document

### Issue: Login form doesn't submit
**Solution:**
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled
- Try different browser

### Issue: "Server error" message
**Solution:**
- Check server logs
- Ensure database connection is working
- Restart the server: `npm start`

### Issue: Redirected to login after successful login
**Solution:**
- Clear browser cookies
- Check session configuration
- Ensure cookies are enabled

### Issue: Admin dashboard shows "Access denied"
**Solution:**
- Verify user role is 'admin' in database
- Check session data
- Re-login to refresh session

## 🔍 Debug Commands

### Check Admin User in Database
```bash
node scripts/test-admin-login.js
```

### Test API Endpoints
```bash
# Test login
node scripts/test-login-api.js

# Check server status
curl http://localhost:3003/api/user
```

### View Server Logs
Check the terminal where you ran `npm start` for any error messages.

## 📞 Still Having Issues?

If you're still unable to login after trying all the above steps:

1. **Check the exact error message** you're seeing
2. **Copy any console errors** from browser Developer Tools
3. **Note which step fails** (form submission, API call, redirect, etc.)

The login system has been verified to work correctly, so the issue is likely:
- Browser-related (cookies, cache, JavaScript)
- Network-related (firewall, proxy)
- User error (wrong credentials, typos)

## 🎯 Quick Test Checklist

- [ ] Server is running (`npm start`)
- [ ] Database connection works
- [ ] Admin user exists (run `node scripts/test-admin-login.js`)
- [ ] API login works (run `node scripts/test-login-api.js`)
- [ ] Browser cookies/cache cleared
- [ ] JavaScript enabled in browser
- [ ] Correct URL: http://localhost:3003/login.html
- [ ] Exact credentials: admin@datawaves.com / DataWaves2026!

If all checkboxes are ✅ and you still can't login, there may be a browser-specific issue. Try a different browser or incognito mode.