import { getDb } from "@/lib/db";
import Link from "next/link";

export default async function HistoryPage() {
  const db = getDb();

  const playbackHistory = await db
    .selectFrom("playback_events")
    .innerJoin("songs", "playback_events.song_id", "songs.id")
    .innerJoin("albums", "songs.album_id", "albums.id")
    .innerJoin("authors", "albums.author_id", "authors.id")
    .select([
      "playback_events.id",
      "playback_events.event_date",
      "songs.name",
      "songs.album_id",
      "albums.name as album_name",
      "albums.author_id",
      "authors.name as author_name",
    ])
    .where("playback_events.user_id", "=", 1)
    .where("playback_events.event_name", "=", "playback_end")
    .orderBy("playback_events.event_date", "desc")
    .execute();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p className="text-2xl font-bold">Playback History</p>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Album</th>
                <th>Author</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {playbackHistory.map((song) => (
                <tr key={song.id}>
                  <td>{song.name}</td>
                  <td>
                    <Link href={`/album/${song.album_id}`}>
                      {song.album_name}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/author/${song.author_id}`}>
                      {song.author_name}
                    </Link>
                  </td>
                  <td>{new Date(song.event_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
