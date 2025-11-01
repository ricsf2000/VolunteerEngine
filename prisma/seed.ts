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

  const vol3 = await prisma.userCredentials.create({
    data: {
      email: "bob@example.com",
      password: hash("Volunteer123!"),
      role: "volunteer",
    },
  });

  const vol4 = await prisma.userCredentials.create({
    data: {
      email: "sarah@example.com",
      password: hash("Volunteer123!"),
      role: "volunteer",
    },
  });

  // --- Profiles ---
  await prisma.userProfile.createMany({
    data: [
      {
        userId: vol1.id,
        fullName: "Volunteer Test User",
        address1: "123 Main Street",
        city: "Houston",
        state: "TX",
        zipCode: "77004",
        skills: ["Food Service", "Event Planning", "Languages (Bilingual)", "Administrative Support"],
        preferences: "Available weekends and evenings. Enjoys working with people and organizing events. Has experience in food service and bilingual communication.",
        availability: [
          "2025-11-02",
          "2025-11-03",
          "2025-11-09",
          "2025-11-10",
          "2025-11-16",
          "2025-11-17",
        ],
      },
      {
        userId: vol2.id,
        fullName: "Alice Johnson",
        address1: "456 Oak Avenue",
        address2: "Apt 5",
        city: "Sugar Land",
        state: "TX",
        zipCode: "77479",
        skills: ["Healthcare", "Senior Care", "Teaching/Training"],
        preferences: "Prefers healthcare and education related volunteer work. Available weekday evenings and has experience working with elderly populations.",
        availability: [
          "2025-11-04",
          "2025-11-05",
          "2025-11-11",
          "2025-11-12",
        ],
      },
      {
        userId: vol3.id,
        fullName: "Bob Martinez",
        address1: "789 Pine Street",
        city: "Katy",
        state: "TX",
        zipCode: "77494",
        skills: ["Construction/Manual Labor", "Transportation", "Sports/Recreation"],
        preferences: "Available for physical work and outdoor activities. Prefers weekend shifts and has truck for transportation needs.",
        availability: [
          "2025-11-08",
          "2025-11-09",
          "2025-11-15",
          "2025-11-16",
        ],
      },
      {
        userId: vol4.id,
        fullName: "Sarah Chen",
        address1: "321 Elm Drive",
        city: "The Woodlands",
        state: "TX",
        zipCode: "77381",
        skills: ["Technology Support", "Photography/Videography", "Marketing/Communications"],
        preferences: "Specializes in digital media and technology support. Available weekday evenings and can help with online promotion and documentation.",
        availability: [
          "2025-11-06",
          "2025-11-07",
          "2025-11-13",
          "2025-11-14",
        ],
      },
    ],
    skipDuplicates: true,
  });

  // --- Events ---
  const eventHolidayDinner = await prisma.eventDetails.create({
    data: {
      eventName: "Community Holiday Dinner",
      description: "Help prepare and serve holiday meals to families in need. Tasks include food preparation, serving, setup, and cleanup. Bilingual volunteers especially needed for guest interaction.",
      location: "Houston Community Center - 1234 Main Street",
      requiredSkills: ["Food Service", "Languages (Bilingual)", "Event Planning"],
      urgency: "medium",
      eventDate: new Date("2025-11-15T16:00:00Z"),
    },
  });

  const eventSeniorCare = await prisma.eventDetails.create({
    data: {
      eventName: "Senior Center Technology Workshop",
      description: "Teach elderly residents how to use tablets and smartphones for video calls with family. Help with basic internet navigation and social media setup.",
      location: "Sunset Senior Living - 567 Oak Avenue",
      requiredSkills: ["Technology Support", "Teaching/Training", "Senior Care"],
      urgency: "low",
      eventDate: new Date("2025-11-08T14:00:00Z"),
    },
  });

  const eventDisasterResponse = await prisma.eventDetails.create({
    data: {
      eventName: "Emergency Flood Relief Setup",
      description: "URGENT: Set up emergency shelter and distribute supplies to flood victims. Heavy lifting required. Transportation volunteers needed to deliver supplies to affected areas.",
      location: "Emergency Response Center - 890 Emergency Way",
      requiredSkills: ["Construction/Manual Labor", "Transportation", "Administrative Support"],
      urgency: "high",
      eventDate: new Date("2025-11-05T08:00:00Z"),
    },
  });

  const eventYouthMentoring = await prisma.eventDetails.create({
    data: {
      eventName: "Youth Career Day Planning Meeting",
      description: "Plan and organize upcoming career day event for local high school students. Need help with event coordination, photography for promotional materials, and administrative tasks.",
      location: "Youth Development Center - 456 Future Lane",
      requiredSkills: ["Event Planning", "Photography/Videography", "Youth Mentoring"],
      urgency: "medium",
      eventDate: new Date("2025-11-12T18:00:00Z"),
    },
  });

  const eventHealthcare = await prisma.eventDetails.create({
    data: {
      eventName: "Free Health Screening Event",
      description: "Assist medical professionals with community health screening event. Help with patient check-in, basic administrative support, and crowd management.",
      location: "Mobile Health Clinic - Various Houston Locations",
      requiredSkills: ["Healthcare", "Administrative Support"],
      urgency: "medium",
      eventDate: new Date("2025-11-20T09:00:00Z"),
    },
  });

  const eventEnvironmental = await prisma.eventDetails.create({
    data: {
      eventName: "Buffalo Bayou Trail Restoration",
      description: "Join us for trail maintenance and native plant restoration along Buffalo Bayou. Physical work including planting, mulching, and trail clearing. Tools provided.",
      location: "Buffalo Bayou Park - Sabine Street Entrance",
      requiredSkills: ["Environmental Work", "Construction/Manual Labor"],
      urgency: "low",
      eventDate: new Date("2025-11-22T08:00:00Z"),
    },
  });

  // --- Volunteer History ---
  await prisma.volunteerHistory.createMany({
    data: [
      // volunteer@test.com (vol1) - various states to test UI
      {
        userId: vol1.id,
        eventId: eventHolidayDinner.id,
        participantStatus: "confirmed",
        registrationDate: new Date("2025-10-15T10:00:00Z"),
      },
      {
        userId: vol1.id,
        eventId: eventYouthMentoring.id,
        participantStatus: "pending",
        registrationDate: new Date("2025-10-28T14:30:00Z"),
      },
      {
        userId: vol1.id,
        eventId: eventHealthcare.id,
        participantStatus: "cancelled",
        registrationDate: new Date("2025-10-20T09:15:00Z"),
      },
      
      // Alice (vol2) - healthcare focused
      {
        userId: vol2.id,
        eventId: eventSeniorCare.id,
        participantStatus: "confirmed",
        registrationDate: new Date("2025-10-25T16:00:00Z"),
      },
      {
        userId: vol2.id,
        eventId: eventHealthcare.id,
        participantStatus: "confirmed",
        registrationDate: new Date("2025-10-22T11:30:00Z"),
      },
      
      // Bob (vol3) - construction/physical work
      {
        userId: vol3.id,
        eventId: eventDisasterResponse.id,
        participantStatus: "confirmed",
        registrationDate: new Date("2025-11-01T08:00:00Z"),
      },
      {
        userId: vol3.id,
        eventId: eventEnvironmental.id,
        participantStatus: "pending",
        registrationDate: new Date("2025-10-30T12:00:00Z"),
      },
      
      // Sarah (vol4) - tech/media focused
      {
        userId: vol4.id,
        eventId: eventYouthMentoring.id,
        participantStatus: "confirmed",
        registrationDate: new Date("2025-10-26T19:00:00Z"),
      },
      {
        userId: vol4.id,
        eventId: eventSeniorCare.id,
        participantStatus: "pending",
        registrationDate: new Date("2025-10-29T15:45:00Z"),
      },
    ],
    skipDuplicates: true,
  });

  // --- Notifications ---
  // Notifications for volunteer@test.com
  await prisma.notificationData.create({
    data: {
      type: "reminder",
      title: "Holiday Dinner Event Confirmed",
      message: "Thank you for confirming your participation in the Community Holiday Dinner on November 15th. Please arrive 30 minutes early for setup.",
      timestamp: new Date("2025-10-16T08:00:00Z").toISOString(),
      isRead: false,
      userId: vol1.id,
      userRole: "volunteer",
      eventInfo: {
        eventId: eventHolidayDinner.id,
        name: eventHolidayDinner.eventName,
        date: eventHolidayDinner.eventDate.toISOString(),
        location: eventHolidayDinner.location,
        address: "1234 Main Street, Houston, TX 77004",
      },
      volunteerInfo: { userId: vol1.id, name: "Volunteer Test User" },
      matchStats: { score: 0.95, skillsMatched: ["Food Service", "Event Planning", "Languages (Bilingual)"] },
    },
  });

  await prisma.notificationData.create({
    data: {
      type: "assignment",
      title: "New Event Match: Youth Career Day",
      message: "Based on your skills in Event Planning, you would be a great fit for the Youth Career Day Planning Meeting. Please review and confirm if interested.",
      timestamp: new Date("2025-10-28T12:00:00Z").toISOString(),
      isRead: true,
      userId: vol1.id,
      userRole: "volunteer",
      eventInfo: {
        eventId: eventYouthMentoring.id,
        name: eventYouthMentoring.eventName,
        urgency: "medium",
        requiredSkills: ["Event Planning", "Photography/Videography", "Youth Mentoring"],
        address: "456 Future Lane, Houston, TX 77002",
      },
      volunteerInfo: { userId: vol1.id, name: "Volunteer Test User" },
      matchStats: { score: 0.75, skillsMatched: ["Event Planning"] },
    },
  });

  // Notifications for admin@test.com
  await prisma.notificationData.create({
    data: {
      type: "update",
      title: "Volunteer Registration Update",
      message: "4 new volunteer registrations received today. Emergency Flood Relief event now has sufficient volunteers.",
      timestamp: new Date("2025-11-01T14:30:00Z").toISOString(),
      isRead: false,
      userId: admin.id,
      userRole: "admin",
      eventInfo: {
        eventId: eventDisasterResponse.id,
        name: eventDisasterResponse.eventName,
        affected: ["capacity", "skill_coverage"],
        address: "890 Emergency Way, Houston, TX 77001",
      },
      matchStats: { volunteersMatched: 8, eventsCount: 6, efficiency: "87%" },
    },
  });

  await prisma.notificationData.create({
    data: {
      type: "reminder",
      title: "Urgent Event Needs Attention",
      message: "Emergency Flood Relief Setup is tomorrow and still needs 2 more volunteers with Transportation skills.",
      timestamp: new Date("2025-11-04T09:00:00Z").toISOString(),
      isRead: false,
      userId: admin.id,
      userRole: "admin",
      eventInfo: {
        eventId: eventDisasterResponse.id,
        name: eventDisasterResponse.eventName,
        urgency: "high",
        requiredSkills: ["Transportation"],
        needed: 2,
        address: "890 Emergency Way, Houston, TX 77001",
      },
    },
  });

  // --- MatchStats (standalone analytics record) ---
  await prisma.matchStats.create({
    data: {
      volunteersMatched: 15,
      eventsCount: 6,
      efficiency: "87%",
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
