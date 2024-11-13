import type { Route } from 'types:(auth)/register/+types.page';
import { ActionFunctionArgs, Link, redirect, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/custom/auth-form';

import { register } from '../actions';
import { Button } from '@/components/ui/button';

export async function action(args: ActionFunctionArgs) {
  const res = await register(args);
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
    if (state.status === 'user_exists') {
      toast.error('Account already exists');
    } else if (state.status === 'failed') {
      toast.error('Failed to create account');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      toast.success('Account created successfully');
      setIsSuccessful(true);
      navigate('/');
    }
  }, [state, navigate]);

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
        <AuthForm>
          <Button type="submit">Sign Up</Button>

          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {'Already have an account? '}
            <Link
              to="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
            {' instead.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
