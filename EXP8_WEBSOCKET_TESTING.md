# Experiment 8: Enable Real-Time Communication via WebSockets

## Aim

To enable real-time communication between the client and server using WebSockets in the RecipeVerse AI application.

## Theory

WebSockets provide a persistent, bidirectional connection between a browser and a server. Unlike polling, the server can send an event to connected clients as soon as an application change occurs. Socket.IO builds on this communication model and provides named events, automatic reconnection, and a polling fallback when a WebSocket transport cannot be established.

In this application, the REST API remains responsible for validating and persisting recipe changes in MongoDB. After a successful create, update, or delete, the backend broadcasts a Socket.IO event. Connected clients receive that event, update the existing Redux recipe catalogue, and show a notification and activity entry without reloading the page.

## Technology Used

- React, Vite, and React Hooks
- Redux Toolkit
- Node.js, Express, and MongoDB/Mongoose
- Socket.IO and socket.io-client
- Postman for REST API testing

## Architecture

```text
Postman or application client
          |
          | POST / PUT / DELETE /api/recipes
          v
Express REST route --> Mongoose --> MongoDB
          |
          | successful operation only
          v
Socket.IO on the same HTTP server (port 5000)
          |
          | recipe event + notification + activity
          v
React Socket.IO singleton --> Redux recipe state --> cards and notification UI
```

The Express application and Socket.IO share one Node HTTP server and port. Socket connections are restricted to the configured `FRONTEND_URL`. Socket.IO does not provide recipe mutation routes; the existing REST API remains authoritative.

## Implementation

1. Install `socket.io` in `backend` and `socket.io-client` in the frontend.
2. Create the HTTP server from the existing Express app and attach Socket.IO to it.
3. Emit recipe events only after the corresponding Mongoose operation succeeds.
4. Use one centralized frontend socket instance with automatic reconnection.
5. Register listeners once in the app shell and remove them during cleanup.
6. Apply incoming recipe changes to the existing Redux slice by MongoDB `_id` to avoid duplicate cards.
7. Keep up to 20 client-side notifications and 10 recent activities. Toasts dismiss automatically.

## Socket.IO Events

| Direction | Event | Purpose |
| --- | --- | --- |
| Server → client | `connection:status` | Confirm a connected socket. |
| Client → server | `client:ready` | Announce that the client event listeners are ready. |
| Server → client | `recipe:created` | Add/upsert the created recipe in Redux. |
| Server → client | `recipe:updated` | Update the matching Redux recipe and open detail if selected. |
| Server → client | `recipe:deleted` | Remove the recipe from Redux. |
| Server → client | `notification` | Add a notification and show a toast. |
| Server → client | `activity` | Add a recent activity entry. |

Recipe event payloads include `id`, `name`, `country`, `category`, `message`, `timestamp`, and the recipe document. They contain no credentials or tokens.

## Testing Procedure

### Start the backend

```powershell
cd "D:\SEM-5 FULLSTACK\recipe-app-exp2\backend"
npm run dev
```

Expected terminal messages include `MongoDB connected successfully` and `RecipeVerse backend running on port 5000`.

### Start the frontend

In another terminal:

```powershell
cd "D:\SEM-5 FULLSTACK\recipe-app-exp2"
npm run dev
```

Open `http://localhost:5173`. The navbar should show `Connected` and a notification bell.

### Demonstrate with Postman

Keep the RecipeVerse frontend open and send requests to `http://localhost:5000/api/recipes`.

1. Send `POST /api/recipes` with a valid recipe JSON body. Expect `201 Created`, a new recipe card without a page refresh, a toast, a notification, and a live activity entry.
2. Copy the created document `_id` and send `PUT /api/recipes/{id}` with a valid updated recipe body. Expect the matching recipe card and notification to update immediately.
3. Send `DELETE /api/recipes/{id}`. Expect the recipe card to disappear and a delete notification/activity entry to appear.
4. Open a second browser window at `http://localhost:5173` and repeat a recipe write. Both clients should receive it.
5. Stop the backend. The status should change to `Disconnected`; restart it and wait for `Connected` without refreshing the frontend.

REST endpoints continue to perform the database work. Socket.IO broadcasts are notifications of successful REST operations; clients cannot mutate recipes through Socket.IO.

## Expected Output

- The frontend status changes between `Connecting...`, `Connected`, and `Disconnected`.
- A successful recipe create/update/delete produces its matching event and updates Redux-backed recipe cards immediately.
- The notification panel shows unread count, timestamps, mark-read, clear-all, and up to 10 live activities.
- A short toast appears for recipe activity and connection recovery.
- A failed or invalid REST operation does not produce a recipe event.
- Reconnection occurs automatically after the backend becomes available again.

## Actual Result

