import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const db = prisma;

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.inventoryLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemIngredient.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Cleared existing data");

  // Seed Users
  const hashedPassword = await bcrypt.hash("password", 10);

  const supervisor = await prisma.user.create({
    data: {
      name: "John Supervisor",
      email: "supervisor@test.com",
      password: hashedPassword,
      role: "SUPERVISOR",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Jane Manager",
      email: "manager@test.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Bob Owner",
      email: "owner@test.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  console.log("✓ Created test users");

  // Seed Ingredients
  await prisma.ingredient.createMany({
    data: [
      // Beverages
      {
        name: "Espresso Beans",
        category: "Beverages",
        stock: 15,
        unit: "kg",
        supplier: "Green Mountain Coffee",
        status: "GOOD" as string,
        updatedById: supervisor.id,
      },
      {
        name: "Whole Milk",
        category: "Beverages",
        stock: 20,
        unit: "L",
        supplier: "Local Dairy",
        status: "GOOD",
        updatedById: supervisor.id,
      },
      {
        name: "Almond Milk",
        category: "Beverages",
        stock: 8,
        unit: "L",
        supplier: "Plant & Root",
        status: "LOW",
        updatedById: supervisor.id,
      },
      {
        name: "Chocolate Syrup",
        category: "Beverages",
        stock: 5,
        unit: "L",
        supplier: "Torani",
        status: "LOW",
        updatedById: supervisor.id,
      },
      {
        name: "Vanilla Syrup",
        category: "Beverages",
        stock: 3,
        unit: "L",
        supplier: "Torani",
        status: "CRITICAL",
        updatedById: supervisor.id,
      },

      // Bakery
      {
        name: "All-Purpose Flour",
        category: "Bakery",
        stock: 50,
        unit: "kg",
        supplier: "Gold Medal",
        status: "GOOD",
        updatedById: supervisor.id,
      },
      {
        name: "Butter",
        category: "Bakery",
        stock: 12,
        unit: "kg",
        supplier: "Land O'Lakes",
        status: "GOOD",
        updatedById: supervisor.id,
      },
      {
        name: "Eggs",
        category: "Bakery",
        stock: 144,
        unit: "pieces",
        supplier: "Local Farm",
        status: "GOOD",
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        updatedById: supervisor.id,
      },
      {
        name: "Sugar",
        category: "Bakery",
        stock: 30,
        unit: "kg",
        supplier: "Domino",
        status: "GOOD",
        updatedById: supervisor.id,
      },
      {
        name: "Baking Powder",
        category: "Bakery",
        stock: 2,
        unit: "kg",
        supplier: "Rumford",
        status: "CRITICAL",
        updatedById: supervisor.id,
      },

      // Pasta
      {
        name: "Pasta Noodles",
        category: "Pasta",
        stock: 25,
        unit: "kg",
        supplier: "Barilla",
        status: "GOOD",
        updatedById: supervisor.id,
      },
      {
        name: "Tomato Sauce",
        category: "Pasta",
        stock: 15,
        unit: "L",
        supplier: "San Marzano",
        status: "GOOD",
        updatedById: supervisor.id,
      },
      {
        name: "Parmesan Cheese",
        category: "Pasta",
        stock: 8,
        unit: "kg",
        supplier: "Stella",
        status: "GOOD",
        updatedById: supervisor.id,
      },
      {
        name: "Olive Oil",
        category: "Pasta",
        stock: 10,
        unit: "L",
        supplier: "Extra Virgin Co.",
        status: "GOOD",
        updatedById: supervisor.id,
      },

      // Proteins
      {
        name: "Chicken Breast",
        category: "Proteins",
        stock: 20,
        unit: "kg",
        supplier: "Fresh Farms",
        status: "GOOD",
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        updatedById: supervisor.id,
      },
      {
        name: "Ground Beef",
        category: "Proteins",
        stock: 15,
        unit: "kg",
        supplier: "Fresh Farms",
        status: "GOOD",
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        updatedById: supervisor.id,
      },
      {
        name: "Bacon",
        category: "Proteins",
        stock: 5,
        unit: "kg",
        supplier: "Smithfield",
        status: "LOW",
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        updatedById: supervisor.id,
      },

      // Produce
      {
        name: "Tomatoes",
        category: "Produce",
        stock: 30,
        unit: "kg",
        supplier: "Local Farm",
        status: "GOOD",
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        updatedById: supervisor.id,
      },
      {
        name: "Lettuce",
        category: "Produce",
        stock: 20,
        unit: "kg",
        supplier: "Local Farm",
        status: "GOOD",
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        updatedById: supervisor.id,
      },
      {
        name: "Onions",
        category: "Produce",
        stock: 40,
        unit: "kg",
        supplier: "Local Farm",
        status: "GOOD",
        updatedById: supervisor.id,
      },
    ],
  });

  const ingredients = await prisma.ingredient.findMany();
  console.log(`✓ Created ${ingredients.length} ingredients`);

  // Get ingredients for recipe creation
  const allIngredients = await prisma.ingredient.findMany();
  const ingredientMap = Object.fromEntries(
    allIngredients.map((ing) => [ing.name, ing])
  );

  // Seed Menu Items
  await prisma.menuItem.createMany({
    data: [
      // Coffee Drinks
      {
        name: "Espresso",
        description: "Classic single shot of espresso",
        price: 3.5,
        category: "Coffee",
        imageUrl: null,
      },
      {
        name: "Cappuccino",
        description: "Espresso with steamed milk and foam",
        price: 4.5,
        category: "Coffee",
        imageUrl: null,
      },
      {
        name: "Latte",
        description: "Espresso with steamed milk",
        price: 4.75,
        category: "Coffee",
        imageUrl: null,
      },
      {
        name: "Americano",
        description: "Espresso shots with hot water",
        price: 3.75,
        category: "Coffee",
        imageUrl: null,
      },
      {
        name: "Mocha",
        description: "Espresso, milk, and chocolate",
        price: 5.0,
        category: "Coffee",
        imageUrl: null,
        promoPrice: 4.5,
      },

      // Pastries
      {
        name: "Croissant",
        description: "Buttery flaky pastry",
        price: 3.5,
        category: "Pastry",
        imageUrl: null,
      },
      {
        name: "Chocolate Croissant",
        description: "Croissant with chocolate filling",
        price: 4.0,
        category: "Pastry",
        imageUrl: null,
      },
      {
        name: "Muffin",
        description: "Blueberry muffin",
        price: 3.0,
        category: "Pastry",
        imageUrl: null,
      },

      // Pasta
      {
        name: "Spaghetti Carbonara",
        description: "Classic Italian pasta with egg and cheese",
        price: 12.5,
        category: "Pasta",
        imageUrl: null,
      },
      {
        name: "Penne Arrabbiata",
        description: "Pasta with spicy tomato sauce",
        price: 11.0,
        category: "Pasta",
        imageUrl: null,
      },
      {
        name: "Fettuccine Alfredo",
        description: "Creamy pasta with parmesan",
        price: 13.0,
        category: "Pasta",
        imageUrl: null,
      },

      // Main Courses
      {
        name: "Grilled Chicken Breast",
        description: "Seasoned and grilled chicken",
        price: 15.0,
        category: "Mains",
        imageUrl: null,
      },
      {
        name: "Beef Burger",
        description: "Juicy beef burger with toppings",
        price: 14.0,
        category: "Mains",
        imageUrl: null,
      },
    ],
  });

  const menuItems = await prisma.menuItem.findMany();
  console.log(`✓ Created ${menuItems.length} menu items`);

  // Link Menu Items to Ingredients (Recipes)
  const recipes = [
    { menuItem: "Cappuccino", ingredients: [{ name: "Espresso Beans", qty: 0.018 }, { name: "Whole Milk", qty: 0.25 }] },
    { menuItem: "Latte", ingredients: [{ name: "Espresso Beans", qty: 0.018 }, { name: "Whole Milk", qty: 0.35 }] },
    { menuItem: "Mocha", ingredients: [{ name: "Espresso Beans", qty: 0.018 }, { name: "Whole Milk", qty: 0.25 }, { name: "Chocolate Syrup", qty: 0.03 }] },
    { menuItem: "Spaghetti Carbonara", ingredients: [{ name: "Pasta Noodles", qty: 0.3 }, { name: "Eggs", qty: 2 }, { name: "Parmesan Cheese", qty: 0.05 }] },
    { menuItem: "Grilled Chicken Breast", ingredients: [{ name: "Chicken Breast", qty: 0.2 }] },
    { menuItem: "Beef Burger", ingredients: [{ name: "Ground Beef", qty: 0.2 }] },
  ];

  for (const recipe of recipes) {
    const menuItem = await prisma.menuItem.findFirst({
      where: { name: recipe.menuItem },
    });

    if (menuItem) {
      for (const ing of recipe.ingredients) {
        const ingredient = ingredientMap[ing.name];
        if (ingredient) {
          await prisma.menuItemIngredient.create({
            data: {
              menuItemId: menuItem.id,
              ingredientId: ingredient.id,
              quantity: ing.qty,
              unit: ingredient.unit,
            },
          });
        }
      }
    }
  }

  console.log("✓ Linked ingredients to menu items");

  // Seed sample orders with various statuses
  const allMenuItems = await prisma.menuItem.findMany();

  if (allMenuItems.length > 0) {
    const cappuccino = allMenuItems.find((m) => m.name === "Cappuccino");
    const latte = allMenuItems.find((m) => m.name === "Latte");
    const croissant = allMenuItems.find((m) => m.name === "Croissant");
    const chickenAlf = allMenuItems.find((m) => m.name === "Grilled Chicken Breast");

    if (cappuccino && croissant) {
      // Completed orders (for analytics)
      for (let i = 0; i < 5; i++) {
        await prisma.order.create({
          data: {
            type: "DINE_IN",
            status: "COMPLETED",
            totalAmount: cappuccino.price * (i + 1) % 3 + croissant.price,
            orderNumber: 100 + i,
            tableNumber: (i % 5) + 1,
            processedById: supervisor.id,
            items: {
              create: [
                {
                  menuItemId: cappuccino.id,
                  quantity: (i + 1) % 3 || 1,
                  unitPrice: cappuccino.price,
                },
                {
                  menuItemId: croissant.id,
                  quantity: 1,
                  unitPrice: croissant.price,
                },
              ],
            },
          },
        });
      }

      // Take-out completed orders
      for (let i = 0; i < 3; i++) {
        await prisma.order.create({
          data: {
            type: "TAKE_OUT",
            status: "COMPLETED",
            totalAmount: latte?.price || cappuccino.price,
            orderNumber: 200 + i,
            processedById: manager.id,
            items: {
              create: [
                {
                  menuItemId: latte?.id || cappuccino.id,
                  quantity: 1,
                  unitPrice: latte?.price || cappuccino.price,
                },
              ],
            },
          },
        });
      }

      // Current pending/preparing orders
      const pendingOrder = await prisma.order.create({
        data: {
          type: "DINE_IN",
          status: "PENDING",
          totalAmount: cappuccino.price + croissant.price,
          orderNumber: 3,
          tableNumber: 3,
          specialInstructions: "Extra hot, no foam",
          processedById: supervisor.id,
          items: {
            create: [
              {
                menuItemId: cappuccino.id,
                quantity: 1,
                unitPrice: cappuccino.price,
              },
              {
                menuItemId: croissant.id,
                quantity: 1,
                unitPrice: croissant.price,
              },
            ],
          },
        },
      });

      const preparingOrder = await prisma.order.create({
        data: {
          type: "DINE_IN",
          status: "PREPARING",
          totalAmount: chickenAlf?.price || 15,
          orderNumber: 4,
          tableNumber: 7,
          processedById: supervisor.id,
          items: {
            create: [
              {
                menuItemId: chickenAlf?.id || cappuccino.id,
                quantity: 1,
                unitPrice: chickenAlf?.price || cappuccino.price,
              },
            ],
          },
        },
      });

      const readyOrder = await prisma.order.create({
        data: {
          type: "TAKE_OUT",
          status: "READY",
          totalAmount: cappuccino.price * 2,
          orderNumber: 5,
          processedById: supervisor.id,
          items: {
            create: [
              {
                menuItemId: cappuccino.id,
                quantity: 2,
                unitPrice: cappuccino.price,
              },
            ],
          },
        },
      });

      console.log("✓ Created sample orders (completed, pending, preparing, ready)");
    }
  }

  // Create some sample alerts for demonstration
  const allIngredients2 = await db.ingredient.findMany();
  for (const ing of allIngredients2.slice(0, 2)) {
    if (ing.status === "CRITICAL") {
      await db.alert.create({
        data: {
          type: "CRITICAL_STOCK",
          title: `Critical stock: ${ing.name}`,
          description: `${ing.name} is at critical level`,
          severity: "critical",
          ingredientId: ing.id,
        },
      });
    } else if (ing.status === "LOW") {
      await db.alert.create({
        data: {
          type: "LOW_STOCK",
          title: `Low stock: ${ing.name}`,
          description: `${ing.name} stock is low`,
          severity: "warning",
          ingredientId: ing.id,
        },
      });
    }
  }

  console.log("✓ Created sample alerts");

  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📊 Data Summary:");
  const userCount = await db.user.count();
  const menuCount = await db.menuItem.count();
  const ingredientCount = await db.ingredient.count();
  const orderCount = await db.order.count();
  const alertCount = await db.alert.count();
  
  console.log(`  👤 Users: ${userCount}`);
  console.log(`  🍽️ Menu Items: ${menuCount}`);
  console.log(`  📦 Ingredients: ${ingredientCount}`);
  console.log(`  📋 Orders: ${orderCount}`);
  console.log(`  🔔 Alerts: ${alertCount}`);
  console.log("\n🔐 Test Accounts:");
  console.log("  Supervisor: supervisor@test.com / password");
  console.log("  Manager: manager@test.com / password");
  console.log("  Owner: owner@test.com / password");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
