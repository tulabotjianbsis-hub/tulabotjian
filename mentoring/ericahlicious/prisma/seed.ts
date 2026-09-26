// prisma/seed.ts
// Seeds the Aiven MySQL database with initial data for Ericahlicious
// Run: npx ts-node prisma/seed.ts

import { PrismaClient, Role, UserStatus, MenuItemStatus, StockStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ── Clean existing data (order matters for FK constraints) ──────────────────
  await db.inventoryLog.deleteMany();
  await db.menuItemIngredient.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.menuItem.deleteMany();
  await db.menuCategory.deleteMany();
  await db.ingredient.deleteMany();
  await db.inventoryCategory.deleteMany();
  await db.dailyReport.deleteMany();
  await db.user.deleteMany();

  console.log("✓ Cleared existing data");

  // ── Users ───────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password", 12);

  const owner = await db.user.create({
    data: {
      name: "Ericah Rivera Calayag",
      email: "owner@test.com",
      password: hashedPassword,
      role: Role.OWNER,
      status: UserStatus.ACTIVE,
      lastActive: new Date("2026-03-15"),
    },
  });

  const admin = await db.user.create({
    data: {
      name: "Ana Reyes",
      email: "manager@test.com",
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      lastActive: new Date("2026-03-15"),
    },
  });

  const supervisor = await db.user.create({
    data: {
      name: "Maria Santos",
      email: "supervisor@test.com",
      password: hashedPassword,
      role: Role.SUPERVISOR,
      status: UserStatus.ACTIVE,
      lastActive: new Date("2026-03-15"),
    },
  });

  await db.user.create({
    data: {
      name: "Juan Cruz",
      email: "cashier@test.com",
      password: hashedPassword,
      role: Role.SUPERVISOR,
      status: UserStatus.ACTIVE,
      lastActive: new Date("2026-03-15"),
    },
  });

  await db.user.create({
    data: {
      name: "Samantha Santos",
      email: "samantha@test.com",
      password: hashedPassword,
      role: Role.SUPERVISOR,
      status: UserStatus.ACTIVE,
      lastActive: new Date("2026-03-14"),
    },
  });

  console.log("✓ Users seeded");

  // ── Inventory Categories ─────────────────────────────────────────────────────
  const [catPasta, catDairy, catSyrups, catPowders, catBaking, catSweeteners, catMeat] =
    await Promise.all([
      db.inventoryCategory.create({ data: { name: "Pasta" } }),
      db.inventoryCategory.create({ data: { name: "Dairy" } }),
      db.inventoryCategory.create({ data: { name: "Syrups" } }),
      db.inventoryCategory.create({ data: { name: "Powders" } }),
      db.inventoryCategory.create({ data: { name: "Baking" } }),
      db.inventoryCategory.create({ data: { name: "Sweeteners" } }),
      db.inventoryCategory.create({ data: { name: "Meat" } }),
    ]);

  console.log("✓ Inventory categories seeded");

  // ── Ingredients ──────────────────────────────────────────────────────────────
  const pasta = await db.ingredient.create({
    data: {
      name: "Pasta (Spaghetti/Noodles)",
      categoryId: catPasta.id,
      stock: 10,
      unit: "kg",
      supplier: "Bean Masters PH",
      expiryDate: new Date("2027-03-24"),
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  const freshMilk = await db.ingredient.create({
    data: {
      name: "Fresh Milk",
      categoryId: catDairy.id,
      stock: 8,
      unit: "L",
      supplier: "Fresh Farm Dairy",
      expiryDate: new Date("2026-12-28"),
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  const espressoBeansIng = await db.ingredient.create({
    data: {
      name: "Espresso Beans",
      categoryId: catPowders.id,
      stock: 2.5,
      unit: "kg",
      supplier: "Bean Bros Coffee",
      expiryDate: new Date("2027-06-01"),
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  const caramelSyrup = await db.ingredient.create({
    data: {
      name: "Caramel Syrup",
      categoryId: catSyrups.id,
      stock: 0.2,
      unit: "L",
      supplier: "Syrup City PH",
      expiryDate: new Date("2026-08-10"),
      status: StockStatus.CRITICAL,
      updatedById: supervisor.id,
    },
  });

  const chocolatePowder = await db.ingredient.create({
    data: {
      name: "Chocolate Powder",
      categoryId: catPowders.id,
      stock: 0,
      unit: "kg",
      supplier: "Choco Depot",
      expiryDate: new Date("2027-12-01"),
      status: StockStatus.CRITICAL,
      updatedById: supervisor.id,
    },
  });

  const garlic = await db.ingredient.create({
    data: {
      name: "Garlic",
      categoryId: catBaking.id,
      stock: 5,
      unit: "kg",
      supplier: "Local Market",
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  const butter = await db.ingredient.create({
    data: {
      name: "Butter",
      categoryId: catDairy.id,
      stock: 4,
      unit: "kg",
      supplier: "Gold Butter Co.",
      expiryDate: new Date("2026-02-15"),
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  const eggs = await db.ingredient.create({
    data: {
      name: "Eggs",
      categoryId: catBaking.id,
      stock: 1.5,
      unit: "dozen",
      supplier: "FarmFresh Eggs",
      expiryDate: new Date("2026-12-05"),
      status: StockStatus.LOW,
      updatedById: supervisor.id,
    },
  });

  const matchaPowder = await db.ingredient.create({
    data: {
      name: "Matcha Powder",
      categoryId: catPowders.id,
      stock: 3,
      unit: "kg",
      supplier: "Matcha World",
      expiryDate: new Date("2027-09-20"),
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  const flour = await db.ingredient.create({
    data: {
      name: "All-Purpose Flour",
      categoryId: catBaking.id,
      stock: 5,
      unit: "kg",
      supplier: "Gold Medal PH",
      expiryDate: new Date("2027-12-31"),
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  const cheese = await db.ingredient.create({
    data: {
      name: "Cheese (Eden/Quick Melt)",
      categoryId: catDairy.id,
      stock: 3,
      unit: "kg",
      supplier: "Anchor Dairy",
      expiryDate: new Date("2026-03-10"),
      status: StockStatus.LOW,
      updatedById: supervisor.id,
    },
  });

  const chickenBreast = await db.ingredient.create({
    data: {
      name: "Chicken Breast",
      categoryId: catMeat.id,
      stock: 2,
      unit: "kg",
      supplier: "Meat House PH",
      expiryDate: new Date("2026-09-30"),
      status: StockStatus.LOW,
      updatedById: supervisor.id,
    },
  });

  await db.ingredient.create({
    data: {
      name: "Sugar",
      categoryId: catSweeteners.id,
      stock: 6,
      unit: "kg",
      supplier: "Sweet Supply Co.",
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  await db.ingredient.create({
    data: {
      name: "Strawberry Syrup",
      categoryId: catSyrups.id,
      stock: 1.5,
      unit: "L",
      supplier: "Syrup City PH",
      expiryDate: new Date("2027-09-01"),
      status: StockStatus.GOOD,
      updatedById: admin.id,
    },
  });

  console.log("✓ Ingredients seeded");

  // ── Menu Categories ──────────────────────────────────────────────────────────
  const [mcPasta, mcRice, mcSnacks, mcCakes, mcCoffee, mcSweet] = await Promise.all([
    db.menuCategory.create({ data: { name: "Pasta" } }),
    db.menuCategory.create({ data: { name: "Rice Meals" } }),
    db.menuCategory.create({ data: { name: "Pica-Pica / Snacks" } }),
    db.menuCategory.create({ data: { name: "Cakes" } }),
    db.menuCategory.create({ data: { name: "Coffee / Iced Drinks" } }),
    db.menuCategory.create({ data: { name: "Sweet Drinks" } }),
  ]);

  console.log("✓ Menu categories seeded");

  // ── Menu Items ───────────────────────────────────────────────────────────────
  const alfredoPasta = await db.menuItem.create({
    data: {
      name: "Chicken Alfredo Pasta",
      description: "Pasta with Alfredo sauce and tender chicken breast",
      price: 315,
      categoryId: mcPasta.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [
          { ingredientId: pasta.id, quantity: 100, unit: "g" },
          { ingredientId: chickenBreast.id, quantity: 150, unit: "g" },
          { ingredientId: garlic.id, quantity: 10, unit: "g" },
          { ingredientId: freshMilk.id, quantity: 80, unit: "ml" },
          { ingredientId: cheese.id, quantity: 50, unit: "g" },
          { ingredientId: butter.id, quantity: 20, unit: "g" },
        ],
      },
    },
  });

  const americano = await db.menuItem.create({
    data: {
      name: "Flavored Americano",
      description: "Rich espresso with your choice of flavored syrup",
      price: 165,
      promoPrice: 140,
      categoryId: mcCoffee.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [
          { ingredientId: espressoBeansIng.id, quantity: 18, unit: "g" },
          { ingredientId: caramelSyrup.id, quantity: 30, unit: "ml" },
        ],
      },
    },
  });

  const danggit = await db.menuItem.create({
    data: {
      name: "Filipino Breakfast Danggit",
      description: "Dried fish (danggit) with garlic rice and fried egg",
      price: 220,
      categoryId: mcRice.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [
          { ingredientId: eggs.id, quantity: 2, unit: "pcs" },
          { ingredientId: garlic.id, quantity: 15, unit: "g" },
        ],
      },
    },
  });

  await db.menuItem.create({
    data: {
      name: "Matcha Latte",
      description: "Premium matcha powder with steamed oat or fresh milk",
      price: 185,
      categoryId: mcCoffee.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [
          { ingredientId: matchaPowder.id, quantity: 8, unit: "g" },
          { ingredientId: freshMilk.id, quantity: 150, unit: "ml" },
        ],
      },
    },
  });

  await db.menuItem.create({
    data: {
      name: "Cheesecake Slice",
      description: "Creamy New York style cheesecake with graham crust",
      price: 145,
      categoryId: mcCakes.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [
          { ingredientId: cheese.id, quantity: 80, unit: "g" },
          { ingredientId: flour.id, quantity: 50, unit: "g" },
          { ingredientId: freshMilk.id, quantity: 60, unit: "ml" },
        ],
      },
    },
  });

  await db.menuItem.create({
    data: {
      name: "Nachos with Cheese Dip",
      description: "Crispy tortilla chips with warm cheese sauce and jalapeños",
      price: 95,
      categoryId: mcSnacks.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [{ ingredientId: cheese.id, quantity: 60, unit: "g" }],
      },
    },
  });

  const javaChip = await db.menuItem.create({
    data: {
      name: "Chocolate Java Chip Frappe",
      description: "Blended iced chocolate with espresso and java chips",
      price: 195,
      categoryId: mcSweet.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [
          { ingredientId: chocolatePowder.id, quantity: 30, unit: "g" },
          { ingredientId: espressoBeansIng.id, quantity: 14, unit: "g" },
          { ingredientId: freshMilk.id, quantity: 120, unit: "ml" },
        ],
      },
    },
  });

  const sansRival = await db.menuItem.create({
    data: {
      name: "Sans Rival Cake",
      description: "Classic Filipino buttercream meringue layered cake",
      price: 180,
      categoryId: mcCakes.id,
      status: MenuItemStatus.ACTIVE,
      ingredients: {
        create: [
          { ingredientId: eggs.id, quantity: 4, unit: "pcs" },
          { ingredientId: butter.id, quantity: 50, unit: "g" },
        ],
      },
    },
  });

  console.log("✓ Menu items seeded");

  // ── Sample Orders ────────────────────────────────────────────────────────────
  await db.order.create({
    data: {
      tableNumber: "2",
      status: "COMPLETED",
      source: "CUSTOMER_QR",
      totalAmount: 630,
      processedById: supervisor.id,
      items: {
        create: [{ menuItemId: alfredoPasta.id, quantity: 2, unitPrice: 315, subtotal: 630 }],
      },
    },
  });

  await db.order.create({
    data: {
      tableNumber: "4",
      status: "PREPARING",
      source: "CUSTOMER_QR",
      totalAmount: 575,
      items: {
        create: [
          { menuItemId: sansRival.id, quantity: 1, unitPrice: 180, subtotal: 180 },
          { menuItemId: javaChip.id, quantity: 2, unitPrice: 195, subtotal: 390 },
          { menuItemId: americano.id, quantity: 0, unitPrice: 165, subtotal: 0 },
        ],
      },
    },
  });

  await db.order.create({
    data: {
      tableNumber: "1",
      status: "PENDING",
      source: "CUSTOMER_QR",
      totalAmount: 220,
      items: {
        create: [{ menuItemId: danggit.id, quantity: 1, unitPrice: 220, subtotal: 220 }],
      },
    },
  });

  await db.order.create({
    data: {
      tableNumber: "5",
      status: "COMPLETED",
      source: "CUSTOMER_QR",
      totalAmount: 315,
      processedById: supervisor.id,
      items: {
        create: [{ menuItemId: alfredoPasta.id, quantity: 1, unitPrice: 315, subtotal: 315 }],
      },
    },
  });

  console.log("✓ Orders seeded");

  // ── Daily Reports ────────────────────────────────────────────────────────────
  await db.dailyReport.createMany({
    data: [
      { date: new Date("2026-03-13"), totalRevenue: 3350, totalExpenses: 1200, netProfit: 2150, totalOrders: 11 },
      { date: new Date("2026-03-14"), totalRevenue: 3100, totalExpenses: 1150, netProfit: 1950, totalOrders: 10 },
      { date: new Date("2026-03-15"), totalRevenue: 1815, totalExpenses: 345, netProfit: 1470, totalOrders: 12 },
    ],
  });

  console.log("✓ Daily reports seeded");
  console.log("\n✅ Seed complete!\n");
  console.log("Login credentials (all use password: 'password'):");
  console.log("  Owner:      owner@test.com");
  console.log("  Admin:      manager@test.com");
  console.log("  Supervisor: supervisor@test.com");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
