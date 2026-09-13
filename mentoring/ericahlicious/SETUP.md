# System Blueprint - Local Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Git

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Generate a NEXTAUTH_SECRET
# (The example already has a placeholder, but for production, generate one with:)
# openssl rand -base64 32
```

The `.env.local` should contain:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-strong-random-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database and Seed Data

```bash
# Create the database and run migrations
npx prisma migrate dev

# Seed the database with test data (when prompted, name the migration "init")
npx prisma db seed
```

This will:
- Create a local SQLite database (`dev.db`)
- Create all required tables
- Populate with 20 ingredients, 15 menu items, and sample test data
- Create 3 test user accounts

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Accounts

Use any of these to log in:

| Role | Email | Password |
|------|-------|----------|
| Supervisor | supervisor@test.com | password |
| Manager | manager@test.com | password |
| Owner | owner@test.com | password |

Each role has a different dashboard view:
- **Supervisor**: Operations focused (inventory alerts, kitchen display, pending orders)
- **Manager**: Analytics focused (sales, profitability, recommendations)
- **Owner**: Executive focused (KPIs, revenue, performance trends)

---

## Database

The system uses **SQLite** by default for local development (stored in `dev.db`).

To switch to MySQL for production:
1. Update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "mysql"`
2. Update `.env`: set `DATABASE_URL="mysql://user:password@host:port/database"`
3. Run `npx prisma migrate deploy`

---

## Key Features

### Authentication
- Email + password login
- Role-based access control (Supervisor, Manager, Owner)
- Different dashboards per role

### Menu Management
- View, create, edit, delete menu items
- Link ingredients to recipes
- Track recipe costs and profitability

### Inventory Management
- Track ingredient stock levels
- Record adjustments (receiving, usage, waste)
- Auto-calculate ingredient status (GOOD, LOW, CRITICAL, EXPIRED)
- Full audit trail of all changes

### Order Processing
- Create orders with multiple items
- Track order status (PENDING → PREPARING → READY → COMPLETED)
- Kitchen display system (KDS)
- Automatic inventory deduction on order creation
- Restore inventory if order is cancelled

### Dashboards
- **Supervisor Dashboard**: Inventory alerts, pending orders, quick actions
- **Manager Dashboard**: Daily summary, best sellers, inventory efficiency, profitability
- **Owner Dashboard**: KPIs, revenue, inventory value, performance metrics

---

## Useful Commands

```bash
# Start development server
npm run dev

# Run database migrations
npx prisma migrate dev

# Seed database with test data
npx prisma db seed

# View database in Prisma Studio
npx prisma studio

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Folder Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin routes
│   │   ├── dashboard/     # Role-specific dashboards
│   │   ├── menu/          # Menu management
│   │   ├── ingredients/   # Inventory management
│   │   ├── orders/        # Order management
│   │   └── kitchen/       # Kitchen display
│   ├── login/             # Authentication
│   └── page.tsx           # Root redirect
├── lib/
│   ├── actions/           # Server actions for business logic
│   │   ├── auth.ts        # Authentication
│   │   ├── menu.ts        # Menu operations
│   │   ├── inventory.ts   # Inventory operations
│   │   └── orders.ts      # Order operations
│   ├── db.ts              # Prisma client singleton
│   ├── utils.ts           # Utilities
│   └── constants.ts       # Role definitions
├── components/
│   └── ui/                # Shadcn UI components
└── middleware.ts          # NextAuth middleware

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Database seeding script
```

---

## Troubleshooting

### "Database is locked" error
SQLite may have locking issues. Try:
```bash
rm dev.db*
npx prisma migrate dev
npx prisma db seed
```

### "Cannot find module" errors
Ensure all dependencies are installed:
```bash
rm -rf node_modules
npm install
```

### Login not working
- Verify test users exist: `npx prisma studio` → Users table
- Check that `.env.local` has correct `NEXTAUTH_SECRET`
- Clear browser cookies and try again

### Dashboard not loading
- Check browser console for errors
- Verify user role in database: `npx prisma studio`
- Try logging out and back in

---

## Next Steps

1. Log in with `supervisor@test.com / password`
2. Explore the Supervisor Dashboard
3. Create a new menu item
4. Record an inventory adjustment
5. Create a test order
6. Switch roles and explore other dashboards

---

## Architecture Notes

- **Server Actions**: Business logic runs server-side with `"use server"`
- **Type Safety**: Full TypeScript + Prisma type generation
- **Styling**: Tailwind CSS with Shadcn UI components
- **Forms**: React Hook Form + Zod validation
- **Auth**: NextAuth.js v5 with credentials provider

---

For questions or issues, check the project documentation or reach out to the team.
