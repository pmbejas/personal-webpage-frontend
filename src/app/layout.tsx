import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Pablo Bejas | ERP Privado",
  description: "Sistema Integral de Gestión de Clientes, Presupuestos, Proyectos y Agenda Comercial.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark w-full max-w-full overflow-x-clip">
      <body className="bg-[#0B0F17] text-neutral-100 min-h-screen w-full max-w-full overflow-x-clip antialiased selection:bg-sky-500/20 selection:text-sky-300">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            mobileOffset={12}
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#111827",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#F3F4F6",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
