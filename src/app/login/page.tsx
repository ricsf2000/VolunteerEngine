import LoginForm from '@/app/login/login-form';
import { Suspense } from 'react';
import { auth } from '@/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const session = await auth();
  let expectedRole: 'admin' | 'volunteer' | undefined = (session?.user as any)?.role;

  if (!expectedRole) {
    const cb = searchParams?.callbackUrl ? decodeURIComponent(searchParams.callbackUrl) : '';
    if (cb.includes('/admin')) expectedRole = 'admin';
    else if (cb.includes('/volunteer')) expectedRole = 'volunteer';
  }

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <Suspense>
          <LoginForm expectedRole={expectedRole} />
        </Suspense>
      </div>
    </main>
  );
}
