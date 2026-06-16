import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  boolean,
  varchar,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// App Tables
export const roleEnum = pgEnum('role', ['owner', 'employee'])

export const salons = pgTable('salons', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull().references(() => user.id),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: varchar('address', { length: 500 }),
  salonCode: varchar('salon_code', { length: 10 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salon_id').notNull().references(() => salons.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  duration: integer('duration').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salon_id').notNull().references(() => salons.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientPhone: varchar('client_phone', { length: 20 }).notNull(),
  appointmentDate: date('appointment_date').notNull(),
  appointmentTime: varchar('appointment_time', { length: 5 }).notNull(),
  duration: integer('duration'),
  price: decimal('price', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).default('agendado'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salon_id').notNull().references(() => salons.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: roleEnum('role').default('employee'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const earnings = pgTable('earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salon_id').notNull().references(() => salons.id, { onDelete: 'cascade' }),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  date: date('date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salon_id').notNull().references(() => salons.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  date: date('date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const businessHours = pgTable('business_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salon_id').notNull().references(() => salons.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  isOpen: boolean('is_open').default(true),
  openingTime: varchar('opening_time', { length: 5 }),
  closingTime: varchar('closing_time', { length: 5 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
