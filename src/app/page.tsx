"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PaginaRaiz() {
  const { estaAutenticado, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando) {
      if (estaAutenticado) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [estaAutenticado, cargando, router]);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-neutral-400">Cargando ERP Privado...</span>
      </div>
    </div>
  );
}
