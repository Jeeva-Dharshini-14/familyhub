# FamilyHub - Your Family's Smart OS

A comprehensive family management platform built with React, TypeScript, and modern web technologies.

## 🚀 Demo Credentials

Try FamilyHub with these demo accounts:

- **Owner**: `owner@example.test` / `demo123`
- **Adult**: `adult@example.test` / `demo123`
- **Teen**: `teen@example.test` / `demo123`

## ✨ Features

### Core Modules

- **📊 Finance Management**: Track expenses, manage budgets, monitor wallets
- **✅ Tasks & Rewards**: Assign chores, earn points, redeem rewards
- **❤️ Health Tracking**: Medical records, vitals logging, health timeline
- **🍳 Kitchen & Meals**: Meal planning and pantry inventory
- **📄 Document Vault**: Secure family document storage
- **📅 Calendar**: Unified family schedule
- **⚙️ Settings**: Family and member management
- **👤 Profile**: Personal information and permissions

### Key Capabilities

- **Role-Based Access Control**: Owner, Adult, Teen, Child, and Guest roles
- **Real-time Updates**: Instant synchronization across modules
- **Local Persistence**: Data stored in browser localStorage
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode**: Full theme support
- **Simulated Backend**: Mock API with realistic delays

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query
- **Routing**: React Router v6
- **Theme**: next-themes
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd familyhub

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the app.

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layout/      # Layout components (Header, Sidebar)
│   └── ui/          # shadcn/ui components
├── pages/           # Page components
│   ├── auth/        # Login & Register
│   ├── dashboard/   # Main dashboard
│   ├── finance/     # Finance module
│   ├── tasks/       # Tasks & Rewards
│   ├── health/      # Health tracking
│   └── ...
├── lib/             # Utilities and helpers
│   ├── mockApi.ts   # Mock backend API
│   ├── auth.ts      # Authentication utilities
│   └── utils.ts     # Helper functions
├── types/           # TypeScript type definitions
└── App.tsx          # Main app component
```

## 🎨 Design System

FamilyHub uses a warm, family-friendly color palette:

- **Primary**: Blue (#3b9ff3) - Trust and stability
- **Secondary**: Orange (#f97316) - Warmth and energy
- **Accent**: Green (#10b981) - Growth and health
- **Success**: Green - Positive actions
- **Warning**: Orange - Alerts

All colors are defined using HSL in `src/index.css` and can be customized easily.

## 🔐 Authentication & Roles

### Role Hierarchy

1. **Owner**: Full access to all features, can manage family settings
2. **Adult**: Access to finance, health, tasks, documents
3. **Teen**: Limited access, can use tasks, health, and meals
4. **Child**: Basic access to tasks and meals
5. **Guest**: View-only access to meals and trips

### Permissions Matrix

| Feature | Owner | Adult | Teen | Child | Guest |
|---------|-------|-------|------|-------|-------|
| Finance | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Health | ✅ | ✅ | ✅ | ❌ | ❌ |
| Documents | ✅ | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🧪 Mock API

The app uses a mock API (`src/lib/mockApi.ts`) that simulates a real backend:

- **localStorage Persistence**: Data survives page reloads
- **Simulated Delays**: 300ms delay for realistic UX
- **Error Simulation**: Random 5% error rate
- **Seeded Demo Data**: Pre-populated family with members

### Switching to Real Backend

To connect a real backend:

1. Replace `mockApi` calls with real API endpoints
2. Add environment variables for API URL
3. Implement proper JWT token handling
4. Update `authUtils` for server-side sessions

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly interactions

## 🎯 Future Enhancements

Based on the original specification, planned features include:

- **AI Assistant**: Weekly summaries and smart recommendations
- **Trip Planner**: Itineraries, packing lists, budgets
- **Wishlist**: Price tracking and shopping integration
- **Memories**: Photo albums with face tagging
- **Advanced Finance**: EMI tracking, govt schemes, budget planner
- **Education**: Homework manager, exam timetables, study timer
- **Notifications**: Email/push notifications with quiet hours
- **Family Tree**: Interactive visualization
- **Export Features**: PDF reports, CSV exports, iCal sync

## 🤝 Contributing

This is an MVP demonstrating core features. To extend:

1. Add new routes in `src/App.tsx`
2. Create page components in `src/pages/`
3. Add API methods in `src/lib/mockApi.ts`
4. Define types in `src/types/index.ts`
5. Follow the existing design system

## 📄 License

This project is built as a demonstration of modern React development practices.

## 🆘 Support

For questions or issues, please refer to the code comments and TypeScript types. The codebase is extensively documented.

---

**Built with ❤️ for families**
