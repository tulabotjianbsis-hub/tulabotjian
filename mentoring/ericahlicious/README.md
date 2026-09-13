# System Blueprint - Restaurant Management & Ordering System

A complete, modern restaurant management system built with Next.js, React, TypeScript, and Prisma. Full-featured MVP ready to run locally.

![Status: MVP Ready](https://img.shields.io/badge/Status-MVP%20Ready-success)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### Core Functionality
- ✅ **Role-Based Access Control** - Supervisor, Manager, Owner with distinct dashboards
- ✅ **Menu Management** - Full CRUD for menu items with categories and pricing
- ✅ **Inventory System** - Complete stock tracking with status indicators (GOOD/LOW/CRITICAL/EXPIRED)
- ✅ **Order Processing** - Multi-item orders, dine-in/takeout, status workflow (PENDING→PREPARING→READY→COMPLETED)
- ✅ **Kitchen Display System** - Real-time KDS with auto-refresh for kitchen staff
- ✅ **Recipe Management** - Link ingredients to menu items, automatic cost/profitability calculations

### Decision Support
- 📊 **Real-Time Dashboards** - Role-specific dashboards with live data and KPIs
- 🔔 **Smart Alerts** - Automatic alerts for low stock, expiry dates, overdue orders
- 📈 **Analytics & Reporting** - Sales trends, inventory waste, profitability by category
- 💡 **Recommendations Engine** - Data-driven suggestions for reordering, waste reduction, menu optimization

### Operational Features
- 🏪 **Inventory Adjustments** - Track RECEIVE, CONSUME, WASTE, and manual ADJUSTMENT transactions
- 📋 **Audit Trail** - Complete logging of inventory changes with user attribution
- 🧮 **Cost Tracking** - Per-menu-item recipe costing and margin calculations
- 🔐 **Authentication** - Secure login with role-based permissions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Create database & schema
npx prisma migrate dev

# 4. Seed with test data
npx prisma db seed

# 5. Start development server
npm run dev
```

Open http://localhost:3000 and login with:
- **Email:** supervisor@test.com
- **Password:** password

See [QUICKSTART.md](./QUICKSTART.md) for details.

## 📋 Test Accounts

| Role | Email | Password | Focus |
|------|-------|----------|-------|
| Supervisor | supervisor@test.com | password | Operations & Kitchen |
| Manager | manager@test.com | password | Analytics & Reporting |
| Owner | owner@test.com | password | Executive Overview |

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (admin)/                 # Admin dashboard routes
│   │   ├── dashboard/          # Role-based dashboards
│   │   ├── menu/               # Menu management
│   │   ├── ingredients/        # Inventory management
│   │   ├── orders/             # Order processing
│   │   ├── kitchen/            # Kitchen display system
│   │   ├── analytics/          # Reports & analytics
│   │   ├── alerts/             # Alert management
│   │   └── recommendations/    # Recommendations engine
│   ├── login/                  # Authentication UI
│   └── api/auth/              # NextAuth API routes
├── components/
│   ├── ui/                     # Shadcn UI components
│   ├── menu/                   # Menu-related components
│   ├── orders/                 # Order-related components
│   └── inventory/              # Inventory-related components
├── lib/
│   ├── actions/               # Server actions (business logic)
│   │   ├── auth.ts           # Authentication
│   │   ├── menu.ts           # Menu operations
│   │   ├── inventory.ts      # Inventory operations
│   │   ├── orders.ts         # Order operations
│   │   ├── alerts.ts         # Alert management
│   │   └── analytics.ts      # Analytics & reporting
│   ├── db.ts                 # Prisma client
│   ├── constants.ts          # App constants
│   └── utils.ts              # Utilities
└── middleware.ts             # NextAuth middleware

prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Test data seeding
```

## 🗄️ Database Schema

### Core Models
- **User** - Staff accounts with roles (Supervisor, Manager, Owner)
- **MenuItem** - Menu items with pricing and promotions
- **Ingredient** - Inventory items with stock tracking
- **MenuItemIngredient** - Recipe linking (what ingredients go in which dishes)
- **Order** - Customer orders with status workflow
- **OrderItem** - Individual items within orders
- **InventoryLog** - Audit trail of all stock changes
- **Alert** - System alerts for operational issues

## 🎯 Key Workflows

### Create & Manage Menu
1. Go to Menu section
2. Click "+ New Item"
3. Fill in name, price, category, description
4. Click on menu item to manage recipe (link ingredients)
5. System auto-calculates recipe cost and profit margin

### Process an Order
1. Go to Orders section
2. Click "+ New Order"
3. Select items and quantities
4. Specify dine-in table or takeout
5. Submit - inventory is automatically deducted
6. Kitchen staff views order in Kitchen Display System
7. Update status: PENDING → PREPARING → READY → COMPLETED

### Track Inventory
1. Go to Inventory section
2. View all ingredients with status indicators
3. Click "Record Adjustment" on any item
4. Choose type (RECEIVE/CONSUME/WASTE/ADJUSTMENT)
5. Enter quantity and optional reason
6. System maintains complete audit trail

### View Analytics
1. Go to Analytics section
2. Select date range
3. View Sales, Inventory, or Profitability reports
4. Export to CSV if needed

### Check Alerts & Recommendations
1. Go to Alerts to dismiss operational issues
2. Go to Recommendations to see reorder/optimization suggestions
3. System auto-generates based on:
   - Stock levels & consumption trends
   - Waste tracking
   - Sales performance

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"     # SQLite for local dev

# Authentication
NEXTAUTH_SECRET="your-secret"    # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### Customization
- **Menu Categories**: Add/edit in the menu form
- **Ingredient Categories**: Add/edit in the inventory form
- **Stock Thresholds**: Edit in `/src/lib/actions/inventory.ts`
- **Alert Rules**: Edit in `/src/lib/actions/alerts.ts`
- **Recommendation Thresholds**: Edit in `/src/lib/actions/analytics.ts`

## 📦 Dependencies

### Core
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Prisma 8** - ORM

### UI & Forms
- **Tailwind CSS 4** - Styling
- **Shadcn UI** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Auth & Database
- **NextAuth.js v5** - Authentication
- **SQLite** - Local database (PostgreSQL/MySQL compatible)
- **bcryptjs** - Password hashing

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Switch Database to PostgreSQL
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Set `DATABASE_URL` in production environment

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## 📊 Data Seeding

The project includes comprehensive seed data:
- 3 test users (Supervisor, Manager, Owner)
- 15 menu items across 5 categories
- 20 ingredients with realistic stock levels
- Menu-to-ingredient recipe mappings
- 8+ sample orders in various statuses
- Sample inventory adjustments
- Sample alerts for demonstration

To re-seed:
```bash
npx prisma db seed
```

## 🧪 Testing

Features are verified through:
1. **Functional Testing** - Each feature workflow tested end-to-end
2. **Data Integrity** - Inventory deduction/restoration on orders
3. **Permission Checks** - Role-based access verified
4. **Calculation Accuracy** - Profit margins and totals verified

To run the development server and manually test:
```bash
npm run dev
```

## 🛠️ Development

### Project Setup
```bash
npm install
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Create database
npx prisma db seed     # Add test data
npm run dev            # Start dev server
```

### Adding a New Feature
1. Add/modify database schema in `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create migration
3. Create server actions in `/src/lib/actions/`
4. Build UI components in `/src/components/` or pages in `/src/app/`
5. Test in development

### Code Style
- TypeScript for type safety
- Server-side business logic in `/src/lib/actions/`
- React Hook Form for complex forms
- Tailwind CSS for styling
- Shadcn UI for consistent components

## 📝 API Documentation

All features are accessed through Next.js server actions. See `/src/lib/actions/` for:
- `auth.ts` - Authentication
- `menu.ts` - Menu operations
- `inventory.ts` - Stock management
- `orders.ts` - Order processing
- `alerts.ts` - Alert system
- `analytics.ts` - Reporting & recommendations

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md) for detailed troubleshooting guide.

Common issues:
- **"Database is locked"** → Delete `dev.db*` and reseed
- **Port 3000 in use** → Change PORT in `.env.local`
- **Styles broken** → Wait for Tailwind to compile or restart dev server
- **Build errors** → Clear `.next/` and reinstall: `rm -rf .next && npm run build`

## 📄 License

MIT

## 🤝 Contributing

This is a foundation system. Feel free to:
- Add more features
- Improve UI/UX
- Optimize performance
- Add integrations (payments, email, etc.)
- Deploy and customize for your needs

## 📞 Support

For setup help, see:
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute quick start
- [SETUP.md](./SETUP.md) - Detailed setup & troubleshooting

---

**Built with ❤️ using Next.js, React, and TypeScript**
