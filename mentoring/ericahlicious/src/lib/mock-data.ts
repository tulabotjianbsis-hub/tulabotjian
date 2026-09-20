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

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  {
    id: "menu-1", name: "Caramel Macchiato", description: "Espresso with caramel and steamed milk",
    price: 185, category: "Coffee", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-2", name: "Matcha Latte", description: "Premium matcha with steamed oat milk",
    price: 195, category: "Coffee", imageUrl: null, isArchived: false, promoPrice: 175,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-3", name: "Classic Americano", description: "Rich espresso diluted with hot water",
    price: 150, category: "Coffee", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-4", name: "Cheesecake Slice", description: "Creamy New York style cheesecake",
    price: 145, category: "Pastry", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-5", name: "Croissant", description: "Buttery flaky French croissant",
    price: 95, category: "Pastry", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-6", name: "Blueberry Muffin", description: "Freshly baked with real blueberries",
    price: 85, category: "Pastry", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-7", name: "Iced Brown Sugar Latte", description: "Cold espresso with brown sugar syrup",
    price: 200, category: "Cold Drinks", imageUrl: null, isArchived: false, promoPrice: 180,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-8", name: "Mango Smoothie", description: "Fresh mango blended with milk",
    price: 165, category: "Cold Drinks", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-9", name: "Club Sandwich", description: "Triple-decker with chicken, bacon, and veggies",
    price: 275, category: "Food", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
  {
    id: "menu-10", name: "Avocado Toast", description: "Sourdough with smashed avocado and poached egg",
    price: 245, category: "Food", imageUrl: null, isArchived: false, promoPrice: null,
    createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"),
    ingredients: [],
  },
];

