import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "../socket";
import { prepareRecipe } from "../utils/recipeData";
import {
  addRecipeFromSocket,
  addRealtimeActivity,
  addRealtimeNotification,
  clearRealtimeToast,
  removeRecipeFromSocket,
  setConnectionStatus,
  setRealtimeToast,
  updateRecipeFromSocket,
} from "../redux/recipeSlice";
import ToastNotification from "./ToastNotification";

function RealtimeHub() {
  const dispatch = useDispatch();

  useEffect(() => {
    let hasConnected = false;
    let toastTimer;

    const showToast = (toast) => {
      window.clearTimeout(toastTimer);
      dispatch(setRealtimeToast({ ...toast, id: globalThis.crypto.randomUUID() }));
      toastTimer = window.setTimeout(() => dispatch(clearRealtimeToast()), 4200);
    };

    const onConnect = () => {
      dispatch(setConnectionStatus("connected"));
      socket.emit("client:ready");
      if (hasConnected) {
        showToast({ kind: "success", message: "Real-time connection restored" });
      }
      hasConnected = true;
    };
    const onConnectionStatus = (payload) => {
      if (payload?.status === "connected") dispatch(setConnectionStatus("connected"));
    };

    const onDisconnect = () => {
      dispatch(setConnectionStatus("disconnected"));
      if (hasConnected) {
        showToast({ kind: "warning", message: "Real-time connection unavailable" });
      }
    };

    const onConnectError = () => dispatch(setConnectionStatus("disconnected"));
    const onCreated = (payload) => {
      if (payload.recipe) dispatch(addRecipeFromSocket(prepareRecipe(payload.recipe)));
    };
    const onUpdated = (payload) => {
      if (payload.recipe) dispatch(updateRecipeFromSocket(prepareRecipe(payload.recipe)));
    };
    const onDeleted = (payload) => dispatch(removeRecipeFromSocket(payload.id));
    const onNotification = (notification) => {
      dispatch(addRealtimeNotification(notification));
      showToast({ kind: "success", message: notification.message });
    };
    const onActivity = (activity) => dispatch(addRealtimeActivity(activity));

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("connection:status", onConnectionStatus);
    socket.on("recipe:created", onCreated);
    socket.on("recipe:updated", onUpdated);
    socket.on("recipe:deleted", onDeleted);
    socket.on("notification", onNotification);
    socket.on("activity", onActivity);
    socket.connect();

    return () => {
      window.clearTimeout(toastTimer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("connection:status", onConnectionStatus);
      socket.off("recipe:created", onCreated);
      socket.off("recipe:updated", onUpdated);
      socket.off("recipe:deleted", onDeleted);
      socket.off("notification", onNotification);
      socket.off("activity", onActivity);
      socket.disconnect();
    };
  }, [dispatch]);

  return <ToastNotification />;
}

export default RealtimeHub;