import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X, ArrowUpRight, Menu } from "lucide-react";
/** Native modal: Escape, focus containment and focus restoration are browser-managed. */
export function DetailDialog({
  label,
  title,
  children,
  onOpen,
  closeOnNavigate = false,
}: {
  label: string;
  title: string;
  children: ReactNode;
  onOpen?: () => void;
  closeOnNavigate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => {
    if (!open || !closeOnNavigate) return;
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [open, closeOnNavigate]);
  return (
    <>
      <button
        ref={trigger}
        className="detail-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        {label}
        {closeOnNavigate ? <Menu size={17} /> : <ArrowUpRight size={14} />}
      </button>
      <dialog
        className="detail-dialog"
        ref={dialog}
        aria-labelledby={id}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
        onClick={(e) => {
          if (
            e.target === e.currentTarget ||
            (closeOnNavigate && (e.target as HTMLElement).closest("a"))
          )
            setOpen(false);
        }}
      >
        <div className="detail-dialog-surface">
          <header>
            <h2 id={id}>{title}</h2>
            <button
              className="icon-button"
              aria-label="Close details"
              autoFocus
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </header>
          <div className="detail-dialog-content">{children}</div>
        </div>
      </dialog>
    </>
  );
}
