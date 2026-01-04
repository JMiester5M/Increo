# Increo - Smart Financial Tracking App

A modern financial tracking application built with Next.js, featuring expense tracking, goal setting, and AI-powered insights.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 💰 **Expense Tracking** - Categorized expense management
- 🎯 **Goal Setting** - Set and track financial goals
- 📊 **Dashboard** - Overview of income, expenses, and goals
- 📝 **Financial Survey** - Personalized financial profiling
- 👤 **User Profile** - Manage account and preferences

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: Firebase Authentication with Google Sign-in
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Language**: JavaScript/JSX

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon database account (free tier available at [neon.tech](https://neon.tech))
- A Firebase project with Google authentication enabled

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your database connection string

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication:
   - Go to Authentication → Sign-in method
   - Enable Google
4. Get your web app config:
   - Project Settings → General → Your apps
   - Add web app and copy config
5. Get Firebase Admin SDK key:
   - Project Settings → Service Accounts
   - Generate new private key
6. Add all credentials to `.env` (see Step 4)

### 4. Environment Variables

UpFirebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
``
# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`

### 5. Initialize Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
increo/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── goals/            # Goals page
│   ├── spending/         # Expenses page
│   ├── profile/          # Profile page
│   ├── survey/           # Financial survey
│   components/           # React components
├── lib/
│   ├── firebase.js       # Firebase client config
│   ├── firebase-admin.js # Firebase Admin SDK
│   ├── auth-helpers.js   # Auth utilities
│   └── prisma.js         # Prisma client
├── prisma/schema.prisma  # Database schema
└── .env                  # Environment variables
└── middleware.js         # Route protection
```

## Available Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Database GUI

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Update `NEXTAUTH_URL` to production URL
5. Update Google OAuth redirect URI

## License

MIT

