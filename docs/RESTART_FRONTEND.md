# Restart Frontend Server

## The Issue
Vite was only listening on IPv6, but your browser uses IPv4. This caused "No internet" errors.

## The Fix
Updated `vite.config.js` to bind to `0.0.0.0` (all interfaces).

## How to Restart

1. **Stop the current frontend server:**
   - Go to the terminal where `npm run dev` is running
   - Press `Ctrl+C` to stop it

2. **Restart the frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Verify it's working:**
   - You should see: `Local: http://localhost:3000/`
   - Open `http://localhost:3000` in your browser
   - It should now work!

## Alternative: Use IPv6 directly
If you want to test without restarting, try:
- `http://[::1]:3000` in your browser

But the proper fix is to restart with the new config.

