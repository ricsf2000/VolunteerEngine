import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // --- Optional: clean slate for local/dev seeding ---
  // Order matters due to FKs
  await prisma.notificationData.deleteMany();
  await prisma.volunteerHistory.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.eventDetails.deleteMany();
  await prisma.matchStats.deleteMany();
  await prisma.userCredentials.deleteMany();
  await prisma.state.deleteMany();

  // --- States ---
  const states = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ];
  await prisma.state.createMany({ data: states, skipDuplicates: true });

  // --- Users ---
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const admin = await prisma.userCredentials.create({
    data: {
      email: "admin@test.com",
      password: hash("admin-pass"),
      role: "admin",
    },
  });

  const vol1 = await prisma.userCredentials.create({
    data: {
      email: "volunteer@test.com",
      password: hash("vol-pass"),
      role: "volunteer",
    },
  });

  const vol2 = await prisma.userCredentials.create({
    data: {
      email: "alice@example.com",
      password: hash("Volunteer123!"),
      role: "volunteer",
    },
  });

  // --- Profiles ---
  await prisma.userProfile.createMany({
    data: [
      {
        userId: admin.id,
        fullName: "Site Administrator",
        address1: "100 Admin Way",
        city: "Houston",
        state: "TX",
        zipCode: "77002",
        skills: ["coordination", "scheduling"],
        preferences: "Prefers weekday morning shifts; remote-friendly.",
        availability: [
          "2025-10-27",
          "2025-10-28",
          "2025-11-03",
        ],
      },
      {
        userId: vol1.id,
        fullName: "Alice Johnson",
        address1: "123 Main St",
        city: "Houston",
        state: "TX",
        zipCode: "77004",
        skills: ["logistics", "food-handling", "spanish"],
        preferences:
          "Enjoys check-in desk or packing. Avoids heavy lifting (>30 lb).",
        availability: [
          "2025-10-30",
          "2025-11-02",
          "2025-11-09",
        ],
      },
      {
        userId: vol2.id,
        fullName: "Bob Martinez",
        address1: "456 Oak Ave",
        address2: "Apt 5",
        city: "Sugar Land",
        state: "TX",
        zipCode: "77479",
        skills: ["first-aid", "forklift", "warehouse"],
        preferences: "Evenings and weekends; can do loading bay.",
        availability: [
          "2025-10-31",
          "2025-11-01",
          "2025-11-08",
        ],
      },
    ],
    skipDuplicates: true,
  });

  // --- Events ---
  const now = new Date();
  const next = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const eventFoodDrive = await prisma.eventDetails.create({
    data: {
      eventName: "Weekend Food Drive",
      description:
        "Sort donations, assemble food boxes, and help with distribution.",
      location: "Houston Food Bank Warehouse",
      requiredSkills: ["logistics", "food-handling"],
      urgency: "medium",
      eventDate: next(5),
    },
  });

  const eventShelter = await prisma.eventDetails.create({
    data: {
      eventName: "Emergency Shelter Setup",
      description:
        "Set up cots and supplies at temporary shelter. Some lifting required.",
      location: "Downtown Community Center",
      requiredSkills: ["warehouse", "coordination"],
      urgency: "high",
      eventDate: next(2),
    },
  });

  const eventParkClean = await prisma.eventDetails.create({
    data: {
      eventName: "City Park Cleanup",
      description:
        "Trash pickup, light landscaping, and recycling sorting in the park.",
      location: "Buffalo Bayou Park",
      requiredSkills: ["outdoors", "coordination"],
      urgency: "low",
      eventDate: next(9),
    },
  });

  // --- Volunteer History ---
  await prisma.volunteerHistory.createMany({
    data: [
      {
        userId: vol1.id,
        eventId: eventFoodDrive.id,
        participantStatus: "confirmed",
        registrationDate: new Date(),
      },
      {
        userId: vol2.id,
        eventId: eventShelter.id,
        participantStatus: "pending",
        registrationDate: new Date(),
      },
      {
        userId: vol2.id,
        eventId: eventFoodDrive.id,
        participantStatus: "cancelled",
        registrationDate: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // --- Notifications ---
  await prisma.notificationData.create({
    data: {
      type: "reminder",
      title: "Upcoming Shift Reminder",
      message:
        "Don’t forget: Weekend Food Drive is in 5 days. Please confirm attendance.",
      timestamp: new Date().toISOString(),
      isRead: false,
      userId: vol1.id,
      userRole: "volunteer",
      eventInfo: {
        eventId: eventFoodDrive.id,
        name: eventFoodDrive.eventName,
        date: eventFoodDrive.eventDate.toISOString(),
        location: eventFoodDrive.location,
      },
      volunteerInfo: { userId: vol1.id, name: "Alice Johnson" },
      matchStats: { score: 0.82, skillsMatched: ["logistics", "food-handling"] },
    },
  });

  await prisma.notificationData.create({
    data: {
      type: "assignment",
      title: "Provisional Assignment: Shelter Setup",
      message:
        "You have been tentatively assigned to Emergency Shelter Setup. Please confirm.",
      timestamp: new Date().toISOString(),
      isRead: false,
      userId: vol2.id,
      userRole: "volunteer",
      eventInfo: {
        eventId: eventShelter.id,
        urgency: "high",
        requiredSkills: ["warehouse", "coordination"],
      },
      volunteerInfo: { userId: vol2.id, name: "Bob Martinez" },
    },
  });

  await prisma.notificationData.create({
    data: {
      type: "update",
      title: "Roster Update: Food Drive",
      message:
        "Admin updated the roster and shift windows for the Food Drive event.",
      timestamp: new Date().toISOString(),
      isRead: false,
      userId: admin.id,
      userRole: "admin",
      eventInfo: {
        eventId: eventFoodDrive.id,
        affected: ["schedule", "capacity"],
      },
    },
  });

  // --- MatchStats (standalone analytics record) ---
  await prisma.matchStats.create({
    data: {
      volunteersMatched: 12,
      eventsCount: 3,
      efficiency: "82%",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
