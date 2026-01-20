import "dotenv/config";
import db, { client } from "./index";
import { sql } from "drizzle-orm";
import {
  users,
  clients,
  organizations,
  durations,
  persons,
  events,
  eventOptions,
  prices,
  bookings,
  payments,
  userCustomers,
  availabilitySchedules,
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // ============================================================================
    // 0. CLEANUP - Delete all existing data
    // ============================================================================
    console.log("🧹 Cleaning up existing data...");

    // Delete in reverse order of dependencies
    await db.delete(payments);
    await db.delete(bookings);
    await db.delete(prices);
    await db.delete(eventOptions);
    await db.delete(availabilitySchedules);
    await db.delete(events);
    await db.delete(userCustomers);
    await db.delete(users);
    await db.delete(clients);
    await db.delete(persons);
    await db.delete(durations);
    await db.delete(organizations);

    console.log("✅ Cleanup complete");

    // ============================================================================
    // RESET SEQUENCES - Reset all ID sequences to start from 1
    // ============================================================================
    console.log("🔄 Resetting sequences...");

    // Dynamically find and reset all sequences for serial columns
    const sequences = await client`
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      AND sequence_name LIKE '%_id_seq'
    `;

    // Reset each sequence
    for (const seq of sequences) {
      const sequenceName = seq.sequence_name;
      await db.execute(sql.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH 1`));
    }

    console.log(`✅ Reset ${sequences.length} sequences`);

    // ============================================================================
    // 1. DURATIONS
    // ============================================================================
    console.log("⏱️ Seeding durations...");
    const durationsData = await db
      .insert(durations)
      .values([
        { duration: "15 minutes" },
        { duration: "30 minutes" },
        { duration: "45 minutes" },
        { duration: "1 hour" },
        { duration: "1 hour 30 minutes" },
        { duration: "2 hours" },
      ])
      .returning();
    console.log(`✅ Created ${durationsData.length} durations`);

    // ============================================================================
    // 2. ORGANIZATIONS
    // ============================================================================
    console.log("🏢 Seeding organizations...");
    const organizationsData = await db
      .insert(organizations)
      .values([
        { name: "Centro clínico CaracasMed" },
        { name: "Pilates Caracas" },
        { name: "Editorial Anagrama" },
      ])
      .returning();
    console.log(`✅ Created ${organizationsData.length} organizations`);

    // ============================================================================
    // 3. CLIENTS (Personal details for users)
    // ============================================================================
    console.log("👤 Seeding clients...");
    const clientsData = await db
      .insert(clients)
      .values([
        {
          firstName: "María",
          lastName: "González",
          ci: "25123456",
          birthDate: "1995-03-15",
        },
        {
          firstName: "Carlos",
          lastName: "Rodríguez",
          ci: "22987654",
          birthDate: "1992-07-22",
        },
        {
          firstName: "Ana",
          lastName: "Martínez",
          ci: "28456789",
          birthDate: "1998-11-08",
        },
        {
          firstName: "Luis",
          lastName: "Fernández",
          ci: "20345678",
          birthDate: "1990-05-30",
        },
        {
          firstName: "Sofia",
          lastName: "López",
          ci: "26789012",
          birthDate: "1996-09-12",
        },
      ])
      .returning();
    console.log(`✅ Created ${clientsData.length} clients`);

    // ============================================================================
    // 4. USERS
    // ============================================================================
    console.log("👥 Seeding users...");
    const usersData = await db
      .insert(users)
      .values([
        // Personal users (not in organizations)
        {
          username: "maria.gonzalez",
          email: "maria.gonzalez@email.com",
          password: "12345678", // In production, use proper hashing
          role: "user",
          clientId: clientsData[0].id,
          organizationId: null,
          organizationRole: null,
        },
        {
          username: "carlos.rodriguez",
          email: "carlos.rodriguez@email.com",
          password: "12345678",
          role: "user",
          clientId: clientsData[1].id,
          organizationId: null,
          organizationRole: null,
        },
        // Organization users
        {
          username: "ana.martinez",
          email: "ana.martinez@caracasmed.com",
          password: "12345678",
          role: "user",
          clientId: clientsData[2].id,
          organizationId: organizationsData[0].id, // Centro clínico CaracasMed
          organizationRole: "owner",
        },
        {
          username: "luis.fernandez",
          email: "luis.fernandez@pilatescaracas.com",
          password: "12345678",
          role: "user",
          clientId: clientsData[3].id,
          organizationId: organizationsData[1].id, // Pilates Caracas
          organizationRole: "admin",
        },
        {
          username: "sofia.lopez",
          email: "sofia.lopez@anagrama.com",
          password: "12345678",
          role: "admin",
          clientId: clientsData[4].id,
          organizationId: organizationsData[2].id, // Editorial Anagrama
          organizationRole: "owner",
        },
      ])
      .returning();
    console.log(`✅ Created ${usersData.length} users`);

    // ============================================================================
    // 5. PERSONS (Customers who book events)
    // ============================================================================
    console.log("🧑 Seeding persons...");
    const personsData = await db
      .insert(persons)
      .values([
        {
          firstName: "Juan",
          lastName: "Pérez",
          ci: "27123456",
          email: "juan.perez@email.com",
        },
        {
          firstName: "Laura",
          lastName: "Sánchez",
          ci: "24987654",
          email: "laura.sanchez@email.com",
        },
        {
          firstName: "Pedro",
          lastName: "Ramírez",
          ci: "29456789",
          email: "pedro.ramirez@email.com",
        },
        {
          firstName: "Carmen",
          lastName: "Torres",
          ci: "23345678",
          email: "carmen.torres@email.com",
        },
        {
          firstName: "Diego",
          lastName: "Morales",
          ci: "26789013",
          email: "diego.morales@email.com",
        },
        {
          firstName: "Isabella",
          lastName: "Castro",
          ci: "28123789",
          email: "isabella.castro@email.com",
        },
      ])
      .returning();
    console.log(`✅ Created ${personsData.length} persons`);

    // ============================================================================
    // 6. EVENTS
    // ============================================================================
    console.log("📅 Seeding events...");
    const eventsData = await db
      .insert(events)
      .values([
        // Personal events
        {
          id: "maria-consultoria",
          userId: usersData[0].id,
          organizationId: null,
          title: "Consultoría Empresarial",
          description: "Sesión personalizada de estrategia de negocios",
          urlSlug: "maria-consultoria-empresarial",
        },
        {
          id: "carlos-coaching",
          userId: usersData[1].id,
          organizationId: null,
          title: "Sesión de Coaching Profesional",
          description: "Desarrollo profesional y planificación de carrera",
          urlSlug: "carlos-coaching-profesional",
        },
        // Organizational events
        {
          id: "caracasmed-consulta",
          userId: null,
          organizationId: organizationsData[0].id,
          title: "Consulta Médica General",
          description: "Consulta médica general con especialistas",
          urlSlug: "caracasmed-consulta-general",
        },
        {
          id: "pilates-clase",
          userId: null,
          organizationId: organizationsData[1].id,
          title: "Clase de Pilates",
          description: "Clase de pilates personalizada o grupal",
          urlSlug: "pilates-caracas-clase",
        },
        {
          id: "anagrama-reunion",
          userId: null,
          organizationId: organizationsData[2].id,
          title: "Reunión Editorial",
          description: "Reunión con editor para revisión de manuscrito",
          urlSlug: "anagrama-reunion-editorial",
        },
      ])
      .returning();
    console.log(`✅ Created ${eventsData.length} events`);

    // ============================================================================
    // 7. EVENT OPTIONS
    // ============================================================================
    console.log("⚙️ Seeding event options...");
    const eventOptionsData = await db
      .insert(eventOptions)
      .values([
        // Consultoría Empresarial options
        {
          eventId: eventsData[0].id,
          durationId: durationsData[2].id, // 45 minutos
          capacity: 1,
        },
        {
          eventId: eventsData[0].id,
          durationId: durationsData[3].id, // 1 hora
          capacity: 1,
        },
        // Coaching Profesional options
        {
          eventId: eventsData[1].id,
          durationId: durationsData[3].id, // 1 hora
          capacity: 1,
        },
        // Consulta Médica options
        {
          eventId: eventsData[2].id,
          durationId: durationsData[1].id, // 30 minutos
          capacity: 1,
        },
        {
          eventId: eventsData[2].id,
          durationId: durationsData[3].id, // 1 hora
          capacity: 1,
        },
        // Clase de Pilates options
        {
          eventId: eventsData[3].id,
          durationId: durationsData[3].id, // 1 hora
          capacity: 5,
        },
        {
          eventId: eventsData[3].id,
          durationId: durationsData[4].id, // 1.5 horas
          capacity: 3,
        },
        // Reunión Editorial options
        {
          eventId: eventsData[4].id,
          durationId: durationsData[3].id, // 1 hora
          capacity: 1,
        },
      ])
      .returning();
    console.log(`✅ Created ${eventOptionsData.length} event options`);

    // ============================================================================
    // 8. PRICES
    // ============================================================================
    console.log("💰 Seeding prices...");
    const pricesData = await db
      .insert(prices)
      .values([
        // Consultoría Empresarial - 45 min
        {
          eventOptionId: eventOptionsData[0].id,
          usdAmount: "75.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
        // Consultoría Empresarial - 1 hora
        {
          eventOptionId: eventOptionsData[1].id,
          usdAmount: "100.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
        // Coaching Profesional - 1 hora
        {
          eventOptionId: eventOptionsData[2].id,
          usdAmount: "80.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
        // Consulta Médica - 30 min
        {
          eventOptionId: eventOptionsData[3].id,
          usdAmount: "50.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
        // Consulta Médica - 1 hora
        {
          eventOptionId: eventOptionsData[4].id,
          usdAmount: "90.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
        // Clase de Pilates - 1 hora
        {
          eventOptionId: eventOptionsData[5].id,
          usdAmount: "40.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
        // Clase de Pilates - 1.5 horas
        {
          eventOptionId: eventOptionsData[6].id,
          usdAmount: "55.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
        // Reunión Editorial - 1 hora
        {
          eventOptionId: eventOptionsData[7].id,
          usdAmount: "0.00",
          validFrom: "2024-01-01",
          validUntil: null,
          isActive: true,
        },
      ])
      .returning();
    console.log(`✅ Created ${pricesData.length} prices`);

    // ============================================================================
    // 9. USER CUSTOMERS (Junction table)
    // ============================================================================
    console.log("🔗 Seeding user-customer relationships...");
    const userCustomersData = await db
      .insert(userCustomers)
      .values([
        // María's customers
        { userId: usersData[0].id, personId: personsData[0].id },
        { userId: usersData[0].id, personId: personsData[1].id },
        { userId: usersData[0].id, personId: personsData[2].id },
        // Carlos's customers
        { userId: usersData[1].id, personId: personsData[3].id },
        { userId: usersData[1].id, personId: personsData[4].id },
        // Ana's customers (TechCorp)
        { userId: usersData[2].id, personId: personsData[5].id },
        { userId: usersData[2].id, personId: personsData[0].id },
      ])
      .returning();
    console.log(`✅ Created ${userCustomersData.length} user-customer relationships`);

    // ============================================================================
    // 10. AVAILABILITY SCHEDULES
    // ============================================================================
    console.log("📅 Seeding availability schedules...");
    const availabilitySchedulesData = await db
      .insert(availabilitySchedules)
      .values([
        // ========== GLOBAL AVAILABILITY - María (Personal User) ==========
        // Monday to Friday, 9:00 - 17:00
        {
          userId: usersData[0].id,
          organizationId: null,
          eventId: null, // Global - applies to all her events
          dayOfWeek: "monday",
          startTime: "09:00:00",
          endTime: "17:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[0].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "tuesday",
          startTime: "09:00:00",
          endTime: "17:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[0].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "wednesday",
          startTime: "09:00:00",
          endTime: "17:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[0].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "thursday",
          startTime: "09:00:00",
          endTime: "17:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[0].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "friday",
          startTime: "09:00:00",
          endTime: "17:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },

        // ========== GLOBAL AVAILABILITY - Carlos (Personal User) ==========
        // Monday to Friday, 10:00 - 18:00
        {
          userId: usersData[1].id,
          organizationId: null,
          eventId: null, // Global
          dayOfWeek: "monday",
          startTime: "10:00:00",
          endTime: "18:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[1].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "tuesday",
          startTime: "10:00:00",
          endTime: "18:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[1].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "wednesday",
          startTime: "10:00:00",
          endTime: "18:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[1].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "thursday",
          startTime: "10:00:00",
          endTime: "18:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: usersData[1].id,
          organizationId: null,
          eventId: null,
          dayOfWeek: "friday",
          startTime: "10:00:00",
          endTime: "18:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },

        // ========== ORGANIZATIONAL AVAILABILITY - Centro Clínico CaracasMed ==========
        // Monday to Saturday, 8:00 - 20:00 (Extended hours)
        {
          userId: null,
          organizationId: organizationsData[0].id,
          eventId: null, // Global for all clinic events
          dayOfWeek: "monday",
          startTime: "08:00:00",
          endTime: "20:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[0].id,
          eventId: null,
          dayOfWeek: "tuesday",
          startTime: "08:00:00",
          endTime: "20:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[0].id,
          eventId: null,
          dayOfWeek: "wednesday",
          startTime: "08:00:00",
          endTime: "20:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[0].id,
          eventId: null,
          dayOfWeek: "thursday",
          startTime: "08:00:00",
          endTime: "20:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[0].id,
          eventId: null,
          dayOfWeek: "friday",
          startTime: "08:00:00",
          endTime: "20:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[0].id,
          eventId: null,
          dayOfWeek: "saturday",
          startTime: "08:00:00",
          endTime: "14:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },

        // ========== ORGANIZATIONAL AVAILABILITY - Pilates Caracas ==========
        // Monday to Saturday, 6:00 - 21:00 (Early morning to evening classes)
        {
          userId: null,
          organizationId: organizationsData[1].id,
          eventId: null,
          dayOfWeek: "monday",
          startTime: "06:00:00",
          endTime: "21:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[1].id,
          eventId: null,
          dayOfWeek: "tuesday",
          startTime: "06:00:00",
          endTime: "21:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[1].id,
          eventId: null,
          dayOfWeek: "wednesday",
          startTime: "06:00:00",
          endTime: "21:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[1].id,
          eventId: null,
          dayOfWeek: "thursday",
          startTime: "06:00:00",
          endTime: "21:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[1].id,
          eventId: null,
          dayOfWeek: "friday",
          startTime: "06:00:00",
          endTime: "21:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[1].id,
          eventId: null,
          dayOfWeek: "saturday",
          startTime: "07:00:00",
          endTime: "15:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },

        // ========== EVENT-SPECIFIC OVERRIDE - Editorial Anagrama Reunión ==========
        // Only Tuesday and Thursday afternoons (more restrictive than org-wide)
        {
          userId: null,
          organizationId: organizationsData[2].id,
          eventId: eventsData[4].id, // anagrama-reunion event
          dayOfWeek: "tuesday",
          startTime: "14:00:00",
          endTime: "18:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
        {
          userId: null,
          organizationId: organizationsData[2].id,
          eventId: eventsData[4].id,
          dayOfWeek: "thursday",
          startTime: "14:00:00",
          endTime: "18:00:00",
          validFrom: null,
          validUntil: null,
          isActive: true,
        },
      ])
      .returning();
    console.log(`✅ Created ${availabilitySchedulesData.length} availability schedules`);

    // ============================================================================
    // 11. BOOKINGS
    // ============================================================================
    console.log("📋 Seeding bookings...");
    const bookingsData = await db
      .insert(bookings)
      .values([
        // Reservas completadas
        {
          eventOptionId: eventOptionsData[0].id, // Consultoría 45min
          personId: personsData[0].id,
          date: "2026-01-15",
          timeSlot: "09:00:00",
          status: "completed",
          notes: "Consulta inicial. Cliente satisfecho con la sesión.",
        },
        {
          eventOptionId: eventOptionsData[2].id, // Coaching profesional
          personId: personsData[3].id,
          date: "2026-01-16",
          timeSlot: "14:00:00",
          status: "completed",
          notes: "Se discutieron estrategias de transición profesional.",
        },
        {
          eventOptionId: eventOptionsData[3].id, // Consulta médica 30min
          personId: personsData[1].id,
          date: "2026-01-17",
          timeSlot: "10:00:00",
          status: "completed",
          notes: "Chequeo de rutina. Todo normal.",
        },
        // Reservas confirmadas/programadas
        {
          eventOptionId: eventOptionsData[1].id, // Consultoría 1hr
          personId: personsData[2].id,
          date: "2026-01-22",
          timeSlot: "15:00:00",
          status: "confirmed",
          notes: "Sesión de seguimiento programada.",
        },
        {
          eventOptionId: eventOptionsData[5].id, // Pilates 1hr
          personId: personsData[5].id,
          date: "2026-01-23",
          timeSlot: "11:00:00",
          status: "confirmed",
          notes: "Primera clase de pilates.",
        },
        {
          eventOptionId: eventOptionsData[7].id, // Reunión editorial
          personId: personsData[4].id,
          date: "2026-01-24",
          timeSlot: "16:00:00",
          status: "pending",
          notes: "Revisión de manuscrito de novela.",
        },
        // Reserva cancelada
        {
          eventOptionId: eventOptionsData[4].id, // Consulta médica 1hr
          personId: personsData[1].id,
          date: "2026-01-18",
          timeSlot: "13:00:00",
          status: "cancelled",
          notes: "Paciente reprogramó para la próxima semana.",
        },
      ])
      .returning();
    console.log(`✅ Created ${bookingsData.length} bookings`);

    // ============================================================================
    // 12. PAYMENTS
    // ============================================================================
    console.log("💳 Seeding payments...");
    const paymentsData = await db
      .insert(payments)
      .values([
        // Payments for completed bookings
        {
          bookingId: bookingsData[0].id,
          personId: personsData[0].id,
          amountUsd: "75.00",
          amountBs: "2700.00",
          tasaCambio: "36.0000",
          currency: "USD",
        },
        {
          bookingId: bookingsData[1].id,
          personId: personsData[3].id,
          amountUsd: "80.00",
          amountBs: null,
          tasaCambio: null,
          currency: "USD",
        },
        {
          bookingId: bookingsData[2].id,
          personId: personsData[1].id,
          amountUsd: "50.00",
          amountBs: "1800.00",
          tasaCambio: "36.0000",
          currency: "BS",
        },
        // Payments for confirmed bookings (pre-paid)
        {
          bookingId: bookingsData[3].id,
          personId: personsData[2].id,
          amountUsd: "100.00",
          amountBs: null,
          tasaCambio: null,
          currency: "USD",
        },
        {
          bookingId: bookingsData[4].id,
          personId: personsData[5].id,
          amountUsd: "150.00",
          amountBs: null,
          tasaCambio: null,
          currency: "USD",
        },
      ])
      .returning();
    console.log(`✅ Created ${paymentsData.length} payments`);

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Durations: ${durationsData.length}`);
    console.log(`   Organizations: ${organizationsData.length}`);
    console.log(`   Clients: ${clientsData.length}`);
    console.log(`   Users: ${usersData.length}`);
    console.log(`   Persons (Customers): ${personsData.length}`);
    console.log(`   Events: ${eventsData.length}`);
    console.log(`   Event Options: ${eventOptionsData.length}`);
    console.log(`   Prices: ${pricesData.length}`);
    console.log(`   User-Customer Links: ${userCustomersData.length}`);
    console.log(`   Availability Schedules: ${availabilitySchedulesData.length}`);
    console.log(`   Bookings: ${bookingsData.length}`);
    console.log(`   Payments: ${paymentsData.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed function
seed()
  .then(() => {
    console.log("🏁 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
