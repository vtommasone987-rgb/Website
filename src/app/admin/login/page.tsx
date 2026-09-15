import { loginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-950 px-4 py-16 -mx-6 -my-8">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Back office</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-50">Seller sign in</h1>
        <p className="mt-1 text-sm text-neutral-400">This area is for inventory management only.</p>

        <form action={loginAction} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="from" value={from ?? "/admin"} />
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-200">
            Username
            <input
              type="text"
              name="username"
              required
              autoFocus
              autoComplete="username"
              className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-brand-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-200">
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-brand-500"
            />
          </label>
          {error === "rate-limited" && (
            <p className="text-sm text-red-400">Too many attempts. Please wait a while before trying again.</p>
          )}
          {error && error !== "rate-limited" && (
            <p className="text-sm text-red-400">Incorrect username or password.</p>
          )}
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
