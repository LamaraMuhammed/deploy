
// Get VAPID public key from the server (via an API request)
async function getKey() {
  const res = await fetch("/subscribe/get-key", { method: "GET" });
  const data = await res.json();
  return data.publicKey;
}

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

async function saveSubscription(subscription) {
  const res = await fetch("/subscribe/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription: subscription,
    }),
  });
  return res.json();
}

self.addEventListener("install", (event) => { self.skipWaiting(); });

self.addEventListener("activate", async (event) => {
  const key = await getKey();
  const subscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });
  
  const res = await saveSubscription(subscription);
  console.log(res);
});

self.addEventListener("push", (event) => {
  const data = event.data.json();;

  // Check if the data is valid
  if (!data || !data.body) return

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(data.title || "WebG", {
      actions: [
        {
          action: "open",
          title: "Open WebG",
        },
      ],
      data: {
        url: data.url || "/",
      },
      body: data.body,
      icon: "/image/" + data.imgUrl, // Optional
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  // Handle the click event
  const payload = event.notification.data;
  console.log(payload);
  if (event.action === "open") {
    // Handle the action if needed
    clients.openWindow(payload.url);
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      console.log(clients);
      for (const client of clientList) {
        // Check if the notification URL matches the client URL
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// PROFILE IMAGE CACHE
// self.addEventListener("fetch", (event) => {
//   // Check if the request is for a profile image
//   const url = event.request.url;
//   if (url.includes("/css/home") || url.includes("/js") || url.includes("/image/")) {
//     event.respondWith(
//       caches.open("profile-images").then((cache) => {
//         return cache.match(event.request).then((response) => {
//           if (response) {
//             return response; // Return cached image
//           }
//           return fetch(event.request).then((networkResponse) => {
//             cache.put(event.request, networkResponse.clone()); // Cache the new image
//             return networkResponse;
//           });
//         });
//       })
//     );
//   }

// });