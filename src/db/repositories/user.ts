import { and, eq, isNotNull } from "drizzle-orm";

import { db, user } from "@/db";
import * as linkRepository from "./link";

export async function findByUsername(username: string) {
  const normalizedUsername = username.toLowerCase();

  const result = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
    })
    .from(user)
    .where(
      and(
        eq(user.username, normalizedUsername),
        isNotNull(user.username)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getPublicProfileWithLinks(username: string) {
  const profileUser = await findByUsername(username);

  if (!profileUser) {
    return null;
  }

  const links = await linkRepository.listActiveByUserId(profileUser.id);

  return {
    user: profileUser,
    links,
  };
}
