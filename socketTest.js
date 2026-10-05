import { io } from "socket.io-client";

const serverUrl = process.env.RECIPEVERSE_SOCKET_URL || "http://localhost:5000";
const socket = io(serverUrl, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 5000,
});

let connectionStatus = "connecting";
let unavailableMessageShown = false;

function safeText(value) {
  return String(value).replaceAll("\r", " ").replaceAll("\n", " ").replaceAll("\t", " ").trim();
}

function printField(label, value) {
  if (value !== undefined && value !== null && value !== "") {
    console.log(`${label}: ${safeText(value)}`);
  }
}

function printRecipeEvent(eventName, payload, includeDetails) {
  const recipe = payload?.recipe || payload || {};
  const id = payload?.id ?? recipe?._id;

  console.log("\n--------------------------------------------------");
  console.log("REAL-TIME EVENT RECEIVED");
  console.log(`Event: ${eventName}\n`);

  printField("Recipe Name", recipe.name ?? payload?.name);
  if (includeDetails) {
    printField("Country", recipe.country ?? payload?.country);
    printField("Continent", recipe.continent ?? payload?.continent);
    printField("Category", recipe.category ?? payload?.category);
    printField("Meal", recipe.meal ?? payload?.meal);
  }
  printField("Recipe ID", id);
  console.log(`\n✓ ${eventName} event received successfully`);
  console.log("--------------------------------------------------\n");
}

function printTimestamp(payload) {
  printField("Time", payload?.timestamp ?? payload?.time);
}

function setConnectionStatus(nextStatus, message) {
  if (connectionStatus === nextStatus) return;
  connectionStatus = nextStatus;
  console.log(message);
}

console.log("==================================================");
console.log("RecipeVerse AI - WebSocket Test Client");
console.log("==================================================");
console.log(`Connecting to ${serverUrl}...`);

socket.on("connect", () => {
  unavailableMessageShown = false;
  setConnectionStatus("connected", "✓ Connected to RecipeVerse Socket.IO server");
  console.log(`Socket ID: ${socket.id}`);
  console.log("Listening for real-time events...\n");
  socket.emit("client:ready", {
    client: "socket-test",
    source: "manual-exp8-test",
  });
});

socket.on("connection:status", (payload) => {
  if (payload?.status === "connected" && connectionStatus !== "connected") {
    setConnectionStatus("connected", "✓ Connected to RecipeVerse Socket.IO server");
    console.log(`Socket ID: ${socket.id}`);
    console.log("Listening for real-time events...\n");
  }
});

socket.on("disconnect", (reason) => {
  const detail = reason ? " (" + safeText(reason) + ")" : "";
  setConnectionStatus("disconnected", "⚠ Socket disconnected" + detail);
});

socket.on("connect_error", () => {
  setConnectionStatus(
    "disconnected",
    "✗ Unable to connect to RecipeVerse Socket.IO server.\nPlease make sure backend is running on http://localhost:5000"
  );
  unavailableMessageShown = true;
});

socket.io.on("reconnect_attempt", (attempt) => {
  if (connectionStatus !== "connected") {
    console.log(`↻ Reconnecting... (attempt ${attempt})`);
  }
});

socket.io.on("reconnect", () => {
  if (unavailableMessageShown) console.log("✓ Connection restored");
});

socket.on("recipe:created", (payload) => {
  printRecipeEvent("recipe:created", payload, true);
});

socket.on("recipe:updated", (payload) => {
  printRecipeEvent("recipe:updated", payload, false);
});

socket.on("recipe:deleted", (payload) => {
  printRecipeEvent("recipe:deleted", payload, false);
});

socket.on("notification", (payload) => {
  console.log("\n--------------------------------------------------");
  console.log("NOTIFICATION");
  printField("Message", payload?.message);
  printTimestamp(payload);
  console.log("--------------------------------------------------\n");
});

socket.on("activity", (payload) => {
  console.log("\n--------------------------------------------------");
  console.log("LIVE ACTIVITY");
  printField("Action", payload?.action ?? payload?.type);
  printField("Recipe", payload?.recipeName ?? payload?.name ?? payload?.recipe?.name);
  printTimestamp(payload);
  console.log("--------------------------------------------------\n");
});

process.on("SIGINT", () => {
  console.log("\nDisconnecting manual Socket.IO test client.");
  socket.disconnect();
  process.exit(0);
});