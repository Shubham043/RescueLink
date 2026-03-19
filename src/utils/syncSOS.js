import axios from "axios";
import { getSOS,deleteSOS } from "./db";
const BACKEND_URL = import.meta.env.VITE_HOSTED_URL;


console.log("Backend URL", BACKEND_URL);

export const syncSOS = async () => {
  try {
    const queuedSOS = await getAllSOS();

    if (!queuedSOS.length) return;

    console.log("Syncing queued SOS:", queuedSOS);

    for (const sos of queuedSOS) {
      try {
        const { id, ...payload } = sos;

        await axios.post(`${BACKEND_URL}/api/SOS`, payload);

        // ✅ delete after successful send
        await deleteSOS(id);

        console.log("Synced and removed:", id);

      } catch (err) {
        console.error("Failed to sync SOS:", id, err);

        // ❌ don't delete → retry later
      }
    }

  } catch (err) {
    console.error("Sync process failed:", err);
  }
};