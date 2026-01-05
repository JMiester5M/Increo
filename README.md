# Increo - Smart Financial Tracking App

A modern financial tracking application built with Next.js, featuring expense tracking, goal setting, AI-powered insights, and staff analytics.

## Features

### User Features
- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 💰 **Expense Tracking** - Categorized expense management with monthly insights
- 🎯 **Goal Setting** - Set and track financial goals with progress visualization
- 🤖 **AI Savings Coach** - Personalized savings recommendations based on:
  - Income and expense analysis
  - Paycheck frequency (weekly, bi-weekly, monthly)
  - Budget constraints (80% safe buffer)
  - Deadline-based monthly targets
  - Category-specific savings opportunities
- 📊 **Dashboard** - Comprehensive overview with:
  - Income, expenses, and goal tracking
  - AI spending alerts for high-spend categories
  - Goal progress visualization
- 💵 **Goal Management** - Add funds or withdraw from goals with real-time updates
- 📝 **Financial Survey** - Personalized financial profiling on first login
- 👤 **User Profile** - Manage account and preferences

### Staff Features
- 🛡️ **Role-Based Access Control** - User, Staff, and Admin roles
- 📈 **Staff Dashboard** - Platform analytics including:
  - Total users
  - Completed goals
  - Active users (past 7 days)
  - Inactive users (past 7 days)
- 👥 **User Management** - View all users with:
  - Role badges
  - Goal counts
  - Join dates
  - Activity status

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: Firebase Authentication with Google Sign-in
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Language**: JavaScript/JSX
- **Fonts**: Space Grotesk, JetBrains Mono

## Security Features

- 🔒 Firebase Admin SDK token verification on all API routes
- 🛡️ Role-based access control (RBAC) for staff features
- 🔐 User data isolation - all queries scoped to authenticated user
- 🚫 Protected routes with automatic redirects
- ✅ Database-level authorization checks

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

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# OpenAI (Optional - for future AI features)
OPENAI_API_KEY=""
```

### 5. Initialize Database

```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 6. Grant Staff Access (Optional)

To grant staff access to a user:

```bash
# Open Prisma Studio
npx prisma studio

# Or use SQL directly
# UPDATE "User" SET role = 'staff' WHERE email = 'user@example.com';
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
│   │   ├── expenses/     # Expense management
│   │   ├── goals/        # Goal operations
│   │   ├── staff/        # Staff-only endpoints
│   │   └── user/         # User data endpoints
│   ├── dashboard/        # Main dashboard + staff pages
│   │   └── staff/        # Staff dashboard & user management
│   ├── goals/            # Goals page
│   │   └── [id]/         # Individual goal detail page
│   ├── spending/         # Expenses page
│   ├── profile/          # Profile page
│   └── survey/           # Financial survey
├── components/           # React components
│   └── AuthProvider.js   # Auth wrapper
├── lib/
│   ├── firebase.js       # Firebase client config
│   ├── firebase-admin.js # Firebase Admin SDK
│   ├── auth-helpers.js   # Auth utilities (token & role verification)
│   ├── useStaffAccess.js # Staff access hook
│   └── prisma.js         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
└── .env                  # Environment variables
```

## Available Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Database GUI
- `npx prisma db push` - Sync schema to database

## Database Schema

### User Model
- **id**: Unique identifier (UUID)
- **uid**: Firebase user ID
- **email**: User email
- **name**: Display name
- **role**: User role (user/staff/admin)
- **createdAt**: Account creation date
- **updatedAt**: Last activity timestamp

### FinancialInfo Model
- Links to User
- Stores income, paycheck frequency, and survey data

### Goal Model
- Links to User
- Tracks title, target amount, current amount, deadline, completion status

### Expense Model
- Links to User
- Tracks category, amount, description, date

## Future Features

### Planned Enhancements
- 🤖 **OpenAI Integration** - GPT-powered financial advice and insights
- 📱 **Mobile App** - React Native mobile application
- 🔔 **Push Notifications** - Goal milestones and spending alerts
- 📧 **Email Reports** - Weekly/monthly financial summaries
- 💱 **Multi-Currency Support** - International currency handling
- 📈 **Advanced Analytics** - Spending trends and forecasting
- 🏦 **Bank Integration** - Automatic transaction import via Plaid
- 👨‍👩‍👧‍👦 **Shared Goals** - Family/group goal tracking
- 🎨 **Customizable Themes** - Dark mode and color schemes
- 📊 **Export Data** - CSV/PDF export functionality
- 🔄 **Recurring Expenses** - Automatic subscription tracking
- 🎯 **Smart Goal Recommendations** - AI-suggested savings goals based on spending patterns
- 📅 **Bill Reminders** - Automatic alerts for upcoming bills
- 💬 **In-App Chat Support** - Real-time user support

### Staff Features Roadmap
- 📊 **Advanced Reporting** - Custom date ranges and filters
- 📈 **Engagement Metrics** - User retention and churn analysis
- 🔍 **User Search** - Filter and search capabilities
- ⚡ **Bulk Actions** - Mass user management operations
- 📝 **Audit Logs** - Track staff actions and changes
- 📧 **Email Broadcasting** - Announcements to users

## Deployment

### Deploy to Vercel:
1. Push your code to GitHub
2. Import project to Vercel
3. Add all environment variables from `.env`
4. Deploy

### Post-Deployment:
1. Update Firebase Authentication:
   - Add Vercel domain to authorized domains
   - Update redirect URIs in Google OAuth settings
2. Test all features:
   - Sign in/Sign out
   - Goal creation and management
   - Expense tracking
   - Staff dashboard access (if applicable)

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

## License

MIT

---

Built with ❤️ using Next.js, Firebase, and Prisma

