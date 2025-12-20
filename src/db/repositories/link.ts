import { and, asc, eq, sql } from "drizzle-orm";

import { db, link, linkClickDaily } from "@/db";

export async function listByUserId(userId: string) {
  return db.select().from(link).where(eq(link.userId, userId)).orderBy(asc(link.position));
}

export async function listActiveByUserId(userId: string) {
  return db
    .select({
      id: link.id,
      title: link.title,
      url: link.url,
      position: link.position,
    })
    .from(link)
    .where(and(eq(link.userId, userId), eq(link.isActive, true)))
    .orderBy(asc(link.position));
}

export async function findByUserAndId(userId: string, linkId: string) {
  const result = await db
    .select()
    .from(link)
    .where(and(eq(link.id, linkId), eq(link.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

export async function findPublicById(linkId: string) {
  const result = await db
    .select({
      id: link.id,
      url: link.url,
      isActive: link.isActive,
    })
    .from(link)
    .where(eq(link.id, linkId))
    .limit(1);

  return result[0] ?? null;
}

export async function findByUserAndPosition(userId: string, position: number) {
  const result = await db
    .select()
    .from(link)
    .where(and(eq(link.userId, userId), eq(link.position, position)))
    .limit(1);

  return result[0] ?? null;
}

export async function getMaxPosition(userId: string) {
  const result = await db
    .select({ maxPos: sql<number>`COALESCE(MAX(${link.position}), -1)` })
    .from(link)
    .where(eq(link.userId, userId));

  return result[0]?.maxPos ?? -1;
}

export async function insertLink(values: {
  id: string;
  userId: string;
  title: string;
  url: string;
  position: number;
  isActive: boolean;
}) {
  const result = await db.insert(link).values(values).returning();
  return result[0];
}

export async function updateLinkById(
  linkId: string,
  values: Partial<{
    title: string;
    url: string;
    isActive: boolean;
  }>
) {
  const result = await db.update(link).set(values).where(eq(link.id, linkId)).returning();
  return result[0];
}

export async function deleteLinkById(linkId: string) {
  await db.delete(link).where(eq(link.id, linkId));
}

export async function shiftPositionsAfter(userId: string, position: number) {
  await db
    .update(link)
    .set({ position: sql`${link.position} - 1` })
    .where(and(eq(link.userId, userId), sql`${link.position} > ${position}`));
}

export async function setLinkPosition(linkId: string, position: number) {
  await db.update(link).set({ position }).where(eq(link.id, linkId));
}

// Swap positions of two links atomically
export async function swapPositions(
  linkId1: string,
  position1: number,
  linkId2: string,
  position2: number
) {
  await db.batch([
    db.update(link).set({ position: -1 }).where(eq(link.id, linkId1)),
    db.update(link).set({ position: position1 }).where(eq(link.id, linkId2)),
    db.update(link).set({ position: position2 }).where(eq(link.id, linkId1)),
  ]);
}

// Delete link and shift remaining positions down atomically
export async function deleteAndShiftPositions(
  linkId: string,
  userId: string,
  deletedPosition: number
) {
  await db.batch([
    db.delete(link).where(eq(link.id, linkId)),
    db.update(link)
      .set({ position: sql`${link.position} - 1` })
      .where(and(eq(link.userId, userId), sql`${link.position} > ${deletedPosition}`)),
  ]);
}

export async function incrementTotalClicks(linkId: string) {
  await db
    .update(link)
    .set({ totalClicks: sql`${link.totalClicks} + 1` })
    .where(eq(link.id, linkId));
}

export async function upsertDailyClicks(linkId: string, day: string) {
  await db
    .insert(linkClickDaily)
    .values({
      linkId,
      day,
      clicks: 1,
    })
    .onConflictDoUpdate({
      target: [linkClickDaily.linkId, linkClickDaily.day],
      set: { clicks: sql`${linkClickDaily.clicks} + 1` },
    });
}

// Record a click: increment total and update daily stats atomically
export async function recordClick(linkId: string, day: string) {
  await db.batch([
    db.update(link)
      .set({ totalClicks: sql`${link.totalClicks} + 1` })
      .where(eq(link.id, linkId)),
    db.insert(linkClickDaily)
      .values({ linkId, day, clicks: 1 })
      .onConflictDoUpdate({
        target: [linkClickDaily.linkId, linkClickDaily.day],
        set: { clicks: sql`${linkClickDaily.clicks} + 1` },
      }),
  ]);
}


