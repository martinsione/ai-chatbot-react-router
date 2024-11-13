import type { Route } from 'types:(auth)/login/+types.page';
import { ActionFunctionArgs, Link, redirect, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/custom/auth-form';

import { login } from '../actions';
import { Button } from '@/components/ui/button';

export async function action(args: ActionFunctionArgs) {
  const res = await login(args);
  if (res.status === 'success') {
    throw redirect('/', { headers: res.headers });
  }
  return res;
}

export default function Page({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();

  const [isSuccessful, setIsSuccessful] = useState(false);

  const state = actionData || { status: 'idle' };
  useEffect(() => {
    if (state.status === 'failed') {
      toast.error('Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      navigate('/');
    }
  }, [state.status, navigate]);

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        <AuthForm>
          <Button type="submit">Sign Up</Button>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              to="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
