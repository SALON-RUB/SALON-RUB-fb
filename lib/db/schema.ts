import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  boolean,
  json,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth Tables
export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: boolean('emailVerified').default(false),
  image: text('image'),
  role: text('role').default('user'),
  banned: boolean('banned').default(false),
  banReason: text('banReason'),
  banExpires: timestamp('banExpires'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const session = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  expiresAt: timestamp('expiresAt'),
  token: text('token').unique(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: uuid('userId').notNull(),
})

export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: text('accountId'),
  providerId: text('providerId'),
  userId: uuid('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const verification = pgTable('verification', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier'),
  value: text('value'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// App Tables
export const salon = pgTable('salon', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  code: text('code').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const employee = pgTable('employee', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salonId').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  commission: decimal('commission', { precision: 5, scale: 2 }).default('0'),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const service = pgTable('service', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salonId').notNull(),
  name: text('name').notNull(),
  category: text('category'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').default(30),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const appointment = pgTable('appointment', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salonId').notNull(),
  employeeId: uuid('employeeId'),
  clientName: text('clientName').notNull(),
  clientPhone: text('clientPhone').notNull(),
  serviceId: uuid('serviceId').notNull(),
  date: timestamp('date').notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  status: text('status').default('scheduled'),
  notes: text('notes'),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const operatingHours = pgTable('operating_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salonId').notNull(),
  dayOfWeek: integer('dayOfWeek').notNull(),
  isOpen: boolean('isOpen').default(true),
  openTime: text('openTime').default('09:00'),
  closeTime: text('closeTime').default('18:00'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const expense = pgTable('expense', {
  id: uuid('id').primaryKey().defaultRandom(),
  salonId: uuid('salonId').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').defaultNow(),
  createdAt: timestamp('createdAt').defaultNow(),
})
