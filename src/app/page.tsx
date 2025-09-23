import { Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";
import { DB } from "@/lib/db-types";

export default async function Page() {
  const dialect = new SqliteDialect({
    database: new Database("db.sqlite"),
  });
  const db = new Kysely<DB>({
    dialect,
  });


  const albums = await db
    .selectFrom("albums")
    .innerJoin("authors", "authors.id", "albums.author_id")
    .select([
      "albums.id as id",
      "albums.name as album_name",
      "authors.name as author_name",
      "albums.release_date as release_date"
    ])
    .execute();

  return (
    <div className="font-sans min-h-screen p-8 pb-20 flex flex-col items-center">
      <img
        src="/images/iphon spotify.jfif"
        alt="Spotify Logo"
        width={120}
        height={120}
        className="mb-4"
      />
      <h1 className="text-4xl font-bold mb-8">Spotify</h1>
      <div className="flex flex-col gap-3 w-full max-w-xl">
        {albums.map(album => (
          <div key={album.id} className="flex items-center bg-white rounded-lg shadow p-2 min-h-[64px]">
            <div className="flex-1 pl-2">
              <div className="font-semibold text-base">{album.album_name}</div>
              <div className="text-gray-600 text-xs">by {album.author_name}</div>
              <div className="text-gray-400 text-xs">{new Date(album.release_date).getFullYear()}</div>
            </div>
            <div className="w-16 h-16 rounded ml-2 flex items-center justify-center bg-gray-300 border-4 border-black" />
          </div>
        ))}
      </div>
      <footer className="mt-12 flex gap-6 flex-wrap items-center justify-center">
        <p>Footer</p>
      </footer>
    </div>
  );
}
