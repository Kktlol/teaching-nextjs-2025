import { getDb } from "@/lib/db";
import Link from "next/link";
import { CreatePlaylistButton } from "./CreatePlaylistButton";
import { assertSessionUserId } from "@/actions/login";

export default async function PlaylistsPage() {
  const userId = await assertSessionUserId();

  const db = getDb();

  const playlists = await db
    .selectFrom("playlists")
    .selectAll()
    .where("user_id", "=", userId)
    .execute();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p className="text-2xl font-bold">Playlists</p>
        <CreatePlaylistButton />
        <ul>
          {playlists.map((playlist) => (
            <li className="list-disc" key={playlist.id}>
              <Link href={`/playlist/${playlist.id}`}>{playlist.name}</Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
