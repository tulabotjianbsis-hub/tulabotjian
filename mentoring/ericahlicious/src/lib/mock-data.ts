// =============================================================================
// MOCK DATA - Used while Aiven MySQL is not yet connected
// Replace these with real DB calls when DATABASE_URL is configured
// =============================================================================

export interface MockMenuItem {
  id: string; name: string; description: string | null; price: number;
  category: string; imageUrl: string | null; isArchived: boolean;
  promoPrice: number | null; createdAt: Date; updatedAt: Date;
  ingredients: MockRecipeIngredient[];
}

export interface MockRecipeIngredient {
  id: string; name: string; quantity: number; unit: string; currentStock: number;
}

export interface MockIngredient {
  id: string; name: string; category: string; stock: number; unit: string;
  supplier: string | null; expiryDate: Date | null; status: string;
  updatedById: null; updatedAt: Date; updatedBy: null;
  menuItems: unknown[]; logs: unknown[]; alerts: unknown[];
}

export interface MockOrderItem {
  id: string; orderId: string; menuItemId: string; quantity: number;
  unitPrice: number; variation: string | null; specialInstructions: string | null;
  menuItem: { name: string };
}

export interface MockOrder {
  id: string; orderNumber: number; type: string; status: string;
  totalAmount: number; tableNumber: number | null;
  specialInstructions: string | null; qrToken: null; processedById: null;
  createdAt: Date; updatedAt: Date; processedBy: null;
  items: MockOrderItem[]; transaction: null; alerts: unknown[];
}

export interface MockAlert {
  id: string; type: string; title: string; description: string | null;
  severity: string; ingredientId: string | null; orderId: string | null;
  dismissed: boolean; dismissedAt: Date | null; dismissedBy: string | null;
  createdAt: Date;
  ingredient: { name: string } | null;
  order: { orderNumber: number } | null;
}

export interface MockInventoryLog {
  id: string; ingredientId: string; type: string; quantityChanged: number;
  reason: string | null; previousStock: number; newStock: number;
  recordedById: null; createdAt: Date; recordedBy: { name: string } | null;
}

export interface MockUser {
  id: string; name: string; email: string; role: string; status: string;
  lastActive: Date | null; createdAt: Date;
}

export interface MockDailyReport {
  date: string; totalRevenue: number; totalExpenses: number;
  netProfit: number; totalOrders: number;
}

// ── Menu Categories ──────────────────────────────────────────────────────────
export const MOCK_MENU_CATEGORIES = [
  "Pasta", "Rice Meals", "Pica-Pica / Snacks", "Cakes", "Coffee / Iced Drinks", "Sweet Drinks"
];

// ── Menu Items ───────────────────────────────────────────────────────────────
export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  {
    id: "menu-1", name: "Chicken Alfredo Pasta",
    description: "Pasta with Alfredo sauce and tender chicken breast",
    price: 315, category: "Pasta", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-1", name: "Pasta (Spaghetti/Noodles)", quantity: 100, unit: "g", currentStock: 10 },
      { id: "ing-12", name: "Chicken Breast", quantity: 150, unit: "g", currentStock: 2 },
      { id: "ing-6", name: "Garlic", quantity: 10, unit: "g", currentStock: 5 },
      { id: "ing-2", name: "Fresh Milk", quantity: 80, unit: "ml", currentStock: 8 },
      { id: "ing-11", name: "Cheese (Eden/Quick Melt)", quantity: 50, unit: "g", currentStock: 3 },
      { id: "ing-7", name: "Butter", quantity: 20, unit: "g", currentStock: 4 },
    ],
  },
  {
    id: "menu-2", name: "Flavored Americano",
    description: "Rich espresso with your choice of flavored syrup",
    price: 165, category: "Coffee / Iced Drinks", imageUrl: null, isArchived: false, promoPrice: 140,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-3", name: "Espresso Beans", quantity: 18, unit: "g", currentStock: 2.5 },
      { id: "ing-4", name: "Caramel Syrup", quantity: 30, unit: "ml", currentStock: 0.2 },
    ],
  },
  {
    id: "menu-3", name: "Filipino Breakfast Danggit",
    description: "Dried fish (danggit) with garlic rice and fried egg",
    price: 220, category: "Rice Meals", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-8", name: "Eggs", quantity: 2, unit: "pcs", currentStock: 1.5 },
      { id: "ing-6", name: "Garlic", quantity: 15, unit: "g", currentStock: 5 },
    ],
  },
  {
    id: "menu-4", name: "Matcha Latte",
    description: "Premium matcha powder with steamed oat or fresh milk",
    price: 185, category: "Coffee / Iced Drinks", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-9", name: "Matcha Powder", quantity: 8, unit: "g", currentStock: 3 },
      { id: "ing-2", name: "Fresh Milk", quantity: 150, unit: "ml", currentStock: 8 },
    ],
  },
  {
    id: "menu-5", name: "Cheesecake Slice",
    description: "Creamy New York style cheesecake with graham crust",
    price: 145, category: "Cakes", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-11", name: "Cheese (Eden/Quick Melt)", quantity: 80, unit: "g", currentStock: 3 },
      { id: "ing-10", name: "All-Purpose Flour", quantity: 50, unit: "g", currentStock: 5 },
      { id: "ing-2", name: "Fresh Milk", quantity: 60, unit: "ml", currentStock: 8 },
    ],
  },
  {
    id: "menu-6", name: "Nachos with Cheese Dip",
    description: "Crispy tortilla chips with warm cheese sauce and jalapeños",
    price: 95, category: "Pica-Pica / Snacks", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-11", name: "Cheese (Eden/Quick Melt)", quantity: 60, unit: "g", currentStock: 3 },
    ],
  },
  {
    id: "menu-7", name: "Chocolate Java Chip Frappe",
    description: "Blended iced chocolate with espresso and java chips",
    price: 195, category: "Sweet Drinks", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-5", name: "Chocolate Powder", quantity: 30, unit: "g", currentStock: 0 },
      { id: "ing-3", name: "Espresso Beans", quantity: 14, unit: "g", currentStock: 2.5 },
      { id: "ing-2", name: "Fresh Milk", quantity: 120, unit: "ml", currentStock: 8 },
    ],
  },
  {
    id: "menu-8", name: "Sans Rival Cake",
    description: "Classic Filipino buttercream meringue layered cake",
    price: 180, category: "Cakes", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [
      { id: "ing-8", name: "Eggs", quantity: 4, unit: "pcs", currentStock: 1.5 },
      { id: "ing-7", name: "Butter", quantity: 50, unit: "g", currentStock: 4 },
    ],
  },
];

