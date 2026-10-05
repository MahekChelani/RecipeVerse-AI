import { useSelector } from "react-redux";

function ToastNotification() {
  const toast = useSelector((state) => state.recipe.realtimeToast);
  if (!toast) return null;

  const colors = toast.kind === "warning"
    ? "border-amber-200 bg-amber-50 text-amber-950"
    : "border-emerald-200 bg-white text-gray-900";

  return (
    <div className={`fixed bottom-4 right-4 z-[80] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${colors}`} role="status" aria-live="polite">
      <span aria-hidden="true" className="font-bold">{toast.kind === "warning" ? "!" : "✓"}</span>
      <p className="text-sm font-semibold">{toast.message}</p>
    </div>
  );
}

export default ToastNotification;