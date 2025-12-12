// // scripts/seed.ts
// import {
//   PrismaClient,
//   PropertyStatus,
//   PropertyType,
//   Role,
//   BookingStatus,
//   PaymentStatus,
// } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   // Use existing landlord ID
//   const landlordId = '92817dfd-c681-45cf-80b1-c23853458ef7';

//   // Create tenants
//   const tenants = await Promise.all(
//     Array.from({ length: 10 }, (_, i) =>
//       prisma.user.create({
//         data: {
//           email: `tenant${i + 1}@example.com`,
//           password: 'hashedpassword123',
//           firstName: `Tenant${i + 1}`,
//           lastName: 'User',
//           role: Role.TENANT,
//         },
//       }),
//     ),
//   );

//   // House Properties
//   const houses = await Promise.all(
//     Array.from({ length: 5 }, (_, i) =>
//       prisma.property.create({
//         data: {
//           title: `Cozy House ${i + 1}`,
//           description: `A beautiful house with modern amenities ${i + 1}`,
//           address: `12${i} Main St, City`,
//           price: 1500 + i * 100,
//           status: [
//             PropertyStatus.AVAILABLE,
//             PropertyStatus.RENTED,
//             PropertyStatus.PENDING,
//           ][i % 3],
//           landlordId: landlordId,
//           propertyType: PropertyType.HOUSE,
//           numberOfBeds: 3 + (i % 3),
//           numberOfBaths: 2 + (i % 2),
//           houseSize: 1200 + i * 100,
//           isFurnished: i % 2 === 0,
//           images: {
//             create: [
//               { url: `https://example.com/house${i + 1}/img1.jpg` },
//               { url: `https://example.com/house${i + 1}/img2.jpg` },
//             ],
//           },
//         },
//       }),
//     ),
//   );

//   // Apartment Properties
//   const apartments = await Promise.all(
//     Array.from({ length: 5 }, (_, i) =>
//       prisma.property.create({
//         data: {
//           title: `Modern Apartment ${i + 1}`,
//           description: `Spacious apartment in city center ${i + 1}`,
//           address: `45${i} Park Ave, City`,
//           price: 1000 + i * 150,
//           status: [
//             PropertyStatus.AVAILABLE,
//             PropertyStatus.RENTED,
//             PropertyStatus.PENDING,
//           ][i % 3],
//           landlordId: landlordId,
//           propertyType: PropertyType.APARTMENT,
//           numberOfBeds: 2 + (i % 2),
//           numberOfBaths: 1 + (i % 2),
//           houseSize: 800 + i * 50,
//           isFurnished: i % 2 === 1,
//           apartmentComplex: `Complex ${i + 1}`,
//           images: {
//             create: [{ url: `https://example.com/apartment${i + 1}/img1.jpg` }],
//           },
//         },
//       }),
//     ),
//   );

//   // Land Properties
//   const lands = await Promise.all(
//     Array.from({ length: 5 }, (_, i) =>
//       prisma.property.create({
//         data: {
//           title: `Prime Land ${i + 1}`,
//           description: `Vacant land for development ${i + 1}`,
//           address: `78${i} Rural Rd, City`,
//           price: 5000 + i * 1000,
//           status: [PropertyStatus.AVAILABLE, PropertyStatus.PENDING][i % 2],
//           landlordId: landlordId,
//           propertyType: PropertyType.LAND,
//           landSize: 10000 + i * 2000,
//           landSizeUnit: 'sqft',
//           images: {
//             create: [{ url: `https://example.com/land${i + 1}/img1.jpg` }],
//           },
//         },
//       }),
//     ),
//   );

//   // Commercial Properties
//   const commercials = await Promise.all(
//     Array.from({ length: 5 }, (_, i) =>
//       prisma.property.create({
//         data: {
//           title: `Commercial Space ${i + 1}`,
//           description: `Office space for businesses ${i + 1}`,
//           address: `10${i} Business Park, City`,
//           price: 3000 + i * 500,
//           status: [
//             PropertyStatus.AVAILABLE,
//             PropertyStatus.RENTED,
//             PropertyStatus.PENDING,
//           ][i % 3],
//           landlordId: landlordId,
//           propertyType: PropertyType.COMMERCIAL,
//           houseSize: 2000 + i * 200,
//           images: {
//             create: [
//               { url: `https://example.com/commercial${i + 1}/img1.jpg` },
//             ],
//           },
//         },
//       }),
//     ),
//   );

//   // Mixed Properties
//   const mixed = await Promise.all(
//     Array.from({ length: 5 }, (_, i) =>
//       prisma.property.create({
//         data: {
//           title: `Mixed Property ${i + 1}`,
//           description: `Unique property with mixed use ${i + 1}`,
//           address: `22${i} Hybrid St, City`,
//           price: 2000 + i * 300,
//           status: [
//             PropertyStatus.AVAILABLE,
//             PropertyStatus.RENTED,
//             PropertyStatus.PENDING,
//           ][i % 3],
//           landlordId: landlordId,
//           propertyType: [
//             PropertyType.HOUSE,
//             PropertyType.APARTMENT,
//             PropertyType.COMMERCIAL,
//           ][i % 3],
//           numberOfBeds: i % 2 === 0 ? 2 + (i % 2) : null,
//           numberOfBaths: i % 2 === 0 ? 1 + (i % 2) : null,
//           houseSize: 1500 + i * 150,
//           isFurnished: i % 2 === 0,
//           images: {
//             create: [{ url: `https://example.com/mixed${i + 1}/img1.jpg` }],
//           },
//         },
//       }),
//     ),
//   );

//   // Create bookings for rented and pending properties
//   const allProperties = [...houses, ...apartments, ...commercials, ...mixed];
//   await Promise.all(
//     allProperties
//       .filter(
//         (p) =>
//           p.status === PropertyStatus.RENTED ||
//           p.status === PropertyStatus.PENDING,
//       )
//       .map((property, i) =>
//         prisma.booking.create({
//           data: {
//             userId: tenants[i % tenants.length].id,
//             propertyId: property.id,
//             startDate: new Date(2025, 8, 1),
//             endDate: new Date(2026, 7, 31),
//             status:
//               property.status === PropertyStatus.RENTED
//                 ? BookingStatus.APPROVED
//                 : BookingStatus.PENDING,
//             payments:
//               property.status === PropertyStatus.RENTED
//                 ? {
//                     create: {
//                       amount: property.price,
//                       proofUrl: `https://example.com/payment${i + 1}.pdf`,
//                       paidAt: new Date(),
//                       status: PaymentStatus.APPROVED,
//                     },
//                   }
//                 : undefined,
//           },
//         }),
//       ),
//   );

//   console.log('Seeding completed!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