// ── Inventory Items (Ingredients) ───────────────────────────────────────────
export const MOCK_INVENTORY_CATEGORIES = [
  "Pasta", "Dairy", "Syrups", "Powders", "Baking", "Sweeteners", "Meat"
];

export const MOCK_INGREDIENTS: MockIngredient[] = [
  { id: "ing-1", name: "Pasta (Spaghetti/Noodles)", category: "Pasta", stock: 10, unit: "kg", supplier: "Bean Masters PH", expiryDate: new Date("2027-03-24"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-2", name: "Fresh Milk", category: "Dairy", stock: 8, unit: "L", supplier: "Fresh Farm Dairy", expiryDate: new Date("2024-12-28"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-3", name: "Espresso Beans", category: "Powders", stock: 2.5, unit: "kg", supplier: "Bean Bros Coffee", expiryDate: new Date("2025-06-01"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-4", name: "Caramel Syrup", category: "Syrups", stock: 0.2, unit: "L", supplier: "Syrup City PH", expiryDate: new Date("2025-08-10"), status: "CRITICAL", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-5", name: "Chocolate Powder", category: "Powders", stock: 0, unit: "kg", supplier: "Choco Depot", expiryDate: new Date("2025-12-01"), status: "CRITICAL", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-6", name: "Garlic", category: "Baking", stock: 5, unit: "kg", supplier: "Local Market", expiryDate: null, status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-7", name: "Butter", category: "Dairy", stock: 4, unit: "kg", supplier: "Gold Butter Co.", expiryDate: new Date("2025-02-15"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-8", name: "Eggs", category: "Baking", stock: 1.5, unit: "dozen", supplier: "FarmFresh Eggs", expiryDate: new Date("2025-01-05"), status: "LOW", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-9", name: "Matcha Powder", category: "Powders", stock: 3, unit: "kg", supplier: "Matcha World", expiryDate: new Date("2025-09-20"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-10", name: "All-Purpose Flour", category: "Baking", stock: 5, unit: "kg", supplier: "Gold Medal PH", expiryDate: new Date("2025-12-31"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-11", name: "Cheese (Eden/Quick Melt)", category: "Dairy", stock: 3, unit: "kg", supplier: "Anchor Dairy", expiryDate: new Date("2025-03-10"), status: "LOW", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-12", name: "Chicken Breast", category: "Meat", stock: 2, unit: "kg", supplier: "Meat House PH", expiryDate: new Date("2024-12-22"), status: "LOW", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-13", name: "Sugar", category: "Sweeteners", stock: 6, unit: "kg", supplier: "Sweet Supply Co.", expiryDate: null, status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-14", name: "Strawberry Syrup", category: "Syrups", stock: 1.5, unit: "L", supplier: "Syrup City PH", expiryDate: new Date("2025-09-01"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
];

// ── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS: MockUser[] = [
  { id: "user-1", name: "Ericah Rivera Calayag", email: "owner@test.com", role: "OWNER", status: "ACTIVE", lastActive: new Date("2026-03-15"), createdAt: new Date("2024-01-01") },
  { id: "user-2", name: "Ana Reyes", email: "manager@test.com", role: "ADMIN", status: "ACTIVE", lastActive: new Date("2026-03-15"), createdAt: new Date("2024-02-01") },
  { id: "user-3", name: "Maria Santos", email: "supervisor@test.com", role: "SUPERVISOR", status: "ACTIVE", lastActive: new Date("2026-03-15"), createdAt: new Date("2024-02-15") },
  { id: "user-4", name: "Juan Cruz", email: "cashier@test.com", role: "SUPERVISOR", status: "ACTIVE", lastActive: new Date("2026-03-15"), createdAt: new Date("2024-03-01") },
  { id: "user-5", name: "Samantha Santos", email: "samantha@test.com", role: "SUPERVISOR", status: "ACTIVE", lastActive: new Date("2026-03-14"), createdAt: new Date("2024-03-10") },
];

// ── Mock Orders ──────────────────────────────────────────────────────────────
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "order-1", orderNumber: 1001, type: "DINE_IN", status: "COMPLETED",
    totalAmount: 630, tableNumber: 2, specialInstructions: null, qrToken: null,
    processedById: null, createdAt: new Date(Date.now() - 2 * 60000), updatedAt: new Date(), processedBy: null,
    items: [
      { id: "oi-1", orderId: "order-1", menuItemId: "menu-1", quantity: 2, unitPrice: 315, variation: null, specialInstructions: null, menuItem: { name: "Chicken Alfredo Pasta" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-2", orderNumber: 1002, type: "DINE_IN", status: "PREPARING",
    totalAmount: 575, tableNumber: 4, specialInstructions: null, qrToken: null,
    processedById: null, createdAt: new Date(Date.now() - 4 * 60000), updatedAt: new Date(), processedBy: null,
    items: [
      { id: "oi-2", orderId: "order-2", menuItemId: "menu-8", quantity: 1, unitPrice: 180, variation: null, specialInstructions: null, menuItem: { name: "Sans Rival Cake" } },
      { id: "oi-3", orderId: "order-2", menuItemId: "menu-7", quantity: 2, unitPrice: 195, variation: null, specialInstructions: null, menuItem: { name: "Chocolate Java Chip Frappe" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-3", orderNumber: 1003, type: "DINE_IN", status: "PENDING",
    totalAmount: 220, tableNumber: 1, specialInstructions: null, qrToken: null,
    processedById: null, createdAt: new Date(Date.now() - 2 * 60000), updatedAt: new Date(), processedBy: null,
    items: [
      { id: "oi-4", orderId: "order-3", menuItemId: "menu-2", quantity: 1, unitPrice: 165, variation: null, specialInstructions: null, menuItem: { name: "Flavored Americano" } },
      { id: "oi-5", orderId: "order-3", menuItemId: "menu-6", quantity: 1, unitPrice: 95, variation: null, specialInstructions: null, menuItem: { name: "Nachos with Cheese Dip" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-4", orderNumber: 1004, type: "DINE_IN", status: "PREPARING",
    totalAmount: 500, tableNumber: 5, specialInstructions: null, qrToken: null,
    processedById: null, createdAt: new Date(Date.now() - 6 * 60000), updatedAt: new Date(), processedBy: null,
    items: [
      { id: "oi-6", orderId: "order-4", menuItemId: "menu-3", quantity: 2, unitPrice: 220, variation: null, specialInstructions: null, menuItem: { name: "Filipino Breakfast Danggit" } },
      { id: "oi-7", orderId: "order-4", menuItemId: "menu-4", quantity: 1, unitPrice: 185, variation: null, specialInstructions: null, menuItem: { name: "Matcha Latte" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-5", orderNumber: 1005, type: "DINE_IN", status: "COMPLETED",
    totalAmount: 315, tableNumber: 6, specialInstructions: null, qrToken: null,
    processedById: null, createdAt: new Date(Date.now() - 15 * 60000), updatedAt: new Date(), processedBy: null,
    items: [
      { id: "oi-8", orderId: "order-5", menuItemId: "menu-1", quantity: 1, unitPrice: 315, variation: null, specialInstructions: null, menuItem: { name: "Chicken Alfredo Pasta" } },
    ],
    transaction: null, alerts: [],
  },
];

// ── Daily Stats ──────────────────────────────────────────────────────────────
export const MOCK_DAILY_ORDER_STATS = {
  total: 12, completed: 8, pending: 2, preparing: 2, ready: 0, cancelled: 0,
  totalAmount: 4425,
};

// ── Alerts ───────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: MockAlert[] = [
  { id: "alert-1", type: "CRITICAL_STOCK", title: "Caramel Syrup critically low", description: "Only 0.2L remaining — reorder immediately.", severity: "critical", ingredientId: "ing-4", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Caramel Syrup" }, order: null },
  { id: "alert-2", type: "CRITICAL_STOCK", title: "Chocolate Powder out of stock", description: "Stock at 0 kg — no production possible.", severity: "critical", ingredientId: "ing-5", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Chocolate Powder" }, order: null },
  { id: "alert-3", type: "LOW_STOCK", title: "Eggs running low", description: "Only 1.5 dozen remaining.", severity: "warning", ingredientId: "ing-8", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Eggs" }, order: null },
  { id: "alert-4", type: "LOW_STOCK", title: "Chicken Breast low", description: "Only 2kg left — check usage.", severity: "warning", ingredientId: "ing-12", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Chicken Breast" }, order: null },
];

// ── Inventory Logs ───────────────────────────────────────────────────────────
export const MOCK_INVENTORY_LOGS: MockInventoryLog[] = [
  { id: "log-1", ingredientId: "ing-1", type: "RECEIVE", quantityChanged: 5, reason: "Weekly restock", previousStock: 5, newStock: 10, recordedById: null, createdAt: new Date("2024-12-20"), recordedBy: { name: "Ana Reyes" } },
  { id: "log-2", ingredientId: "ing-4", type: "CONSUME", quantityChanged: 0.3, reason: "Daily production", previousStock: 0.5, newStock: 0.2, recordedById: null, createdAt: new Date("2024-12-21"), recordedBy: { name: "Maria Santos" } },
  { id: "log-3", ingredientId: "ing-2", type: "RECEIVE", quantityChanged: 10, reason: "Morning delivery", previousStock: 3, newStock: 13, recordedById: null, createdAt: new Date("2024-12-22"), recordedBy: { name: "Maria Santos" } },
];

// ── Analytics / Reports ──────────────────────────────────────────────────────
export const MOCK_ANALYTICS = {
  salesByDay: [
    { date: "03-13", total: 3350, expenses: 1200, orders: 11 },
    { date: "03-14", total: 3100, expenses: 1150, orders: 10 },
    { date: "03-15", total: 1815, expenses: 345, orders: 12 },
  ],
  topItems: [
    { name: "Chicken Alfredo Pasta", quantity: 24, revenue: 7560 },
    { name: "Flavored Americano", quantity: 18, revenue: 2970 },
    { name: "Filipino Breakfast Danggit", quantity: 10, revenue: 2200 },
    { name: "Matcha Latte", quantity: 8, revenue: 1480 },
    { name: "Cheesecake Slice", quantity: 7, revenue: 1015 },
  ],
  profitByCategory: [
    { category: "Pasta", totalRevenue: 9450, totalCost: 2800, totalProfit: 6650, count: 30 },
    { category: "Coffee / Iced Drinks", totalRevenue: 4950, totalCost: 900, totalProfit: 4050, count: 30 },
    { category: "Rice Meals", totalRevenue: 3300, totalCost: 1200, totalProfit: 2100, count: 15 },
    { category: "Cakes", totalRevenue: 2900, totalCost: 1100, totalProfit: 1800, count: 18 },
  ],
  profitTrend: [
    { date: "03-13", profit: 8200 },
    { date: "03-14", profit: 7600 },
    { date: "03-15", profit: 6200 },
  ],
};

export const MOCK_RECOMMENDATIONS = [
  { type: "REORDER", severity: "critical", title: "Restock Fresh Milk", description: "Restock 7,000ml Fresh Milk. Estimated to run out in 2 days.", data: { name: "Fresh Milk" } },
  { type: "WASTE_ALERT", severity: "warning", title: "High Eggs Usage", description: "Eggs usage up 30% this week. Monitor consumption closely.", data: { name: "Eggs" } },
  { type: "MENU_OPTIMIZATION", severity: "warning", title: "Fast-Moving Items", description: "Chicken Alfredo Pasta is the most popular item. Ensure adequate stock.", data: { name: "Chicken Alfredo Pasta" } },
  { type: "REORDER", severity: "critical", title: "Stock Prediction", description: "Fresh Milk expected to deplete in 2 days based on current usage.", data: { name: "Fresh Milk" } },
];
