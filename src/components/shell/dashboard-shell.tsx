"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BackgroundEffects } from "@/components/ui/background-effects";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { CommandPalette } from "@/components/ui/command-palette";
import { GenerateModal } from "@/components/ui/generate-modal";
import { ToastProvider, useToast } from "@/components/ui/toasts";
import { createClient } from "@/lib/supabase/client";

const NAV_ROUTES: Record<string, string> = {
  inicio:      "/dashboard",
  desarrollos: "/desarrollos",
  analytics:   "/areas/analytics",
  contenido:   "/areas/contenido",
  social:      "/areas/social-media",
  paid:        "/areas/paid-media",
  creativo:    "/areas/creativo",
  diseno:      "/areas/diseno",
  conversion:  "/areas/conversion",
  atraccion:   "/areas/atraccion",
  seo:         "/areas/seo",
  video:       "/areas/video",
  equipo:      "/equipo",
};

function pathToNav(pathname: string): string {
  if (pathname === "/dashboard") return "inicio";
  if (pathname.startsWith("/desarrollos")) return "desarrollos";
  if (pathname === "/equipo") return "equipo";
  if (pathname.startsWith("/areas/")) {
    const area = pathname.split("/areas/")[1]?.split("/")[0] ?? "";
    const map: Record<string, string> = { "social-media": "social", "paid-media": "paid" };
    return map[area] || area || "inicio";
  }
  return "inicio";
}

interface GenModal { open: boolean; des: string | null; type: string; }

function ShellInner({ userEmail, children }: { userEmail?: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [genModal, setGenModal] = useState<GenModal>({ open: false, des: null, type: "post" });
  const toast = useToast();

  const activeNav = pathToNav(pathname);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const navigate = useCallback((view: string, slug?: string) => {
    if (view === "dashboard") {
      router.push("/dashboard");
    } else if (view === "desarrollos") {
      router.push("/desarrollos");
    } else if (view === "desarrollo" && slug) {
      router.push(`/desarrollos/${slug}`);
    } else if (NAV_ROUTES[view]) {
      router.push(NAV_ROUTES[view]);
    }
  }, [router]);

  const handleNavClick = useCallback((navId: string) => {
    const route = NAV_ROUTES[navId];
    if (route) router.push(route);
  }, [router]);

  const openGenerate = useCallback((des?: { nombre: string } | null, type = "post") => {
    setGenModal({ open: true, des: des?.nombre || null, type });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openGenerate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openGenerate]);

  useEffect(() => {
    const seen = sessionStorage.getItem("hu-welcome");
    if (!seen) {
      sessionStorage.setItem("hu-welcome", "1");
      setTimeout(() => {
        toast.push({
          type: "info",
          title: "Bienvenida de vuelta",
          message: "Pulsa ⌘K para buscar o ⌘N para generar contenido.",
          duration: 5500,
        });
      }, 600);
    }
  }, []);

  return (
    <>
      <BackgroundEffects />
      <div style={{ height: "100vh", display: "flex", position: "relative", zIndex: 1 }}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activeNav={activeNav}
          onNavClick={handleNavClick}
          onNavigate={navigate}
          onLogout={handleLogout}
          userEmail={userEmail}
        />
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "auto", position: "relative", zIndex: 1 }}>
          <Header
            view={activeNav}
            slug={pathname.split("/desarrollos/")[1] || null}
            onNavigate={navigate}
            onOpenCmdK={() => setCmdOpen(true)}
            onGenerate={() => openGenerate()}
          />
          <div className="routeEnter" style={{ flex: 1 }}>
            {children}
          </div>
        </main>
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigate={navigate}
        onGenerate={() => openGenerate()}
      />
      <GenerateModal
        open={genModal.open}
        onClose={() => setGenModal({ open: false, des: null, type: "post" })}
        defaultDesarrollo={genModal.des}
        defaultType={genModal.type}
        toast={toast}
      />
    </>
  );
}

export function DashboardShell({ userEmail, children }: { userEmail?: string; children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ShellInner userEmail={userEmail}>{children}</ShellInner>
    </ToastProvider>
  );
}
