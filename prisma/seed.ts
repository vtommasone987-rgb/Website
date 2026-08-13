import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Seeds the demo inventory that used to live in src/lib/store.ts.
 *
 * This is placeholder data (a camera, a drill, an office chair) for reviewing
 * the UI — swap it for real OPTS inventory before going live. Employees are
 * deliberately NOT seeded: those are real login credentials, so the directory
 * starts empty for whoever sets this up.
 *
 * Safe to re-run: it clears the tables it owns first.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Order matters — children before parents where there's no cascade.
  await prisma.sale.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.customOrder.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetGroup.deleteMany();
  await prisma.purchaseGroup.deleteMany();

  await prisma.assetGroup.createMany({
    data: [{ name: "Recycle" }, { name: "Reserved: Sarah Kim" }],
  });
  await prisma.purchaseGroup.createMany({
    data: [{ name: "IT Supplies" }, { name: "Tools" }],
  });

  await prisma.asset.create({
    data: {
      id: "asset-1",
      assetNumber: 101,
      name: "ThinkPad X1 Carbon Gen 9",
      model: "20XW-CTO1WW",
      serialNumber: "PF3K9J2A",
      priceCents: 89900,
      status: "available",
      description:
        '14" business laptop, i7-1165G7, 16GB RAM, 512GB NVMe SSD. Light wear on the lid, keyboard and screen are excellent.',
      createdAt: new Date("2026-06-02T14:00:00.000Z"),
      group: null,
      location: "Office, Desk 2",
      assignedTo: null,
      parts: {
        create: [
          { name: "Original 65W USB-C charger", serialNumber: "CHG-4471-A" },
          { name: "Extended battery pack", serialNumber: "BAT-9012-C" },
        ],
      },
      storageDevices: {
        create: [{ type: "nvme-ssd", capacityGb: 512, serialNumber: "SSD-TP-9911" }],
      },
      images: {
        create: [
          { url: "https://picsum.photos/seed/thinkpad-1/800/600" },
          { url: "https://picsum.photos/seed/thinkpad-2/800/600" },
        ],
      },
    },
  });

  await prisma.asset.create({
    data: {
      id: "asset-2",
      assetNumber: 102,
      name: "Canon EOS R5",
      model: "EOS R5 Body",
      serialNumber: "CN0834771",
      priceCents: 249900,
      status: "available",
      description:
        "Mirrorless full-frame body, ~8,200 shutter actuations. Comes with two batteries and the original box.",
      createdAt: new Date("2026-06-10T09:30:00.000Z"),
      group: "Reserved: Sarah Kim",
      location: "Warehouse A, Shelf 3",
      assignedTo: "Jordan Lee",
      parts: {
        create: [
          { name: "LP-E6NH battery #1", serialNumber: "BATT-6NH-001" },
          { name: "LP-E6NH battery #2", serialNumber: "BATT-6NH-002" },
          { name: "CFexpress card reader", serialNumber: "RDR-CFX-33" },
        ],
      },
      images: {
        create: [
          { url: "https://picsum.photos/seed/canon-1/800/600" },
          { url: "https://picsum.photos/seed/canon-2/800/600" },
          { url: "https://picsum.photos/seed/canon-3/800/600" },
        ],
      },
    },
  });

  await prisma.asset.create({
    data: {
      id: "asset-3",
      assetNumber: 103,
      name: "DeWalt 20V MAX Drill/Driver Kit",
      model: "DCD791D2",
      serialNumber: "DW22190456",
      priceCents: 12900,
      status: "available",
      description: "Brushless drill/driver, two 2Ah batteries, charger, and hard case included.",
      createdAt: new Date("2026-06-18T11:15:00.000Z"),
      group: "Recycle",
      location: "Garage",
      assignedTo: null,
      parts: {
        create: [
          { name: "2Ah battery #1", serialNumber: "DCB203-A" },
          { name: "2Ah battery #2", serialNumber: "DCB203-B" },
          { name: "Fast charger", serialNumber: "DCB107-X" },
        ],
      },
      images: { create: [{ url: "https://picsum.photos/seed/dewalt-1/800/600" }] },
    },
  });

  await prisma.asset.create({
    data: {
      id: "asset-4",
      assetNumber: 104,
      name: "Dell PowerEdge R730 Server",
      model: "PowerEdge R730",
      serialNumber: "DPE730-88213",
      priceCents: 64900,
      status: "sold",
      description:
        '2x Xeon E5-2680 v4, 128GB RAM, 8x 2.5" bays populated with 600GB 10K SAS drives, dual PSU.',
      createdAt: new Date("2026-05-20T08:00:00.000Z"),
      group: null,
      location: "Warehouse A, Shelf 1",
      assignedTo: null,
      parts: {
        create: [
          { name: "PSU #1", serialNumber: "PSU-750W-A" },
          { name: "PSU #2", serialNumber: "PSU-750W-B" },
          { name: "PERC H730 RAID controller", serialNumber: "H730-77102" },
        ],
      },
      storageDevices: {
        create: [
          { type: "hdd", capacityGb: 600, serialNumber: "SAS-R730-01" },
          { type: "hdd", capacityGb: 600, serialNumber: "SAS-R730-02" },
        ],
      },
      images: { create: [{ url: "https://picsum.photos/seed/dell-server-1/800/600" }] },
    },
  });

  await prisma.asset.create({
    data: {
      id: "asset-5",
      assetNumber: 105,
      name: "Herman Miller Aeron (Size B)",
      model: "Aeron Remastered",
      serialNumber: "HM-AER-33210",
      priceCents: 39900,
      status: "sold",
      description: "Fully adjustable, PostureFit SL, graphite frame. No rips or stains.",
      createdAt: new Date("2026-05-25T16:45:00.000Z"),
      group: null,
      location: "Office, Storage Closet",
      assignedTo: null,
      parts: { create: [{ name: "Adjustable lumbar support", serialNumber: "PFSL-4402" }] },
      images: { create: [{ url: "https://picsum.photos/seed/aeron-1/800/600" }] },
    },
  });

  // New assets must keep counting from 106 — inserting explicit ids above leaves
  // the Postgres sequence untouched, so nudge it past the seeded range.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Asset"', 'assetNumber'), 105, true)`,
  );

  await prisma.sale.createMany({
    data: [
      {
        id: "sale-1",
        assetId: "asset-4",
        assetName: "Dell PowerEdge R730 Server",
        salePriceCents: 61000,
        soldAt: new Date("2026-06-28T13:20:00.000Z"),
      },
      {
        id: "sale-2",
        assetId: "asset-5",
        assetName: "Herman Miller Aeron (Size B)",
        salePriceCents: 38500,
        soldAt: new Date("2026-07-05T10:05:00.000Z"),
      },
    ],
  });

  await prisma.ticket.create({
    data: {
      id: "ticket-1",
      name: "Marcus Webb",
      email: "marcus.webb@example.com",
      category: "repair",
      description:
        "The laptop I bought last month won't hold a charge past 20 minutes — might be a battery issue.",
      completed: false,
      createdAt: new Date("2026-07-10T15:22:00.000Z"),
      assignedTo: "Sam Rivera",
      assets: { connect: [{ id: "asset-1" }] },
    },
  });

  await prisma.ticket.create({
    data: {
      id: "ticket-2",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      category: "warranty",
      description: "Requesting a warranty check on a server PSU that started making a grinding noise.",
      completed: true,
      createdAt: new Date("2026-07-02T09:10:00.000Z"),
      assignedTo: null,
    },
  });

  await prisma.customOrder.create({
    data: {
      id: "order-1",
      name: "Alicia Nguyen",
      email: "alicia.nguyen@example.com",
      category: "pc-build",
      model: null,
      quantity: 1,
      details:
        "Looking for a workstation for video editing — 32GB+ RAM, fast NVMe storage, a solid GPU for Premiere.",
      budget: "$1,500–$2,000",
      completed: false,
      createdAt: new Date("2026-07-08T13:40:00.000Z"),
      assignedTo: null,
    },
  });

  await prisma.customOrder.create({
    data: {
      id: "order-2",
      name: "Rachel Osei",
      email: "rachel.osei@example.com",
      category: "laptop",
      model: "Dell Latitude 5440",
      quantity: 12,
      details:
        "Onboarding a new team — need 12 identical laptops, imaged the same, for new hires starting next month.",
      budget: "$700–$900 each",
      completed: false,
      createdAt: new Date("2026-07-12T10:05:00.000Z"),
      assignedTo: "Dana Kim",
      assets: { connect: [{ id: "asset-1" }] },
    },
  });

  await prisma.purchase.createMany({
    data: [
      {
        id: "purchase-1",
        item: "USB-C dock stations",
        vendor: "CDW",
        quantity: 5,
        totalCostCents: 62450,
        purchasedAt: "2026-06-20",
        notes: "For the new hire onboarding kits.",
        createdAt: new Date("2026-06-20T16:00:00.000Z"),
        group: "IT Supplies",
        assetId: null,
      },
      {
        id: "purchase-2",
        item: "Precision screwdriver set",
        vendor: "Amazon Business",
        quantity: 2,
        totalCostCents: 4598,
        purchasedAt: "2026-07-01",
        notes: null,
        createdAt: new Date("2026-07-01T12:30:00.000Z"),
        group: "Tools",
        assetId: null,
      },
    ],
  });

  console.log("Seeded demo inventory.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
