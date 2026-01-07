"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/validators";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError("Заполните все поля. Пароль — не короче 8 символов.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Не удалось зарегистрироваться");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      // В продакшене не логируем ошибки в консоль браузера
      console.error("Registration error:", err);
      setError("Что-то пошло не так. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6">
      <div className="card w-full p-10">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Task Manager
          </p>
          <h1 className="text-3xl font-semibold text-white">Регистрация</h1>
          <p className="text-sm text-slate-400">
            Создайте аккаунт, чтобы собрать задачи в одном месте.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Имя</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться?"
              required
            />
          </div>
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
              placeholder="Не менее 8 символов"
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
            {loading ? "Создаем..." : "Зарегистрироваться"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Уже есть аккаунт?{" "}
          <Link href="/signin" className="text-blue-300 hover:text-blue-200">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
