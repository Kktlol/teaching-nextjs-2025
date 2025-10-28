import { getDb } from "@/lib/db";

export default async function PlaylistDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const db = getDb();

  const { id } = await params;

  const playlistId = parseInt(id);

  if (isNaN(playlistId)) {
    return <div>invalid id</div>;
  }

  const playlist = await db
    .selectFrom("playlists")
    .selectAll()
    .where("id", "=", playlistId)
    .executeTakeFirst();

  if (playlist === null || playlist === undefined) {
    return <div>playlist not found</div>;
  }

  const songs = await db
    .selectFrom("playlists_songs")
    .innerJoin("songs", "songs.id", "playlists_songs.song_id")
    .select([
      "songs.id",
      "songs.name",
    ])
    .where("playlists_songs.playlist_id", "=", playlistId)
    .execute();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          {playlist.name}
        </div>
        <div>
          <ul>
            {songs.map((song) => (
              <li key={song.id}>{song.name}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}