The backend started with MongoDB connected on port 5000 and the frontend connected without a second server port. A REST create returned `201`, update returned `200`, and delete returned `200`; a Socket.IO client received the matching `recipe:created`, `recipe:updated`, and `recipe:deleted` payloads. With the browser already open, the temporary recipe card appeared, changed after update, and disappeared after delete without a page refresh. Notifications and live activity updated for each operation. Two independent Socket.IO clients both received the same create event. The standalone `socketTest.js` connected with a real Socket ID, printed the actual create/update/delete events and notification/activity payloads for a temporary REST-created recipe, then logged disconnect, numbered reconnect attempts, and a successful reconnection with a new Socket ID after the backend restarted. The browser returned to `Connected` after the backend restart, and the mobile notification/activity panel opened at 390px without horizontal overflow.

## Screenshot Plan

- **SS1:** Navbar showing `Connected` and the notification bell.
- **SS2:** Backend terminal showing MongoDB connected and the port 5000 listener.
- **SS3:** Postman successful `POST /api/recipes` response (`201 Created`).
- **SS4:** Frontend toast, notification, and new recipe card without a refresh.
- **SS5:** Postman successful update and the refreshed card details in the already-open browser.
- **SS6:** Postman successful delete and the removed card in the browser.
- **SS7:** Frontend showing `Disconnected` while the backend is stopped.
- **SS8:** Frontend returning to `Connected` after backend restart, without refreshing.
- **SS9:** Two browser windows both showing the same incoming recipe event.
- **SS10:** Backend terminal showing `socket.io` installed with `npm install socket.io`.
- **SS11:** Frontend terminal showing `socket.io-client` installed with `npm install socket.io-client`.
- **SS12:** `socketTest.js` connected to the existing RecipeVerse backend with its actual Socket ID.
- **SS13:** Test-client terminal showing an actual `recipe:created` event and recipe payload fields.
- **SS14:** Test-client terminal showing an actual `recipe:updated` event.
- **SS15:** Test-client terminal showing an actual `recipe:deleted` event.
- **SS16:** RecipeVerse frontend showing the event-driven update without a page refresh.

## Manual Socket.IO Test Client

The standalone root-level `socketTest.js` is a Socket.IO client only. It connects to `http://localhost:5000` using the installed `socket.io-client` package. It does not start a server, connect to MongoDB, or create, update, or delete recipes. All recipe writes must go through Postman or the RecipeVerse REST API.

The packages used by Experiment 8 are installed with:

```powershell
cd "D:\SEM-5 FULLSTACK\recipe-app-exp2\backend"
npm install socket.io

cd "D:\SEM-5 FULLSTACK\recipe-app-exp2"
npm install socket.io-client
```

The data flow is:

```text
Postman / RecipeVerse
    ↓
REST API
    ↓
MongoDB
    ↓
Socket.IO Server
    ↓
socketTest.js
    ↓
Real-Time Event
```

### Manual demonstration

1. Start the backend:

   ```powershell
   cd "D:\SEM-5 FULLSTACK\recipe-app-exp2\backend"
   npm run dev
   ```

2. Start the frontend in another terminal:

   ```powershell
   cd "D:\SEM-5 FULLSTACK\recipe-app-exp2"
   npm run dev
   ```

3. Open RecipeVerse at `http://localhost:5173` and confirm the navbar says `Connected`.
4. Open another PowerShell terminal and start the standalone client:

   ```powershell
   cd "D:\SEM-5 FULLSTACK\recipe-app-exp2"
   node socketTest.js
   ```

   Alternatively, run `npm run socket-test`. The terminal prints its actual Socket ID and waits for server events.
5. Use the existing Postman collection to create a recipe through `POST /api/recipes`. Do not create it from the socket client.
6. Confirm the socket-test terminal prints the actual `recipe:created` payload fields and the frontend shows the recipe without a manual refresh.
7. Update that same recipe using `PUT /api/recipes/{id}` and confirm `recipe:updated` appears in the test-client terminal.
8. Delete it using `DELETE /api/recipes/{id}` and confirm `recipe:deleted` appears in the test-client terminal.
9. Confirm the frontend also reflects the update and deletion without refreshing. Press `Ctrl+C` in the socket-test terminal to disconnect the client.

The client displays a clear connection failure message if the backend is unavailable and automatically reports reconnect attempts. It sends only the safe `client:ready` values `client: "socket-test"` and `source: "manual-exp8-test"`; it does not send credentials or display secrets. Every displayed recipe event comes from the existing Socket.IO server.

## Demo Script

> Experiment 8 is about real-time communication using WebSockets. I integrated Socket.IO with the existing Express backend. When a recipe is created, updated, or deleted through the REST API, the server emits a real-time event after MongoDB succeeds. Connected RecipeVerse clients receive the event immediately, update the recipe list without refreshing, and show a notification and live activity entry. The navbar also shows connection status and automatically reflects reconnection. REST API handles the actual database operation, while Socket.IO notifies connected clients about the successful operation in real time.

## Conclusion

Socket.IO adds real-time recipe synchronization and connection feedback on top of the existing REST API. Database operations and existing REST behavior remain the source of truth; connected clients receive successful changes without reloading the page.