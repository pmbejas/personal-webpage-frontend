"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShellAdmin } from "@/components/layout/ShellAdmin";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { estaAutenticado, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.replace("/login");
      const temporizador = setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }, 300);
      return () => clearTimeout(temporizador);
    }
  }, [estaAutenticado, cargando, router]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-neutral-400">Verificando autorización...</span>
        </div>
      </div>
    );
  }

  if (!estaAutenticado) {
    return null;
  }

  return <ShellAdmin>{children}</ShellAdmin>;
}
