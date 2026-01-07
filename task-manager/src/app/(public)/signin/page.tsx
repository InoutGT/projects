"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/lib/validators";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Введите email и пароль (не короче 8 символов)");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: searchParams.get("callbackUrl") ?? "/",
    });

    setLoading(false);

    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push(result?.url ?? "/");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6">
      <div className="card w-full p-10">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Task Manager
          </p>
          <h1 className="text-3xl font-semibold text-white">Вход</h1>
          <p className="text-sm text-slate-400">
            Используйте email и пароль, которые указали при регистрации.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Проверяем..." : "Войти"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Нет аккаунта?{" "}
          <Link href="/signup" className="text-blue-300 hover:text-blue-200">
            Зарегистрируйтесь
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6">
        <div className="card w-full p-10 text-center">
          <p className="text-slate-400">Загрузка...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
