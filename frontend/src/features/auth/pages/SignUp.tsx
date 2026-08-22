import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { getPasswordRules } from '../auth-service';
import { useAuth } from '../AuthProvider';
import type { SignUpData } from '../types';

const initialForm: SignUpData = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function SignUp() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [form, setForm] = useState<SignUpData>(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const update = <K extends keyof SignUpData>(field: K, value: SignUpData[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(form);

    if (!result.success) {
      setError(result.message ?? 'Unable to create your account');
      setIsSubmitting(false);
      return;
    }

    // Try logging the user in directly
    const loginResult = await signIn({
      email: form.email,
      password: form.password,
    });

    setIsSubmitting(false);

    if (loginResult.success) {
      navigate('/dashboard');
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        eyebrow="Account Created"
        title="Welcome to DayFlow!"
        description="Your account was successfully created."
      >
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <p className="text-sm leading-6 text-zinc-600">
            You can now sign in with your credentials to access your DayFlow dashboard.
          </p>
          <Link
            to="/signin"
            className="flex w-full justify-center rounded-xl bg-zinc-950 px-4 py-4 text-sm font-bold text-white hover:bg-zinc-800 transition shadow-md"
          >
            Go to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const passwordRules = getPasswordRules(form.password);

  return (
    <AuthLayout
      eyebrow="Create your workspace"
      title="Join DayFlow."
      description="Set up your DayFlow access in a few moments."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold text-zinc-900">
          Employee ID
          <input
            required
            value={form.employeeId}
            onChange={(event) => update('employeeId', event.target.value)}
            placeholder="EMP-0001"
            className="mt-2 w-full rounded-xl bg-white px-4 py-3.5 text-sm text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-zinc-950"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-zinc-900">
            First Name
            <input
              required
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
              placeholder="Alex"
              className="mt-2 w-full rounded-xl bg-white px-4 py-3.5 text-sm text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-zinc-950"
            />
          </label>
          <label className="block text-sm font-semibold text-zinc-900">
            Last Name
            <input
              required
              value={form.lastName}
              onChange={(event) => update('lastName', event.target.value)}
              placeholder="Morgan"
              className="mt-2 w-full rounded-xl bg-white px-4 py-3.5 text-sm text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-zinc-950"
            />
          </label>
        </div>

        <label className="block text-sm font-semibold text-zinc-900">
          Work Email
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="alex.morgan@company.com"
            className="mt-2 w-full rounded-xl bg-white px-4 py-3.5 text-sm text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-zinc-950"
          />
        </label>

        <div>
          <label className="block text-sm font-semibold text-zinc-900">
            Password
            <input
              required
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              placeholder="Create a secure password"
              className="mt-2 w-full rounded-xl bg-white px-4 py-3.5 text-sm text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-zinc-950"
            />
          </label>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-xs text-zinc-500">
            {passwordRules.map((rule) => (
              <li
                key={rule.label}
                className={rule.isSatisfied ? 'font-semibold text-green-700' : ''}
              >
                {rule.isSatisfied ? '✓' : '○'} {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <label className="block text-sm font-semibold text-zinc-900">
          Confirm Password
          <input
            required
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
            placeholder="Repeat your password"
            className="mt-2 w-full rounded-xl bg-white px-4 py-3.5 text-sm text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-zinc-950"
          />
        </label>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-xl bg-zinc-950 px-4 py-4 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-lg shadow-zinc-950/10 cursor-pointer"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link to="/signin" className="font-bold text-zinc-950 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
