import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  interval,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================================================
// ENUMS
// ============================================================================

// Role enum for users (system-wide)
export const roleEnum = pgEnum('role', ['admin', 'user']);

// Organization role enum (role within an organization)
export const organizationRoleEnum = pgEnum('organization_role', [
  'owner',
  'admin',
  'member',
]);

// Booking status enum
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);

// Currency enum for payments
export const currencyEnum = pgEnum('currency', ['USD', 'BS', 'EUR']);

// Day of week enum (0 = Sunday, 6 = Saturday)
export const dayOfWeekEnum = pgEnum('day_of_week', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]);

// ============================================================================
// INDEPENDENT TABLES (No Foreign Keys)
// ============================================================================

/**
 * Users Table
 * System users who create and manage events (personal or as part of an organization)
 * Has 1:1 relationship with Client table for personal details
 */
export const users = pgTable(
  'User',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 320 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull().default('user'),
    organizationId: integer('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }), // nullable - user may not belong to an org
    organizationRole: organizationRoleEnum('organization_role'), // nullable - only set if in org
    clientId: integer('client_id')
      .notNull()
      .unique()
      .references(() => clients.id, { onDelete: 'cascade' }), // 1:1 total-total relationship
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('User_email_idx').on(table.email),
    organizationIdIdx: index('User_organization_id_idx').on(table.organizationId),
    clientIdIdx: uniqueIndex('User_client_id_idx').on(table.clientId),
  })
);

/**
 * Durations Table
 * Reusable time duration presets (e.g., 15min, 30min, 1hr)
 */
export const durations = pgTable('Duration', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  duration: interval('duration').notNull(), // e.g., '30 minutes', '1 hour'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Persons Table
 * Customers who book events
 */
export const persons = pgTable(
  'Person',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    ci: varchar('ci', { length: 10 }).unique(), // Venezuelan CI format
    email: varchar('email', { length: 320 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    ciIdx: uniqueIndex('Person_ci_idx').on(table.ci),
    emailIdx: index('Person_email_idx').on(table.email),
  })
);

/**
 * Organizations Table
 * Teams/organizations that can have multiple users and events
 */
export const organizations = pgTable('Organization', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Clients Table
 * Personal details for users (1:1 with User table)
 */
export const clients = pgTable(
  'Client',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    ci: varchar('ci', { length: 10 }).unique().notNull(), // Venezuelan CI format
    birthDate: date('birth_date').notNull(),
  },
  (table) => ({
    ciIdx: uniqueIndex('Client_ci_idx').on(table.ci),
  })
);

// ============================================================================
// DEPENDENT TABLES (With Foreign Keys)
// ============================================================================

/**
 * Events Table
 * Bookable events - can be personal (userId) or organizational (organizationId)
 * Constraint: Exactly one of userId or organizationId must be set (not both, not neither)
 */
export const events = pgTable(
  'Event',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }), // nullable - for personal events
    organizationId: integer('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }), // nullable - for org events
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    urlSlug: varchar('url_slug', { length: 100 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('Event_slug_idx').on(table.urlSlug),
    userIdIdx: index('Event_user_id_idx').on(table.userId),
    organizationIdIdx: index('Event_organization_id_idx').on(table.organizationId),
  })
);

/**
 * Event Options Table
 * Specific booking options/configurations for an event
 */
export const eventOptions = pgTable(
  'EventOption',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    eventId: varchar('event_id', { length: 255 })
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    durationId: integer('duration_id').references(() => durations.id), // No onDelete = 'no action'
    capacity: integer('capacity').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index('EventOption_event_id_idx').on(table.eventId),
    durationIdIdx: index('EventOption_duration_id_idx').on(table.durationId),
  })
);

/**
 * Prices Table
 * Pricing for event options over time periods
 */
