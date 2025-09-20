# Production Build Guide - Fixing Missing Features

## 🚨 The Problem
Features work in development (`npm run dev`) but disappear in production builds (`npm run build` + `npm start` or Vercel deployment).

## ✅ What I Fixed

### 1. **Manual Input Button** 
- **Problem**: Button was wrapped in `process.env.NODE_ENV === 'development'`
- **Fix**: Made it available in production with better naming
- **Result**: "✋ Enter Food Name" button now works in production

### 2. **Camera SSR Issues**
- **Problem**: `navigator.mediaDevices` not available during server-side rendering
- **Fix**: Added proper client-side environment checks
- **Result**: Camera functionality works in production

### 3. **Environment Variables**
- **Problem**: Missing environment variables in production
- **Solution**: Comprehensive environment variable setup

## 🔧 Environment Variables for Production

### For Vercel Deployment:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add these variables:**

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clarifai AI (Required)
CLARIFAI_API_KEY=your_clarifai_api_key
CLARIFAI_WORKFLOW_ID=General

# Edamam Nutrition (Required)
EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_APP_KEY=your_edamam_app_key

# OpenAI (Required)
OPENAI_API_KEY=your_openai_api_key

# Next.js (Required)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### For Local Production Testing:

1. **Create `.env.local`** (already done)
2. **Test locally:**
   ```bash
   npm run build
   npm start
   ```

## 🧪 Testing Production Build

### 1. **Local Production Test:**
```bash
# Build the project
npm run build

# Start production server
npm start

# Test in browser
open http://localhost:3000
```

### 2. **Check These Features:**
- ✅ Camera scanning works
- ✅ "✋ Enter Food Name" button appears
- ✅ Manual input modal works
- ✅ Food analysis completes
- ✅ Results display properly

### 3. **Debug Production Issues:**
```bash
# Check build logs
npm run build 2>&1 | tee build.log

# Check for errors
grep -i error build.log
```

## 🐛 Common Production Issues & Solutions

### Issue 1: Features Missing
**Cause**: `process.env.NODE_ENV === 'development'` conditions
**Fix**: Remove or modify development-only conditions

### Issue 2: Camera Not Working
**Cause**: SSR trying to access `navigator` object
**Fix**: Added `typeof window === 'undefined'` checks

### Issue 3: API Calls Failing
**Cause**: Missing environment variables in production
**Fix**: Add all required env vars to Vercel dashboard

### Issue 4: Hydration Mismatch
**Cause**: Server and client rendering different content
**Fix**: Use `useEffect` for client-only code

## 🔍 Debugging Production Builds

### 1. **Check Environment Variables:**
Visit: `https://your-domain.vercel.app/api/check-env`

### 2. **Check Console Logs:**
- Open browser dev tools
- Look for error messages
- Check network tab for failed API calls

### 3. **Test Each Feature:**
- Camera scanning
- Manual food input
- Food analysis
- Results display

## 📋 Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Local production build works (`npm run build && npm start`)
- [ ] Camera functionality works
- [ ] Manual input button appears
- [ ] Food analysis completes
- [ ] Results display properly
- [ ] No console errors
- [ ] All API endpoints respond correctly

## 🚀 Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Push to GitHub** (if using GitHub integration)
3. **Deploy** (automatic with Vercel)
4. **Test** all features on live site
5. **Check** `/api/check-env` endpoint

## 🆘 If Features Still Missing

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions tab
   - Look for error logs

2. **Check Browser Console:**
   - Look for JavaScript errors
   - Check network requests

3. **Verify Environment Variables:**
   - Visit `/api/check-env`
   - Ensure all required vars are set

4. **Test API Endpoints:**
   - Test each API route individually
   - Check for 500 errors

The main issue was that the manual input button was development-only. Now it's available in production! 🎉
