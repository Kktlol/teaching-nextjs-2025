import { getDb } from "@/lib/db";
import Link from "next/link";

export default async function Playlists() {
  const db = getDb();

  const playlists = await db
    .selectFrom("playlists")
    .selectAll()
    .execute();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p className="text-4xl font-bold">Playlists</p>
        <div className="grid grid-cols-2 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="card w-64 bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="text-3xl font-bold">{playlist.name}</h2>
                <div className="mt-6">
                  <Link
                    className="btn btn-primary btn-block"
                    href={`/playlist/${playlist.id}`}
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>Footer</p>
      </footer>
    </div>
  );
}