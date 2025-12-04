# VITE_BASE_URL Environment Variable Setup

## Problem Fixed
Frontend was sending requests to `https://uber-clone-main-ten.vercel.app/undefined/users/login` because `VITE_BASE_URL` was not available at build time on Vercel.

## Solution Implemented

### 1. Created API Config Helper
- **File**: `frontend/src/utils/api-config.js`
- Exports `apiBaseUrl` which safely reads `VITE_BASE_URL`
- Falls back to `http://localhost:5000` in development
- Falls back to `window.location.origin` in production if env var is missing
- Includes warning logs to help debug missing configuration

### 2. Updated All Frontend API Calls
All files updated to import and use `apiBaseUrl`:
- `frontend/src/pages/UserLogin.jsx`
- `frontend/src/pages/UserSignup.jsx`
- `frontend/src/pages/Captainlogin.jsx`
- `frontend/src/pages/CaptainSignup.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/UserProtectWrapper.jsx`
- `frontend/src/pages/CaptainProtectWrapper.jsx`
- `frontend/src/pages/CaptainHome.jsx`
- `frontend/src/context/UserContext.jsx`
- `frontend/src/context/CapatainContext.jsx`
- `frontend/src/context/SocketContext.jsx`
- `frontend/src/components/ConfirmRidePopUp.jsx`
- `frontend/src/components/FinishRide.jsx`

### 3. Environment Configuration

**Local Development** (`frontend/.env`):
```
VITE_BASE_URL=http://localhost:5000
```

**Production** (`frontend/.env.production` reference):
```
VITE_BASE_URL=https://backend-3-e1dm.onrender.com
```

## How to Fix on Vercel

1. Go to your Vercel project: https://vercel.com
2. Select your frontend project
3. Go to **Settings → Environment Variables**
4. Add a new variable:
   - **Name**: `VITE_BASE_URL`
   - **Value**: `https://backend-3-e1dm.onrender.com` (or your backend URL)
   - **Environment**: Select `Production` (and `Preview` if desired)
5. Redeploy the frontend (push to main or manual redeploy in Vercel dashboard)

## Verification

After deployment:
```bash
curl -I https://uber-clone-main-ten.vercel.app/signup
# Should return 200 OK and serve index.html
```

Test the login:
- Navigate to `https://uber-clone-main-ten.vercel.app/login`
- Network requests should go to `https://backend-3-e1dm.onrender.com/users/login` (not to Vercel frontend)

## Why This Works

- Vite only exposes environment variables that start with `VITE_`
- Vercel reads `.env` files at build time, not runtime
- By using the `apiBaseUrl` helper, we safely fallback if the env var is missing
- The helper function runs at runtime, giving us flexibility
- Console warnings help diagnose configuration issues
