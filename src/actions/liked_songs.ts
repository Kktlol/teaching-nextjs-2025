"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { assertSessionUserId } from "./login";

export async function likeSong(songId: number) {
  const userId = await assertSessionUserId();
  
  const db = getDb();
  // Uses unique constraint - ignores if already liked (no extra SELECT needed)
  await db
    .insertInto("user_liked_songs")
    .values({ user_id: userId, song_id: songId })
    .onConflict((oc) => oc.columns(["user_id", "song_id"]).doNothing())
    .execute();
  revalidatePath("/");
}

export async function unlikeSong(songId: number) {
  const userId = await assertSessionUserId();

  const db = getDb();
  await db
    .deleteFrom("user_liked_songs")
    .where("user_id", "=", userId)
    .where("song_id", "=", songId)
    .execute();
  revalidatePath("/");
}
