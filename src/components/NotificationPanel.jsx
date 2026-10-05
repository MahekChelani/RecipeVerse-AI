import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearRealtimeNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../redux/recipeSlice";
import LiveActivity from "./LiveActivity";

function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.recipe.notifications);
  const activities = useSelector((state) => state.recipe.activities);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const buttonLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={buttonLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 transition hover:border-orange-300 hover:text-orange-700"
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-orange-600 px-1 text-[10px] font-bold leading-5 text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[70] w-[min(92vw,22rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div><h2 className="font-bold text-gray-900">Notifications</h2><p className="text-xs text-gray-500">{unreadCount} unread</p></div>
            <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full text-xl text-gray-500 hover:bg-gray-100">×</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet. Recipe changes will appear here in real time.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li key={notification.id} className={`px-4 py-3 ${notification.read ? "bg-white" : "bg-orange-50/70"}`}>
                    <button type="button" onClick={() => dispatch(markNotificationRead(notification.id))} className="w-full text-left">
                      <span className="flex items-start gap-2"><span className="mt-1 text-emerald-700" aria-hidden="true">✓</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-gray-900">{notification.message}</span><time className="mt-1 block text-xs text-gray-500" dateTime={notification.timestamp}>{new Date(notification.timestamp).toLocaleString()}</time></span>{!notification.read && <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {notifications.length > 0 && <div className="flex justify-between border-t border-gray-100 px-4 py-2"><button type="button" onClick={() => dispatch(markAllNotificationsRead())} className="text-xs font-semibold text-emerald-800 hover:underline">Mark all read</button><button type="button" onClick={() => dispatch(clearRealtimeNotifications())} className="text-xs font-semibold text-gray-500 hover:text-rose-700">Clear all</button></div>}
          <LiveActivity activities={activities} />
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;