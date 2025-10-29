import { db } from "@/db";
import { favorites } from "@/db/schema";

async function main() {
  const now = Date.now();

  const sampleFavorites = [
    {
      userId: "test-user-1",
      itemType: "flight",
      itemId: 1,
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: "test-user-1",
      itemType: "flight",
      itemId: 3,
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: "test-user-1",
      itemType: "hotel",
      itemId: 2,
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: "test-user-1",
      itemType: "hotel",
      itemId: 5,
      createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: "test-user-1",
      itemType: "activity",
      itemId: 1,
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: "test-user-1",
      itemType: "activity",
      itemId: 4,
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: "test-user-1",
      itemType: "bus",
      itemId: 3,
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: "test-user-1",
      itemType: "bus",
      itemId: 5,
      createdAt: new Date(now - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  await db.insert(favorites).values(sampleFavorites);

  console.log("✅ Favorites seeder completed successfully");
}

main().catch((error) => {
  console.error("❌ Seeder failed:", error);
});
