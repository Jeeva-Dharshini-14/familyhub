# FamilyHub - Complete Full-Stack Setup Guide

## 🚀 Overview

This is a complete, persistent full-stack family management application with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Firebase Realtime Database
- **Authentication**: JWT with Firebase Admin SDK
- **Database**: Firebase Realtime Database (fully persistent)

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Firebase Project** with Realtime Database enabled
3. **Firebase Service Account Key** (JSON file)

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Realtime Database** in your Firebase project
3. Go to **Project Settings > Service Accounts**
4. Generate a new private key and download the JSON file
5. Rename it to `firebaseServiceAccount.json` and place it in the `backend/` folder

### 3. Environment Variables
Create `backend/.env` file:
```env
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.region.firebasedatabase.app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:8080
```

### 4. Initialize Database
```bash
cd backend
npm run seed
```

### 5. Start Backend Server
```bash
npm run dev
# or
npm start
```

Backend will run on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd ../  # Go back to root
npm install
```

### 2. Environment Variables
Create `.env` file in root:
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK_API=false
```

### 3. Start Frontend
```bash
npm run dev
```

Frontend will run on `http://localhost:8080`

## 🔐 Authentication Flow

### Registration Process
1. User registers with email, password, name
2. Backend creates:
   - User account with hashed password
   - Family record (user becomes owner)
   - Member record linked to user
   - Default wallet and categories
3. JWT token issued for immediate login

### Login Process
1. User provides email/password
2. Backend verifies credentials
3. JWT token issued with user ID
4. Frontend stores token and user data

## 📊 Database Structure

```
Firebase Realtime Database
├── users/
│   └── {userId}/
│       ├── email, password, name, role
│       ├── familyId, memberId
│       └── createdAt, updatedAt
├── families/
│   └── {familyId}/
│       ├── name, ownerId, avatar
│       ├── members: [memberIds]
│       └── createdAt, updatedAt
├── members/
│   └── {memberId}/
│       ├── familyId, userId, name, role
│       ├── permissions, points
│       └── profile data
├── wallets/
│   └── {walletId}/
│       ├── familyId, name, balance
│       └── currency, isShared
├── categories/
├── expenses/
├── incomes/
├── tasks/
├── rewards/
├── memories/
├── healthRecords/
├── documents/
└── ... (other collections)
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Finance (Protected)
- `GET /api/finance/wallets/:familyId` - Get wallets
- `POST /api/finance/wallets` - Create wallet
- `PUT /api/finance/wallets/:walletId` - Update wallet
- `DELETE /api/finance/wallets/:walletId` - Delete wallet
- `GET /api/finance/expenses/:familyId` - Get expenses
- `POST /api/finance/expenses` - Add expense
- `DELETE /api/finance/expenses/:expenseId` - Delete expense
- `GET /api/finance/incomes/:familyId` - Get incomes
- `POST /api/finance/incomes` - Add income
- `DELETE /api/finance/incomes/:incomeId` - Delete income
- `GET /api/finance/categories/:familyId` - Get categories
- `POST /api/finance/categories` - Add category

### Tasks (Protected)
- `GET /api/tasks/:familyId` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task
- `GET /api/tasks/rewards/:familyId` - Get rewards
- `POST /api/tasks/rewards` - Create reward
- `POST /api/tasks/redeem` - Redeem reward

### Members (Protected)
- `GET /api/members/family/:familyId` - Get family members
- `GET /api/members/:memberId` - Get single member
- `POST /api/members` - Add member
- `PUT /api/members/:memberId` - Update member
- `DELETE /api/members/:memberId` - Delete member
- `GET /api/members/points/:memberId` - Get member points

### Other Modules
- Health: `/api/health/*`
- Documents: `/api/documents/*`
- Memories: `/api/memories/*`
- Calendar: `/api/calendar/*`

## 🔒 Security Features

1. **JWT Authentication**: All protected routes require valid JWT token
2. **Password Hashing**: bcrypt with salt rounds
3. **CORS Protection**: Configured for frontend domain
4. **Input Validation**: Server-side validation
5. **Firebase Security**: Admin SDK with service account

## 🧪 Testing the Application

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 2. Test Registration
1. Go to `http://localhost:8080`
2. Click "Sign up"
3. Register with your email and create a family
4. Verify you're logged in and can access dashboard

### 3. Test Persistence
1. Add some expenses, tasks, or memories
2. Refresh the page
3. Verify all data persists (no data loss)
4. Check Firebase console to see data stored

### 4. Test Different Modules
- **Finance**: Add wallets, expenses, income
- **Tasks**: Create tasks, assign to members, complete them
- **Members**: Add family members with different roles
- **Memories**: Add family memories with photos
- **Health**: Track health records and appointments

## 🐛 Troubleshooting

### Backend Issues
- **Firebase Connection**: Check service account file and database URL
- **Port Conflicts**: Change PORT in .env if 5000 is occupied
- **CORS Errors**: Verify FRONTEND_URL matches your frontend port

### Frontend Issues
- **API Connection**: Check VITE_API_URL points to running backend
- **Authentication**: Clear localStorage if having login issues
- **Build Issues**: Delete node_modules and reinstall

### Database Issues
- **Empty Data**: Run `npm run seed` in backend to initialize structure
- **Permission Errors**: Check Firebase database rules
- **Connection Timeout**: Verify Firebase project settings

## 📈 Key Improvements Over Mock API

### Previous Issues (Mock API)
1. **Data Loss**: All changes lost on page refresh
2. **No Persistence**: Data stored only in localStorage
3. **Limited Capacity**: localStorage size limits
4. **No Real Authentication**: Fake tokens and validation
5. **No Relationships**: Data not properly linked between entities

### Current Solution (Real Backend)
1. **Full Persistence**: All data saved to Firebase Realtime Database
2. **Real Authentication**: JWT tokens with proper validation
3. **Atomic Operations**: Wallet balances update correctly with transactions
4. **Proper Relationships**: Users, families, members properly linked
5. **Scalable**: No storage limits, real-time updates
6. **Secure**: Proper password hashing and token validation
7. **Consistent State**: Data remains consistent across sessions

## 🚀 Production Deployment

### Backend Deployment
1. Deploy to services like Heroku, Railway, or Vercel
2. Set environment variables in production
3. Update CORS settings for production domain

### Frontend Deployment
1. Update VITE_API_URL to production backend URL
2. Build: `npm run build`
3. Deploy dist folder to Netlify, Vercel, or similar

### Firebase Security
1. Configure database security rules
2. Restrict API access to your domains
3. Monitor usage and set up billing alerts

## 📝 Development Notes

- All API calls now go through real backend
- JWT tokens are properly validated
- Database operations are atomic where needed
- Error handling includes proper HTTP status codes
- All CRUD operations are fully functional
- Real-time data synchronization possible with Firebase

The application is now a fully functional, persistent full-stack solution ready for production use.