"use client";

import React, { useState, use } from "react";
import { DESARROLLOS } from "@/lib/data/desarrollos";
import { DesarrolloDetail } from "@/components/desarrollos/desarrollo-detail";
import { GenerateModal } from "@/components/ui/generate-modal";
import { ToastProvider, useToast } from "@/components/ui/toasts";
import { useRouter } from "next/navigation";
import type { Desarrollo } from "@/lib/data/desarrollos";

interface GenModal {
  open: boolean;
  des: string | null;
  type: string;
}

function DesarrolloPageInner({ slug }: { slug: string }) {
  const router = useRouter();
  const d = DESARROLLOS.find((x) => x.slug === slug) || DESARROLLOS[0];
  const [genModal, setGenModal] = useState<GenModal>({ open: false, des: null, type: "post" });
  const toast = useToast();

  const navigate = (view: string, targetSlug?: string) => {
    if (view === "dashboard" || view === "desarrollos") {
      router.push("/desarrollos");
    } else if (view === "desarrollo" && targetSlug) {
      router.push(`/desarrollos/${targetSlug}`);
    }
  };

  const openGenerate = (des: Desarrollo, type = "post") => {
    setGenModal({ open: true, des: des.nombre, type });
  };

  return (
    <>
      <DesarrolloDetail d={d} onNavigate={navigate} onGenerate={openGenerate} />
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

export default function DesarrolloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <ToastProvider>
      <DesarrolloPageInner slug={slug} />
    </ToastProvider>
  );
}