export const MOCK_INGREDIENTS: MockIngredient[] = [
  { id: "ing-1", name: "Espresso Beans", category: "Coffee", stock: 2.5, unit: "kg", supplier: "Bean Bros", expiryDate: new Date("2025-06-01"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-2", name: "Whole Milk", category: "Dairy", stock: 8, unit: "L", supplier: "Fresh Farm", expiryDate: new Date("2024-12-28"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-3", name: "Oat Milk", category: "Dairy", stock: 0.8, unit: "L", supplier: "OatCo", expiryDate: new Date("2025-03-10"), status: "LOW", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-4", name: "Caramel Syrup", category: "Syrup", stock: 0.2, unit: "L", supplier: "Monin", expiryDate: new Date("2025-12-01"), status: "CRITICAL", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-5", name: "Matcha Powder", category: "Powder", stock: 0.5, unit: "kg", supplier: "Kyoto Tea", expiryDate: new Date("2025-08-15"), status: "LOW", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-6", name: "All-Purpose Flour", category: "Baking", stock: 12, unit: "kg", supplier: "Golden Grain", expiryDate: new Date("2025-04-01"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-7", name: "Butter", category: "Dairy", stock: 3, unit: "kg", supplier: "Fresh Farm", expiryDate: new Date("2024-12-30"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-8", name: "Brown Sugar", category: "Sweetener", stock: 5, unit: "kg", supplier: "Sweet Co", expiryDate: null, status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-9", name: "Blueberries", category: "Fruit", stock: 0.3, unit: "kg", supplier: "Berry Farm", expiryDate: new Date("2024-12-24"), status: "CRITICAL", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-10", name: "Cream Cheese", category: "Dairy", stock: 1.5, unit: "kg", supplier: "Dairy Best", expiryDate: new Date("2025-01-15"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-11", name: "Avocado", category: "Produce", stock: 6, unit: "pcs", supplier: "Local Market", expiryDate: new Date("2024-12-23"), status: "GOOD", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
  { id: "ing-12", name: "Chicken Breast", category: "Protein", stock: 2, unit: "kg", supplier: "Meat House", expiryDate: new Date("2024-12-22"), status: "LOW", updatedById: null, updatedAt: new Date(), updatedBy: null, menuItems: [], logs: [], alerts: [] },
];

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "order-1", orderNumber: 1001, type: "DINE_IN", status: "COMPLETED",
    totalAmount: 380, tableNumber: 3, specialInstructions: null, qrToken: null,
    processedById: null, createdAt: new Date(), updatedAt: new Date(),
    processedBy: null,
    items: [
      { id: "oi-1", orderId: "order-1", menuItemId: "menu-1", quantity: 2, unitPrice: 185, variation: null, specialInstructions: null, menuItem: { name: "Caramel Macchiato" } },
      { id: "oi-2", orderId: "order-1", menuItemId: "menu-5", quantity: 1, unitPrice: 95, variation: null, specialInstructions: null, menuItem: { name: "Croissant" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-2", orderNumber: 1002, type: "TAKE_OUT", status: "PREPARING",
    totalAmount: 245, tableNumber: null, specialInstructions: "Extra hot please",
    qrToken: null, processedById: null, createdAt: new Date(), updatedAt: new Date(),
    processedBy: null,
    items: [
      { id: "oi-3", orderId: "order-2", menuItemId: "menu-7", quantity: 1, unitPrice: 200, variation: null, specialInstructions: null, menuItem: { name: "Iced Brown Sugar Latte" } },
      { id: "oi-4", orderId: "order-2", menuItemId: "menu-6", quantity: 1, unitPrice: 85, variation: null, specialInstructions: null, menuItem: { name: "Blueberry Muffin" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-3", orderNumber: 1003, type: "DINE_IN", status: "PENDING",
    totalAmount: 520, tableNumber: 7, specialInstructions: null,
    qrToken: null, processedById: null, createdAt: new Date(), updatedAt: new Date(),
    processedBy: null,
    items: [
      { id: "oi-5", orderId: "order-3", menuItemId: "menu-9", quantity: 1, unitPrice: 275, variation: null, specialInstructions: null, menuItem: { name: "Club Sandwich" } },
      { id: "oi-6", orderId: "order-3", menuItemId: "menu-2", quantity: 1, unitPrice: 195, variation: null, specialInstructions: null, menuItem: { name: "Matcha Latte" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-4", orderNumber: 1004, type: "DINE_IN", status: "COMPLETED",
    totalAmount: 490, tableNumber: 1, specialInstructions: null,
    qrToken: null, processedById: null, createdAt: new Date(), updatedAt: new Date(),
    processedBy: null,
    items: [
      { id: "oi-7", orderId: "order-4", menuItemId: "menu-10", quantity: 1, unitPrice: 245, variation: null, specialInstructions: null, menuItem: { name: "Avocado Toast" } },
      { id: "oi-8", orderId: "order-4", menuItemId: "menu-1", quantity: 1, unitPrice: 185, variation: null, specialInstructions: null, menuItem: { name: "Caramel Macchiato" } },
    ],
    transaction: null, alerts: [],
  },
  {
    id: "order-5", orderNumber: 1005, type: "TAKE_OUT", status: "READY",
    totalAmount: 290, tableNumber: null, specialInstructions: null,
    qrToken: null, processedById: null, createdAt: new Date(), updatedAt: new Date(),
    processedBy: null,
    items: [
      { id: "oi-9", orderId: "order-5", menuItemId: "menu-3", quantity: 1, unitPrice: 150, variation: null, specialInstructions: null, menuItem: { name: "Classic Americano" } },
      { id: "oi-10", orderId: "order-5", menuItemId: "menu-4", quantity: 1, unitPrice: 145, variation: null, specialInstructions: null, menuItem: { name: "Cheesecake Slice" } },
    ],
    transaction: null, alerts: [],
  },
];

export const MOCK_ALERTS: MockAlert[] = [
  { id: "alert-1", type: "CRITICAL_STOCK", title: "Caramel Syrup critically low", description: "Only 0.2L remaining — reorder immediately.", severity: "critical", ingredientId: "ing-4", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Caramel Syrup" }, order: null },
  { id: "alert-2", type: "LOW_STOCK", title: "Oat Milk running low", description: "Stock at 0.8L — below safe threshold.", severity: "warning", ingredientId: "ing-3", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Oat Milk" }, order: null },
  { id: "alert-3", type: "CRITICAL_STOCK", title: "Blueberries critically low", description: "Only 0.3kg left — expiry soon.", severity: "critical", ingredientId: "ing-9", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Blueberries" }, order: null },
  { id: "alert-4", type: "LOW_STOCK", title: "Matcha Powder low", description: "0.5kg remaining — reorder soon.", severity: "warning", ingredientId: "ing-5", orderId: null, dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: { name: "Matcha Powder" }, order: null },
  { id: "alert-5", type: "ORDER_OVERDUE", title: "Order #1003 pending too long", description: "Table 7 order has been pending for over 10 minutes.", severity: "warning", ingredientId: null, orderId: "order-3", dismissed: false, dismissedAt: null, dismissedBy: null, createdAt: new Date(), ingredient: null, order: { orderNumber: 1003 } },
];

export const MOCK_INVENTORY_CATEGORIES = ["Coffee", "Dairy", "Syrup", "Powder", "Baking", "Sweetener", "Fruit", "Produce", "Protein"];
export const MOCK_MENU_CATEGORIES = ["Coffee", "Cold Drinks", "Pastry", "Food"];

export const MOCK_DAILY_ORDER_STATS = {
  total: MOCK_ORDERS.length,
  pending: MOCK_ORDERS.filter((o) => o.status === "PENDING").length,
  preparing: MOCK_ORDERS.filter((o) => o.status === "PREPARING").length,
  ready: MOCK_ORDERS.filter((o) => o.status === "READY").length,
  completed: MOCK_ORDERS.filter((o) => o.status === "COMPLETED").length,
  cancelled: MOCK_ORDERS.filter((o) => o.status === "CANCELLED").length,
  totalAmount: MOCK_ORDERS.filter((o) => o.status === "COMPLETED").reduce((sum, o) => sum + o.totalAmount, 0),
};

export const MOCK_ANALYTICS = {
  salesByDay: [
    { date: "2024-12-16", total: 3200, orders: 14 },
    { date: "2024-12-17", total: 4100, orders: 18 },
    { date: "2024-12-18", total: 2900, orders: 11 },
    { date: "2024-12-19", total: 5200, orders: 22 },
    { date: "2024-12-20", total: 4800, orders: 20 },
    { date: "2024-12-21", total: 6100, orders: 26 },
    { date: "2024-12-22", total: 3500, orders: 15 },
  ],
  topItems: [
    { name: "Caramel Macchiato", quantity: 45, revenue: 8325 },
    { name: "Iced Brown Sugar Latte", quantity: 38, revenue: 7600 },
    { name: "Matcha Latte", quantity: 31, revenue: 6045 },
    { name: "Club Sandwich", quantity: 22, revenue: 6050 },
    { name: "Cheesecake Slice", quantity: 28, revenue: 4060 },
  ],
  profitByCategory: [
    { category: "Coffee", totalRevenue: 28500, totalCost: 8200, totalProfit: 20300, count: 142 },
    { category: "Cold Drinks", totalRevenue: 14200, totalCost: 4100, totalProfit: 10100, count: 78 },
    { category: "Pastry", totalRevenue: 9800, totalCost: 3200, totalProfit: 6600, count: 98 },
    { category: "Food", totalRevenue: 12400, totalCost: 5100, totalProfit: 7300, count: 44 },
  ],
};

export const MOCK_RECOMMENDATIONS = [
  {
    type: "REORDER",
    severity: "critical",
    title: "Reorder Caramel Syrup Immediately",
    description: "Stock critically low at 0.2L. Based on daily usage of 0.15L, you have ~1 day of supply left.",
    data: { ingredient: "Caramel Syrup", currentStock: 0.2, dailyUsage: 0.15, daysLeft: 1 },
  },
  {
    type: "REORDER",
    severity: "warning",
    title: "Reorder Oat Milk Soon",
    description: "Oat Milk is at 0.8L. At current usage rate, stock will run out in ~3 days.",
    data: { ingredient: "Oat Milk", currentStock: 0.8, dailyUsage: 0.25, daysLeft: 3 },
  },
  {
    type: "MENU_OPTIMIZATION",
    severity: "info",
    title: "Promote Iced Brown Sugar Latte",
    description: "This item has 87% profit margin and high sales velocity. Consider featuring it prominently.",
    data: { item: "Iced Brown Sugar Latte", margin: 87, rank: 2 },
  },
  {
    type: "WASTE_ALERT",
    severity: "warning",
    title: "Blueberries Expiring Soon",
    description: "0.3kg of Blueberries expire in 2 days. Consider running a special or using them in bulk prep.",
    data: { ingredient: "Blueberries", stock: 0.3, expiresIn: 2 },
  },
];

export const MOCK_INVENTORY_LOGS: MockInventoryLog[] = [
  { id: "log-1", ingredientId: "ing-1", type: "RECEIVE", quantityChanged: 5, reason: "Weekly restock", previousStock: 2.5, newStock: 7.5, recordedById: null, createdAt: new Date("2024-12-20"), recordedBy: { name: "Supervisor" } },
  { id: "log-2", ingredientId: "ing-4", type: "CONSUME", quantityChanged: -0.3, reason: "Daily production", previousStock: 0.5, newStock: 0.2, recordedById: null, createdAt: new Date("2024-12-21"), recordedBy: { name: "Supervisor" } },
  { id: "log-3", ingredientId: "ing-3", type: "CONSUME", quantityChanged: -0.2, reason: "Morning orders", previousStock: 1.0, newStock: 0.8, recordedById: null, createdAt: new Date("2024-12-22"), recordedBy: { name: "Supervisor" } },
];