export const prices = pgTable(
  'Price',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    eventOptionId: integer('event_option_id')
      .notNull()
      .references(() => eventOptions.id, { onDelete: 'cascade' }),
    usdAmount: numeric('usd_amount', { precision: 10, scale: 2 }).notNull(),
    validFrom: date('valid_from').notNull(),
    validUntil: date('valid_until'), // nullable = default/current
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    eventOptionIdIdx: index('Price_event_option_id_idx').on(table.eventOptionId),
    activeIdx: index('Price_active_idx').on(table.isActive),
    validFromIdx: index('Price_valid_from_idx').on(table.validFrom),
  })
);

/**
 * Bookings Table
 * Customer bookings for specific time slots
 */
export const bookings = pgTable(
  'Booking',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    eventOptionId: integer('event_option_id')
      .notNull()
      .references(() => eventOptions.id, { onDelete: 'restrict' }),
    personId: integer('person_id').references(() => persons.id, { onDelete: 'set null' }),
    date: date('date').notNull(),
    timeSlot: time('time_slot').notNull(),
    status: bookingStatusEnum('status').default('pending').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    eventOptionIdIdx: index('Booking_event_option_id_idx').on(table.eventOptionId),
    personIdIdx: index('Booking_person_id_idx').on(table.personId),
    dateTimeIdx: index('Booking_date_time_idx').on(table.date, table.timeSlot),
    statusIdx: index('Booking_status_idx').on(table.status),
  })
);

/**
 * Payments Table
 * Payment records for bookings
 */
export const payments = pgTable(
  'Payment',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    bookingId: integer('booking_id')
      .notNull()
      .unique() // 1:1 relationship
      .references(() => bookings.id, { onDelete: 'cascade' }),
    personId: integer('person_id').references(() => persons.id, { onDelete: 'set null' }),
    amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }).notNull(),
    amountBs: numeric('amount_bs', { precision: 10, scale: 2 }),
    tasaCambio: numeric('tasa_cambio', { precision: 10, scale: 4 }),
    currency: currencyEnum('currency').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    bookingIdIdx: uniqueIndex('Payment_booking_id_idx').on(table.bookingId),
    personIdIdx: index('Payment_person_id_idx').on(table.personId),
  })
);

/**
 * User_Customer Junction Table
 * N:N relationship between Users (service providers) and Persons (customers)
 * Tracks which customers belong to which users
 */
export const userCustomers = pgTable(
  'User_Customer',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    personId: integer('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('User_Customer_user_id_idx').on(table.userId),
    personIdIdx: index('User_Customer_person_id_idx').on(table.personId),
    uniqueUserPerson: uniqueIndex('User_Customer_user_person_idx').on(
      table.userId,
      table.personId
    ),
  })
);

/**
 * Availability Schedules Table
 * Defines when users or organizations are available for bookings
 *
 * Ownership Constraint: Exactly one of userId or organizationId must be set (not both, not neither)
 *
 * Scope:
 * - If eventId is NULL: Schedule applies to ALL events for the user/organization (global availability)
 * - If eventId is set: Schedule applies ONLY to that specific event (overrides global availability)
 *
 * Use Cases:
 * 1. Global: User works Mon-Fri 9-5 (eventId = null, applies to all their events)
 * 2. Event-specific: "Consultation" event only available Tue-Thu 2-4 (eventId set, overrides global)
 */
export const availabilitySchedules = pgTable(
  'AvailabilitySchedule',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }), // nullable - for personal schedules
    organizationId: integer('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }), // nullable - for org schedules
    eventId: varchar('event_id', { length: 255 }).references(() => events.id, {
      onDelete: 'cascade',
    }), // nullable - if null, applies to all events; if set, only to this event
    dayOfWeek: dayOfWeekEnum('day_of_week').notNull(), // monday, tuesday, etc.
    startTime: time('start_time').notNull(), // e.g., '09:00:00'
    endTime: time('end_time').notNull(), // e.g., '17:00:00'
    validFrom: date('valid_from'), // nullable - if null, always valid from the beginning
    validUntil: date('valid_until'), // nullable - if null, ongoing indefinitely
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('AvailabilitySchedule_user_id_idx').on(table.userId),
    organizationIdIdx: index('AvailabilitySchedule_organization_id_idx').on(
      table.organizationId
    ),
    eventIdIdx: index('AvailabilitySchedule_event_id_idx').on(table.eventId),
    dayOfWeekIdx: index('AvailabilitySchedule_day_of_week_idx').on(table.dayOfWeek),
    activeIdx: index('AvailabilitySchedule_active_idx').on(table.isActive),
  })
);

