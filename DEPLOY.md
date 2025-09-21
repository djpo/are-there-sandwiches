# Deploying to Vercel with Persistent Counter

## Quick Deploy

1. **Push to GitHub** (if not already)
```bash
git add .
git commit -m "Sandwich request app with counter"
git push
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add your environment variables from `.env.local`

3. **Enable Vercel KV for Persistent Counter**

After deployment, in your Vercel dashboard:

1. Go to your project
2. Click on the **Storage** tab
3. Click **Create Database**
4. Select **KV** (Redis-compatible)
5. Choose a name (e.g., "sandwich-counter")
6. Select your region (closest to you)
7. Click **Create**

Vercel will automatically:
- Add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment variables
- Redeploy your app with KV access

## How it Works

- **Local Development**: Uses in-memory counter (resets on restart)
- **Production (without KV)**: Uses in-memory counter (resets on deploy)
- **Production (with KV)**: Persistent counter that never resets!

The counter will survive:
- Server restarts
- New deployments
- Multiple server instances
- Forever (until you manually reset it)

## Resetting the Counter

If you ever need to reset the counter in production:

1. Go to Vercel Dashboard → Storage → Your KV Database
2. Click on "Data Browser"
3. Find the key `sandwich_requests_total`
4. Delete it or set it to 0

## Cost

Vercel KV free tier includes:
- 3000 requests/month (plenty for sandwich activism!)
- 1GB storage
- Perfect for this use case

Your sandwich counter is now immortal! 🥪♾️