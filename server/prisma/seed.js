
const { PrismaClient, ReadingSlot } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "demo@sweety.test";
  const password = "StrongPass123";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Sweety Demo User",
      passwordHash,
    },
    create: {
      name: "Sweety Demo User",
      email,
      passwordHash,
    },
  });

  const today = new Date();
  const date = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const readings = [
    { slot: ReadingSlot.MORNING, value: 110 },
    { slot: ReadingSlot.AFTER_BREAKFAST, value: 145 },
    { slot: ReadingSlot.AFTER_LUNCH, value: 160 },
    { slot: ReadingSlot.AFTER_DINNER, value: 130 },
  ];

  for (const reading of readings) {
    await prisma.reading.upsert({
      where: {
        userId_date_slot: {
          userId: user.id,
          date,
          slot: reading.slot,
        },
      },
      update: { value: reading.value },
      create: {
        userId: user.id,
        date,
        slot: reading.slot,
        value: reading.value,
      },
    });
  }

  console.log("Demo user and readings seeded successfully.");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
