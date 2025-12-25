# Frontend Troubleshooting Guide

## "No Internet" Error on localhost:3000

This error usually means the browser can't connect to the Vite dev server. Here's how to fix it:

### Step 1: Verify Vite Server is Running

Check if the Vite dev server is actually running:

```powershell
# In the frontend directory
cd frontend
npm run dev
```

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 2: Check for Errors

Look for any errors in the terminal where you ran `npm run dev`. Common issues:
- Port 3000 already in use
- Missing dependencies
- Syntax errors in code

### Step 3: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or try:
- Incognito/Private window
- Different browser
- Clear browser cache completely

### Step 4: Check Firewall

Windows Firewall might be blocking localhost:
1. Open Windows Defender Firewall
2. Check if Node.js or Vite is blocked
3. Allow through firewall if needed

### Step 5: Try Different Port

If port 3000 is blocked, change it:

```javascript
// vite.config.js
server: {
  port: 3001,  // Change to different port
  // ...
}
```

### Step 6: Reinstall Dependencies

```powershell
cd frontend
rm -r node_modules
npm install
npm run dev
```

### Step 7: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try loading localhost:3000
4. Check what requests are failing

### Step 8: Verify Backend is Running

Make sure backend is on port 8080:
```powershell
Test-NetConnection -ComputerName localhost -Port 8080
```

### Quick Fix Checklist

- [ ] Vite server is running (`npm run dev`)
- [ ] No errors in terminal
- [ ] Port 3000 is not in use by another app
- [ ] Browser cache cleared
- [ ] Tried incognito mode
- [ ] Backend is running on port 8080
- [ ] Firewall is not blocking Node.js


