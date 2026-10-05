import { useSelector } from "react-redux";

const statusLabels = {
  connected: "Connected",
  connecting: "Connecting...",
  disconnected: "Disconnected",
};

function ConnectionStatus() {
  const status = useSelector((state) => state.recipe.connectionStatus);
  const currentStatus = statusLabels[status] ? status : "disconnected";
  const colors = {
    connected: "bg-emerald-500",
    connecting: "bg-amber-400 animate-pulse",
    disconnected: "bg-rose-500",
  };

  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700">
      <span className={`h-2 w-2 rounded-full ${colors[currentStatus]}`} />
      {statusLabels[currentStatus]}
    </span>
  );
}

export default ConnectionStatus;