// ============================================================================
// DRIZZLE RELATIONS (for relational queries)
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  events: many(events),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [users.clientId],
    references: [clients.id],
  }),
  userCustomers: many(userCustomers),
  availabilitySchedules: many(availabilitySchedules),
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  user: one(users, {
    fields: [clients.id],
    references: [users.clientId],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  events: many(events),
  availabilitySchedules: many(availabilitySchedules),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [events.organizationId],
    references: [organizations.id],
  }),
  eventOptions: many(eventOptions),
  availabilitySchedules: many(availabilitySchedules),
}));

export const eventOptionsRelations = relations(eventOptions, ({ one, many }) => ({
  event: one(events, {
    fields: [eventOptions.eventId],
    references: [events.id],
  }),
  duration: one(durations, {
    fields: [eventOptions.durationId],
    references: [durations.id],
  }),
  prices: many(prices),
  bookings: many(bookings),
}));

export const durationsRelations = relations(durations, ({ many }) => ({
  eventOptions: many(eventOptions),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  eventOption: one(eventOptions, {
    fields: [prices.eventOptionId],
    references: [eventOptions.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  eventOption: one(eventOptions, {
    fields: [bookings.eventOptionId],
    references: [eventOptions.id],
  }),
  person: one(persons, {
    fields: [bookings.personId],
    references: [persons.id],
  }),
  payment: one(payments, {
    fields: [bookings.id],
    references: [payments.bookingId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  person: one(persons, {
    fields: [payments.personId],
    references: [persons.id],
  }),
}));

export const personsRelations = relations(persons, ({ many }) => ({
  bookings: many(bookings),
  payments: many(payments),
  userCustomers: many(userCustomers),
}));

export const userCustomersRelations = relations(userCustomers, ({ one }) => ({
  user: one(users, {
    fields: [userCustomers.userId],
    references: [users.id],
  }),
  person: one(persons, {
    fields: [userCustomers.personId],
    references: [persons.id],
  }),
}));

export const availabilitySchedulesRelations = relations(availabilitySchedules, ({ one }) => ({
  user: one(users, {
    fields: [availabilitySchedules.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [availabilitySchedules.organizationId],
    references: [organizations.id],
  }),
  event: one(events, {
    fields: [availabilitySchedules.eventId],
    references: [events.id],
  }),
}));

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

// Select types (for reading from DB)
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventOption = typeof eventOptions.$inferSelect;
export type Duration = typeof durations.$inferSelect;
export type Price = typeof prices.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Person = typeof persons.$inferSelect;
export type UserCustomer = typeof userCustomers.$inferSelect;
export type AvailabilitySchedule = typeof availabilitySchedules.$inferSelect;

// Insert types (for writing to DB)
export type NewUser = typeof users.$inferInsert;
export type NewClient = typeof clients.$inferInsert;
export type NewOrganization = typeof organizations.$inferInsert;
export type NewEvent = typeof events.$inferInsert;
export type NewEventOption = typeof eventOptions.$inferInsert;
export type NewDuration = typeof durations.$inferInsert;
export type NewPrice = typeof prices.$inferInsert;
export type NewBooking = typeof bookings.$inferInsert;
export type NewPayment = typeof payments.$inferInsert;
export type NewPerson = typeof persons.$inferInsert;
export type NewUserCustomer = typeof userCustomers.$inferInsert;
export type NewAvailabilitySchedule = typeof availabilitySchedules.$inferInsert;
