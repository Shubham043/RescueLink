import { io } from "socket.io-client";
const PORT = import.meta.env.VITE_LOCAL_HOST;
console.log("PORT---->",PORT)
const socket = io(`${PORT}`,{
    transports:["websocket"],
    withCredentials:true
})

export default socket;