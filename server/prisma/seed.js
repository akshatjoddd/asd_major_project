import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@museumx.in' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'admin@museumx.in',
      name: 'Museum Administrator',
      role: 'admin',
      passwordHash: adminPassword,
    },
  });

  const gatePassword = await bcrypt.hash('gate123', 10);
  await prisma.admin.upsert({
    where: { email: 'gate@museumx.in' },
    update: { passwordHash: gatePassword },
    create: {
      email: 'gate@museumx.in',
      name: 'Gate Staff',
      role: 'gate',
      passwordHash: gatePassword,
    },
  });

  const ticketTypes = [
    { name: 'Adult', nameHi: 'वयस्क', price: 8000, description: 'Visitors aged 13 and above', descriptionHi: '13 वर्ष और उससे अधिक आयु के आगंतुक' },
    { name: 'Child', nameHi: 'बालक', price: 4000, description: 'Children aged 3 to 12', descriptionHi: '3 से 12 वर्ष के बच्चे' },
    { name: 'Student', nameHi: 'विद्यार्थी', price: 5000, description: 'Students with a valid ID card', descriptionHi: 'वैध पहचान पत्र वाले विद्यार्थी' },
    { name: 'General Entry', nameHi: 'सामान्य प्रवेश', price: 10000, description: 'General museum entry', descriptionHi: 'सामान्य संग्रहालय प्रवेश' },
  ];

  for (const t of ticketTypes) {
    await prisma.ticketType.upsert({
      where: { name: t.name },
      update: { price: t.price, nameHi: t.nameHi, description: t.description, descriptionHi: t.descriptionHi },
      create: t,
    });
  }

  if ((await prisma.exhibition.count()) === 0) {
    await prisma.exhibition.createMany({
      data: [
        { name: 'Invention', nameHi: 'आविष्कार', description: 'Hands-on gallery tracing Indian and global inventions.', descriptionHi: 'भारतीय और वैश्विक आविष्कारों की प्रदर्शनी।' },
        { name: 'Human Biology', nameHi: 'मानव जीव विज्ञान', description: 'Walk through the human body, from cells to senses.', descriptionHi: 'कोशिकाओं से इंद्रियों तक मानव शरीर की यात्रा।' },
        { name: 'Dinosaur Park', nameHi: 'डायनासोर पार्क', description: 'Life-size dinosaur models in an outdoor trail.', descriptionHi: 'खुले रास्ते पर जीवन-आकार के डायनासोर मॉडल।' },
      ],
    });
  }

  if ((await prisma.show.count()) === 0) {
    await prisma.show.createMany({
      data: [
        { name: 'Taramandal Planetarium', nameHi: 'तारामंडल शो', description: 'A guided tour of the night sky, 25 minutes.', descriptionHi: 'रात के आकाश का निर्देशित भ्रमण, 25 मिनट।', venue: 'Planetarium Dome', venueHi: 'तारामंडल गुंबद' },
        { name: 'Science on a Sphere', nameHi: 'स्फीयर पर विज्ञान', description: 'Earth and space data projected on a six-foot globe.', descriptionHi: 'छह फुट के ग्लोब पर पृथ्वी और अंतरिक्ष का डेटा।', venue: 'Innovation Hall', venueHi: 'नवाचार हॉल' },
        { name: 'Robotics Live', nameHi: 'रोबोटिक्स लाइव', description: 'Robots built in the museum lab, demonstrated live.', descriptionHi: 'संग्रहालय प्रयोगशाला में बने रोबोट, लाइव प्रदर्शन।', venue: 'Workshop Studio', venueHi: 'कार्यशाला स्टूडियो' },
      ],
    });
  }

  if ((await prisma.slotTemplate.count()) === 0) {
    const shows = await prisma.show.findMany();
    const show1Id = shows[0]?.id || null;
    const show2Id = shows[1]?.id || null;
    const show3Id = shows[2]?.id || null;

    await prisma.slotTemplate.createMany({
      data: [
        { type: 'entry', refId: null, startTime: '10:00', endTime: '11:00', capacity: 220 },
        { type: 'entry', refId: null, startTime: '11:00', endTime: '12:00', capacity: 220 },
        { type: 'entry', refId: null, startTime: '12:00', endTime: '13:00', capacity: 220 },
        { type: 'entry', refId: null, startTime: '13:00', endTime: '14:00', capacity: 220 },
        { type: 'entry', refId: null, startTime: '14:00', endTime: '15:00', capacity: 220 },
        { type: 'entry', refId: null, startTime: '15:00', endTime: '16:00', capacity: 220 },
        { type: 'entry', refId: null, startTime: '16:00', endTime: '17:00', capacity: 220 },
        { type: 'entry', refId: null, startTime: '17:00', endTime: '18:00', capacity: 220 },
        { type: 'exhibition', refId: null, startTime: '10:30', endTime: '12:00', capacity: 90 },
        { type: 'exhibition', refId: null, startTime: '13:00', endTime: '14:30', capacity: 90 },
        { type: 'exhibition', refId: null, startTime: '15:30', endTime: '17:00', capacity: 90 },
        { type: 'show', refId: show1Id, startTime: '11:30', endTime: '12:00', capacity: 60 },
        { type: 'show', refId: show1Id, startTime: '14:00', endTime: '14:30', capacity: 60 },
        { type: 'show', refId: show1Id, startTime: '16:30', endTime: '17:00', capacity: 60 },
        { type: 'show', refId: show2Id, startTime: '12:30', endTime: '13:00', capacity: 80 },
        { type: 'show', refId: show2Id, startTime: '15:00', endTime: '15:30', capacity: 80 },
        { type: 'show', refId: show3Id, startTime: '13:30', endTime: '14:15', capacity: 50 },
        { type: 'show', refId: show3Id, startTime: '17:00', endTime: '17:45', capacity: 50 },
      ],
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
