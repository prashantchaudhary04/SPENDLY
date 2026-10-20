import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth, DEMO_EMAIL, DEMO_PASSWORD } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/format.js';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  // After login succeeds, PublicRoute notices `user` is set and redirects us into the app.
  async function onSubmit({ email, password }) {
    try {
      await login(email, password);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    }
  }

  async function demoLogin() {
    setDemoLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
    } catch {
      toast.error('Demo account not found. Run "npm run seed" in the server folder.');
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track your spending"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        or
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <Button variant="secondary" onClick={demoLogin} loading={demoLoading} className="w-full">
        Try the demo account
      </Button>
    </AuthLayout>
  );
}
