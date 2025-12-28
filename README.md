# Zerodha Holdings Viewer

A simple, secure web application to view your Zerodha stock holdings using the Kite Connect API. Built with vanilla JavaScript and deployed on Cloudflare Pages.

## Features

- 🔐 Secure OAuth authentication with Zerodha Kite Connect
- 📊 View all your stock holdings in a clean, responsive interface
- 💰 Real-time P&L calculation
- 📱 Mobile-friendly design
- ⚡ Fast and secure - runs on Cloudflare's global network
- 🔒 API secrets safely stored as environment variables (never exposed to frontend)

## Prerequisites

Before you begin, you'll need:

1. **Zerodha Account** - You must have an active Zerodha trading account
2. **Kite Connect Developer Account** - Sign up at [https://developers.kite.trade/](https://developers.kite.trade/)
3. **Cloudflare Account** - Free account at [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
4. **Node.js** (optional, for local development) - Download from [https://nodejs.org/](https://nodejs.org/)

## Step-by-Step Setup Guide

### Step 1: Create a Kite Connect App

1. Go to [https://developers.kite.trade/apps](https://developers.kite.trade/apps)
2. Click on "Create new app"
3. Fill in the details:
   - **App name**: Choose any name (e.g., "My Holdings Viewer")
   - **App type**: Select "Connect"
   - **Redirect URL**: Leave this blank for now (we'll update it after deploying to Cloudflare)
4. Click "Create"
5. Once created, you'll see your **API Key** and **API Secret**
6. **IMPORTANT**: Keep your API Secret safe and NEVER share it publicly!

### Step 2: Deploy to Cloudflare Pages

#### Option A: Deploy via Cloudflare Dashboard (Recommended for beginners)

1. **Create a GitHub repository** (if you haven't already):
   - Go to [https://github.com/new](https://github.com/new)
   - Create a new repository
   - Push your code to GitHub:
     ```bash
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
     git push -u origin main
     ```

2. **Deploy to Cloudflare Pages**:
   - Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
   - Click on "Workers & Pages" in the left sidebar
   - Click "Create application" > "Pages" > "Connect to Git"
   - Select your GitHub repository
   - Configure build settings:
     - **Build command**: Leave empty
     - **Build output directory**: `/`
   - Click "Save and Deploy"

3. **Wait for deployment** - Your app will be live at `https://your-project-name.pages.dev`

#### Option B: Deploy via Wrangler CLI

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Deploy**:
   ```bash
   npx wrangler pages deploy .
   ```

4. Your app will be deployed and you'll receive a URL like `https://your-project-name.pages.dev`

### Step 3: Configure Environment Variables

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your project
3. Go to "Settings" > "Environment variables"
4. Add the following variables for **Production**:
   - `ZERODHA_API_KEY`: Your Kite Connect API Key (from Step 1)
   - `ZERODHA_API_SECRET`: Your Kite Connect API Secret (from Step 1)
5. Click "Save"

### Step 4: Update Kite Connect Redirect URL

1. Go back to [https://developers.kite.trade/apps](https://developers.kite.trade/apps)
2. Click on your app
3. Update the **Redirect URL** to: `https://your-project-name.pages.dev/callback.html`
   - Replace `your-project-name` with your actual Cloudflare Pages URL
4. Click "Save"

### Step 5: Test Your App

1. Open your app at `https://your-project-name.pages.dev`
2. Click the "Click Me" button
3. You'll be redirected to Zerodha login
4. Login with your Zerodha credentials
5. Authorize the app
6. You'll be redirected back to your app
7. Click "Display Holdings" to view your stock holdings!

## Project Structure

```
zerodha-holdings-app/
├── index.html           # Main page with login button
├── callback.html        # OAuth callback handler page
├── app.js              # Main application logic
├── callback.js         # Callback page logic
├── functions/          # Cloudflare Pages Functions (serverless)
│   └── api/
│       ├── auth.js     # Token exchange endpoint
│       └── holdings.js # Holdings fetch endpoint
├── package.json        # Project metadata
├── wrangler.toml       # Cloudflare configuration
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## How It Works

### Authentication Flow

1. User clicks "Click Me" button
2. App redirects to Zerodha login page with your API key
3. User authenticates with Zerodha
4. Zerodha redirects back to your app with a **request token**
5. The callback page sends the request token to your serverless function
6. The serverless function exchanges the request token for an **access token** using your API secret
7. Access token is stored in browser's localStorage
8. User can now fetch holdings

### Security

- ✅ API Secret is NEVER exposed to the frontend
- ✅ All API calls go through Cloudflare Pages Functions (serverless)
- ✅ Access tokens are stored client-side but expire daily
- ✅ HTTPS encryption on all connections
- ✅ Environment variables are encrypted by Cloudflare

## API Endpoints

### POST /api/auth
Exchanges request token for access token.

**Request:**
```json
{
  "request_token": "xxx"
}
```

**Response:**
```json
{
  "access_token": "xxx",
  "user_id": "xxx",
  "user_name": "xxx",
  "email": "xxx@example.com"
}
```

### POST /api/holdings
Fetches holdings for authenticated user.

**Request:**
```json
{
  "access_token": "xxx"
}
```

**Response:**
```json
{
  "data": [
    {
      "tradingsymbol": "RELIANCE",
      "quantity": 10,
      "average_price": 2500.50,
      "last_price": 2650.75,
      ...
    }
  ]
}
```

## Local Development

To run the app locally:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create a `.dev.vars` file** (for local development only):
   ```
   ZERODHA_API_KEY=your_api_key_here
   ZERODHA_API_SECRET=your_api_secret_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Update your Kite Connect app**:
   - Add `http://localhost:8788/callback.html` as an additional redirect URL

5. Open `http://localhost:8788` in your browser

## Troubleshooting

### "Server configuration error"
- Make sure you've set the environment variables in Cloudflare Dashboard
- Redeploy your app after setting environment variables

### "Authentication failed"
- Verify your API Key and API Secret are correct
- Make sure the redirect URL in Kite Connect matches exactly: `https://your-project-name.pages.dev/callback.html`

### "Session expired"
- Access tokens expire after one day
- Simply logout and login again

### Holdings not showing
- Make sure you have holdings in your Zerodha account
- Check browser console for errors
- Verify your access token is valid (try logging out and in again)

## Important Notes

⚠️ **Security Warnings:**
- NEVER commit your API Secret to Git
- NEVER share your API Secret publicly
- Always use environment variables for sensitive data
- Access tokens expire daily for security

⚠️ **Rate Limits:**
- Zerodha API has rate limits (typically 3 requests/second)
- Don't refresh holdings too frequently

⚠️ **Data Privacy:**
- This app stores access tokens in your browser's localStorage
- Clear your browser data to remove stored tokens
- Access tokens can only read data, not place trades

## License

MIT License - Feel free to use and modify as needed

## Support

For Zerodha API issues, visit: [https://kite.trade/forum](https://kite.trade/forum)

For Cloudflare Pages issues, visit: [https://community.cloudflare.com](https://community.cloudflare.com)

---

**Disclaimer**: This is an unofficial app and is not affiliated with Zerodha. Use at your own risk. Always verify your holdings through the official Zerodha app or website.
