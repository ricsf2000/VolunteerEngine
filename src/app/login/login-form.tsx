'use client';
 
import { useActionState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { authenticate } from '@/app/lib/services/actions';
 
export default function LoginForm({
  expectedRole,
}: {
  expectedRole?: 'admin' | 'volunteer';
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  const callbackUrl = searchParams.get('callbackUrl') || '/';
 
  const buttonColorClasses = expectedRole === 'admin'
    ? 'bg-green-600 hover:bg-green-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="currentPath" value={pathname} />
      <input type="hidden" name="redirectTo" value={callbackUrl} />
      <div className="rounded-lg bg-black shadow-md px-8 py-6">
        <h1 className="mb-6 text-3xl font-bold">
          Please log in to continue.
        </h1>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>
        </div>
        <button 
          type="submit"
          className={`mt-6 w-full ${buttonColorClasses} text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50`}
          disabled={isPending}
        >
          {isPending ? 'Signing in...' : 'Log in'}
        </button>
        {errorMessage && (
          <div className="mt-4 p-3">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}
