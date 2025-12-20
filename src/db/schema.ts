import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export {
  user,
  session,
  account,
  verification,
  sessionRelations,
  accountRelations,
} from "./auth-schema";
import { user, session, account } from "./auth-schema";

// Links table
export const link = sqliteTable(
  "link",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    position: integer("position").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    totalClicks: integer("total_clicks").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("link_user_id_idx").on(table.userId),
    uniqueIndex("link_user_position_uq").on(table.userId, table.position),
  ]
);

// Daily click analytics table
export const linkClickDaily = sqliteTable(
  "link_click_daily",
  {
    linkId: text("link_id")
      .notNull()
      .references(() => link.id, { onDelete: "cascade" }),
    day: text("day").notNull(), // 'YYYY-MM-DD' UTC
    clicks: integer("clicks").default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.linkId, table.day] })]
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  links: many(link),
}));

export const linkRelations = relations(link, ({ one, many }) => ({
  user: one(user, {
    fields: [link.userId],
    references: [user.id],
  }),
  clicksDaily: many(linkClickDaily),
}));

export const linkClickDailyRelations = relations(linkClickDaily, ({ one }) => ({
  link: one(link, {
    fields: [linkClickDaily.linkId],
    references: [link.id],
  }),
}));
