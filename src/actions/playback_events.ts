"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { assertSessionUserId } from "./login";

export async function recordPlaybackStart(songId: number) {
  const userId = await assertSessionUserId();

  const db = getDb();
  await db
    .insertInto("playback_events")
    .values({
      user_id: userId,
      event_name: "playback_start",
      song_id: songId,
      event_date: Date.now(),
    })
    .execute();
  revalidatePath("/history");
}

export async function recordPlaybackEnd(songId: number) {
  const userId = await assertSessionUserId();

  const db = getDb();
  await db
    .insertInto("playback_events")
    .values({
      user_id: userId,
      event_name: "playback_end",
      song_id: songId,
      event_date: Date.now(),
    })
    .execute();
  revalidatePath("/history");
}

export async function recordPlaybackSkip(songId: number) {
  const userId = await assertSessionUserId();

  const db = getDb();
  await db
    .insertInto("playback_events")
    .values({
      user_id: userId,
      event_name: "playback_skip",
      song_id: songId,
      event_date: Date.now(),
    })
    .execute();
  revalidatePath("/history");
}
