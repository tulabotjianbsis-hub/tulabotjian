# System Blueprint - Quick Start (5 Minutes)

## TL;DR - Get Running in 5 Steps

### 1. Install & Setup
```bash
npm install
cp .env.example .env.local
```

### 2. Create Database
```bash
npx prisma migrate dev
```
When prompted for a migration name, type: `init`

### 3. Seed Data
```bash
npx prisma db seed
```

### 4. Start Dev Server
```bash
npm run dev
```

### 5. Login & Explore
Open http://localhost:3000 in your browser

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Supervisor | supervisor@test.com | password |
| Manager | manager@test.com | password |
| Owner | owner@test.com | password |

## What Each Role Can Do

### 👨‍🍳 Supervisor Dashboard
- View live inventory status (LOW/CRITICAL/EXPIRED items)
- See active orders (Pending, Preparing, Ready)
- Create new orders
- Record inventory adjustments
- Access Kitchen Display System

### 📊 Manager Dashboard
- Today's sales summary
- Best-selling items
- Inventory efficiency (waste ratios)
- Profitability by category
- Access analytics reports

### 👑 Owner Dashboard
- Key business metrics (revenue, order count, avg order value)
- Top menu items (last 7 days)
- Inventory value
- Performance trends
- Full system access

## Key Features to Try

1. **Create Menu Item** → Go to Menu, click "+ New Item", add "Test Espresso" ($3.99)
2. **Add Ingredients to Recipe** → Click on menu item, add ingredients, see profit margin
3. **Create Order** → Click "+ New Order", select items, submit
4. **Kitchen Display** → View in Kitchen tab, mark items PREPARING then READY
5. **Record Adjustment** → Inventory tab, click "Record Adjustment" on any item
6. **View Analytics** → Analytics tab, filter by date, see sales breakdown
7. **Check Alerts** → Alerts tab, view active inventory & order alerts
8. **Get Recommendations** → Recommendations tab, see reorder & optimization suggestions

## Troubleshooting

### "Database is locked" error
```bash
rm dev.db*
npx prisma migrate dev
npx prisma db seed
```

### Port 3000 already in use
Edit `.env.local`:
```
# Add this line
PORT=3001
```

### Module not found errors
```bash
npm install
rm -rf node_modules
npm install
```

### Styles look broken
The app uses Tailwind CSS which should auto-build. If not:
```bash
npm run dev
# Wait 10 seconds for Tailwind to compile
```

## File Structure Reference

```
src/
├── app/(admin)/              # Admin routes
│   ├── dashboard/           # Role-specific dashboards
│   ├── menu/                # Menu CRUD
│   ├── ingredients/         # Inventory CRUD
│   ├── orders/              # Order management
│   ├── kitchen/             # Kitchen display system
│   ├── analytics/           # Reports & analytics
│   ├── alerts/              # Alert management
│   └── recommendations/     # AI-free suggestions
├── components/              # React components
├── lib/actions/            # Server actions (business logic)
└── login/                  # Authentication

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Test data
```

## Next Steps

- **Customize**: Edit menu items, ingredients, or business logic in `/src/lib/actions/`
- **Extend**: Add more features like customer accounts or payment processing
- **Deploy**: Follow Next.js deployment guides (Vercel, AWS, etc.)
- **Learn**: Check `/src/lib/actions/*.ts` to see how features are implemented

## Need Help?

See `SETUP.md` for detailed setup instructions and troubleshooting.
