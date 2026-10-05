function timeAgo(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

function LiveActivity({ activities }) {
  return (
    <section className="border-t border-gray-100 px-4 py-4" aria-labelledby="live-activity-heading">
      <div className="mb-3 flex items-center justify-between">
        <h3 id="live-activity-heading" className="text-xs font-bold uppercase tracking-wider text-gray-500">Live activity</h3>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</span>
      </div>
      {activities.length === 0 ? (
        <p className="py-2 text-sm text-gray-500">Recipe changes will appear here.</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-5 text-gray-800">{activity.message}</p>
                <time className="mt-0.5 block text-xs text-gray-400" dateTime={activity.timestamp}>{timeAgo(activity.timestamp)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default LiveActivity;