"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearTokens } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LogOut, Building2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
    } else if (user.role !== "SUPER_ADMIN") {
      router.push("/dashboard"); // usuário comum não acessa o admin master
    } else {
      setChecked(true);
    }
  }, [router]);

  function handleLogout() {
    clearTokens();
    router.push("/login");
  }

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Building2 className="size-5" />
          Admin Master — Plataforma
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4 mr-2" />
          Sair
        </Button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}