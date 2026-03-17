import { getDb } from "@/lib/db";
import Link from "next/link";
import { RemovePlaylistSongButton } from "./RemovePlaylistSongButton";
import { EditPlaylistButton } from "./EditPlaylistButton";
import { LikeSongButton } from "@/components/LikeSongButton";
import { getSessionUserId } from "@/actions/login";

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}` + ":" + `${seconds}`.padStart(2, "0");
}

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getSessionUserId();

  const { id } = await params;

  const playlistId = parseInt(id);

  if (isNaN(playlistId)) {
    return <div>Invalid Playlist id</div>;
  }

  const db = getDb();

  const playlist = await db
    .selectFrom("playlists")
    .selectAll()
    .where("id", "=", playlistId)
    .executeTakeFirst();

  if (playlist == null) {
    return <div>Playlist not found</div>;
  }

  const playlist_songs = await db
    .selectFrom("playlists_songs")
    .innerJoin("songs", "playlists_songs.song_id", "songs.id")
    .innerJoin("albums", "songs.album_id", "albums.id")
    .innerJoin("authors", "albums.author_id", "authors.id")
    .select([
      "playlists_songs.id",
      "playlists_songs.playlist_id",
      "songs.id as song_id",
      "songs.name",
      "songs.duration",
      "songs.album_id",
      "albums.name as album_name",
      "albums.author_id",
      "authors.name as author_name",
    ])
    .where("playlists_songs.playlist_id", "=", playlist.id)
    .execute();

  const likedSongs =
    userId != null
      ? await db
          .selectFrom("user_liked_songs")
          .select("song_id")
          .where("user_id", "=", userId)
          .execute()
      : null;

  const likedSongIds =
    likedSongs != null ? new Set(likedSongs.map((ls) => ls.song_id)) : null;

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p className="text-2xl font-bold">Playlist: {playlist.name}</p>
        <EditPlaylistButton
          playlistId={playlist.id}
          playlistName={playlist.name}
        />
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Album</th>
                <th>Author</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlist_songs.map((song, i) => (
                <tr key={song.id}>
                  <td>{i + 1}</td>
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
                  <td>{formatDuration(song.duration)}</td>
                  <td>
                    {likedSongIds != null ? (
                      <LikeSongButton
                        songId={song.song_id}
                        isLiked={likedSongIds.has(song.song_id)}
                      />
                    ) : null}
                    <RemovePlaylistSongButton
                      id={song.id}
                      playlistId={song.playlist_id}
                      songId={song.song_id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
