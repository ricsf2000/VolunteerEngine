'use client';

import { useActionState } from 'react';
import { usePathname } from 'next/navigation';
import { registerUser } from '@/app/lib/actions';
import Link from 'next/link';

interface RegistrationFormProps {
  role: 'admin' | 'volunteer';
}

export default function RegistrationForm({ role }: RegistrationFormProps) {
  const pathname = usePathname();
  const [errorMessage, formAction, isPending] = useActionState(
    registerUser,
    undefined,
  );

  const getTitle = () => {
    return role === 'admin' ? 'Admin Registration' : 'Volunteer Registration';
  };

  const getButtonColor = () => {
    return role === 'admin' 
      ? 'bg-green-600 hover:bg-green-700' 
      : 'bg-blue-600 hover:bg-blue-700';
  };

  const getLoginLink = () => {
    return role === 'admin' ? '/admin' : '/volunteer';
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="currentPath" value={pathname} />
      <input type="hidden" name="role" value={role} />
      <div className="rounded-lg bg-black shadow-md px-8 py-6">
        <h1 className="mb-6 text-3xl font-bold">
          {getTitle()}
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
          <div>
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>
        </div>
        <button 
          type="submit"
          className={`mt-6 w-full ${getButtonColor()} text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50`}
          disabled={isPending}
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </button>
        {errorMessage && (
          <div className="mt-4 p-3">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link 
              href={getLoginLink()}
              className="text-blue-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}