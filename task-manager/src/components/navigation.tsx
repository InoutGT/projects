"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Главная" },
    { href: "/tasks", label: "Задачи" },
    { href: "/projects", label: "Проекты" },
  ];

  return (
    <nav className="flex gap-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "primary" : "ghost"}
            className={pathname === item.href ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
