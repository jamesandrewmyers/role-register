import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const eventInfo = sqliteTable("event_info", {
  id: text("id").primaryKey(), // UUID
  type: text("type").notNull(), // e.g. "processHtml"
  payload: text("payload").notNull(), // JSON string
  status: text("status").notNull().default("pending"), // pending | processing | done | error
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
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
  receivedAt: text("received_at").default("CURRENT_TIMESTAMP"),
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
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
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
  capturedAt: text("captured_at").default("CURRENT_TIMESTAMP"),
});

// -----------------------------
// role_application
// -----------------------------
export const roleApplication = sqliteTable("role_application", {
  id: text("id").primaryKey(), // UUID
  listingId: text("listing_id")
    .notNull()
    .references(() => roleListing.id, { onDelete: "cascade" }), // if listing removed → applications removed
  status: text("status").notNull(), // "not_applying", "in_progress", "rejected", "offered", "declined"
  appliedAt: text("applied_at"),
  updatedAt: text("updated_at"),
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
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
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
  listingId: text("listing_id")
    .notNull()
    .references(() => roleListing.id, { onDelete: "cascade" }), // if listing removed → events removed
  applicationId: text("application_id").references(() => roleApplication.id, {
    onDelete: "cascade", // if application removed → its events removed
  }),
  title: text("title").notNull(), // e.g. "Phone Screen"
  eventDate: text("event_date"), // ISO string
  notes: text("notes"),
});
