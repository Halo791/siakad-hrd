'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { login, saveSession } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@siakad.local');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      saveSession(result);
      router.push('/admin');
    } catch {
      setError('Email atau password tidak valid');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-secondary">Login SIAKAD</h1>
        <p className="mt-1 text-sm text-slate-600">Silakan masuk untuk mengakses dashboard secure.</p>
        <label className="mt-4 block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded-lg border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="mt-3 block text-sm font-medium">Password</label>
        <input type="password" className="mt-1 w-full rounded-lg border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-60">
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
        <div className="mt-4 text-center text-sm">
          <Link href="/" className="text-secondary underline">Kembali ke beranda</Link>
        </div>
      </form>
    </main>
  );
}
