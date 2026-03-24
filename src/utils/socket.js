import { io } from "socket.io-client";
import { BACKEND_URL } from "../config";
const PORT = BACKEND_URL
console.log("PORT---->",PORT)
const socket = io(`${PORT}`,{
    transports:["websocket"],
    withCredentials:true
})

export default socket;