// USE WSS://DOMAIN FOR PRODUCTION
// export const socket = io('http://192.168.43.94:3000');
export const socket = io("https://deploy-21ti.onrender.com", {
  //   autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  auth: {
    path: "/tour",
    token: localStorage.getItem("gG_a"),
  },
});
// const ss = window.ss;

