# 🚀 Deployment Guide for Online Examination System

## Overview
This guide will help you deploy your full-stack online examination system to production.

## Architecture
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway/Render (recommended) or convert to Vercel API routes
- **Database**: MongoDB Atlas

## Step 1: Prepare Your Project

### 1.1 Environment Variables
Create a `.env` file in your backend directory:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 1.2 Update API Configuration
Your frontend is already configured to use environment variables for the API URL.

## Step 2: Deploy Backend

### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `backend` folder
6. Add environment variables in Railway dashboard
7. Deploy

### Option B: Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables
7. Deploy

## Step 3: Deploy Frontend to Vercel

### 3.1 Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Set environment variable
vercel env add VITE_API_BASE_URL
# Enter your backend URL (e.g., https://your-backend.railway.app)
```

### 3.2 Using Vercel Dashboard
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your backend URL
7. Deploy

## Step 4: Database Setup

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Update your backend environment variables

## Step 5: Post-Deployment

### 5.1 Update CORS Settings
Your backend already has CORS configured for production.

### 5.2 Test Your Application
1. Visit your Vercel frontend URL
2. Test user registration/login
3. Test exam creation and taking
4. Verify all features work

## Step 6: Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Domains"
3. Add your custom domain
4. Configure DNS settings

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly in backend
2. **Database Connection**: Check MongoDB Atlas connection string
3. **Environment Variables**: Verify all required variables are set
4. **Build Errors**: Check build logs in deployment platform

### Environment Variables Checklist:
- [ ] `MONGO_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Random secret key for JWT
- [ ] `JWT_EXPIRE` - JWT expiration time
- [ ] `FRONTEND_URL` - Your Vercel app URL
- [ ] `VITE_API_BASE_URL` - Your backend URL

## Security Considerations
1. Use strong JWT secrets
2. Enable MongoDB Atlas IP whitelisting
3. Use HTTPS in production
4. Regularly update dependencies

## Monitoring
- Use Vercel Analytics for frontend monitoring
- Use Railway/Render logs for backend monitoring
- Set up MongoDB Atlas monitoring

## Cost Estimation
- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **Railway**: Free tier (500 hours/month)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total**: $0/month for small to medium usage
