"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { DiagnosticIntake } from "@/components/crm/DiagnosticIntake";
export function DiagnosticForm({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      ref.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="relative m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 backdrop:bg-slate-950/50 sm:p-9"
    >
      <button
        aria-label="Fermer"
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full bg-slate-100 p-2"
      >
        <X size={18} />
      </button>
      <h2 className="mb-6 pr-10 font-heading text-2xl font-semibold text-[#133960]">
        Diagnostic CV ATS offert
      </h2>
      {isOpen && <DiagnosticIntake />}
    </dialog>
  );
}
