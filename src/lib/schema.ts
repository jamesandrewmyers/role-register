import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const eventInfo = sqliteTable("event_info", {
  id: text("id").primaryKey(), // UUID
  type: text("type").notNull(), // e.g. "processHtml"
  payload: text("payload").notNull(), // JSON string
  status: text("status").notNull().default("pending"), // pending | processing | done | error
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updated_at"),
  error: text("error"), // optional error message
  retries: integer("retries").default(0),
});

// -----------------------------
// data_received
// -----------------------------
export const dataReceived = sqliteTable("data_received", {
  id: text("id").primaryKey(), // UUID
  url: text("url").notNull(),
  title: text("title").notNull(),
  html: text("html").notNull(),
  text: text("text").notNull(),
  receivedAt: integer("received_at").notNull().default(sql`(strftime('%s','now'))`),
  processed: text("processed").default("false"), // "false", "true", "failed"
  processingNotes: text("processing_notes"), // error messages or processing info
});

// -----------------------------
// role_company
// -----------------------------
export const roleCompany = sqliteTable("role_company", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  website: text("website"),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
});

// -----------------------------
// role_listing
// -----------------------------
export const roleListing = sqliteTable("role_listing", {
  id: text("id").primaryKey(), // UUID
  companyId: text("company_id")
    .references(() => roleCompany.id, { onDelete: "cascade" }), // if company removed → listings removed
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Optional FK to role_location
  location: text("location").references(() => roleLocation.id, { onDelete: "set null" }),
  workArrangement: text("work_arrangement").notNull().default("on-site"), // "remote", "hybrid", "on-site"
  capturedAt: integer("captured_at").notNull().default(sql`(strftime('%s','now'))`),
  dataReceivedId: text("data_received_id").references(() => dataReceived.id, { onDelete: "set null" }),
  status: text("status").notNull().default("not_applied"), // "not_applying", "not_applied", "applied", "interviewed", "rejected", "offered", "declined"
  appliedAt: integer("applied_at"),
});


// -----------------------------
// role_callout
// -----------------------------
export const roleCallout = sqliteTable("role_callout", {
  id: text("id").primaryKey(), // UUID
  listingId: text("listing_id")
    .notNull()
    .references(() => roleListing.id, { onDelete: "cascade" }), // if listing removed → callouts removed
  content: text("content").notNull(),
});

// -----------------------------
// role_attachment
// -----------------------------
export const roleAttachment = sqliteTable("role_attachment", {
  id: text("id").primaryKey(), // UUID
  listingId: text("listing_id")
    .notNull()
    .references(() => roleListing.id, { onDelete: "cascade" }), // if listing removed → attachments removed
  type: text("type").notNull(), // "document", "link", "note"
  pathOrUrl: text("path_or_url"),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
});

// -----------------------------
// role_contact
// -----------------------------
export const roleContact = sqliteTable("role_contact", {
  id: text("id").primaryKey(), // UUID
  listingId: text("listing_id")
    .notNull()
    .references(() => roleListing.id, { onDelete: "cascade" }), // if listing removed → contacts removed
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
});

// -----------------------------
// role_event
// -----------------------------
export const roleEvent = sqliteTable("role_event", {
  id: text("id").primaryKey(), // UUID
  eventListingId: text("event_listing_id")
    .notNull()
    .references(() => roleListing.id, { onDelete: "cascade" }), // if listing removed → events removed
  eventType: text("event_type").notNull(), // "Interview", "Email", "Phone Call", "Phone Text", "Instant Message", "Application", "Offer", "Rejection", "Decline", "Not Applying"
  eventTitle: text("event_title").notNull(), // e.g. "Phone Screen"
  eventDate: integer("event_date"), // Unix timestamp
  eventNotes: text("event_notes"),
});

// -----------------------------
// role_qualifications
// -----------------------------
export const roleQualifications = sqliteTable("role_qualifications", {
  id: text("id").primaryKey(), // UUID
  listingId: text("listing_id")
    .notNull()
    .references(() => roleListing.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  type: text("type").notNull(), // "requirement" | "nice to have"
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
});

// -----------------------------
// role_state
// -----------------------------
export const roleState = sqliteTable("role_state", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
});

// -----------------------------
// role_location
// -----------------------------
export const roleLocation = sqliteTable("role_location", {
  id: text("id").primaryKey(), // UUID
  locationState: text("location_state")
    .notNull()
    .references(() => roleState.id, { onDelete: "cascade" }),
  city: text("city").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
});
