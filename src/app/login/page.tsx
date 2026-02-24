import { login } from "@/actions/login";
import { cookies } from "next/headers";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session");

  if (sessionId != null) {
    console.log(sessionId.value);
    console.log(parseInt(sessionId.value));
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <h3 className="font-bold text-lg mb-4">Login</h3>
          <form action={login}>
            <input
              className="input input-bordered w-full mb-4"
              type="text"
              name="email"
              placeholder="Email"
            />
            <input
              className="input input-bordered w-full mb-4"
              type="password"
              name="password"
              placeholder="Password"
            />

            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
