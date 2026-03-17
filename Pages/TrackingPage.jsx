import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../src/utils/socket';
import axiosInstance from '../src/utils/axiosInstance';

// ─── FLY TO MARKER ────────────────────────────────────────────────────────────
/*
  WHY separate component?
  - MapContainer renders once — you can't call map methods from outside
  - This component lives INSIDE MapContainer so it has access to the map instance
  - When rescuer location updates, map smoothly flies to new position
*/
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [position]);
  return null;
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const rescuerIcon = new L.DivIcon({
  html: `
    <div style="
      background: #2563eb;
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.3), 0 4px 12px rgba(0,0,0,0.4);
      animation: rescuerPulse 2s infinite;
    ">
      <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
    <style>
      @keyframes rescuerPulse {
        0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.4); }
        70% { box-shadow: 0 0 0 12px rgba(37,99,235,0), 0 4px 12px rgba(0,0,0,0.4); }
        100% { box-shadow: 0 0 0 0 rgba(37,99,235,0), 0 4px 12px rgba(0,0,0,0.4); }
      }
    </style>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const victimIcon = new L.DivIcon({
  html: `
    <div style="
      background: #dc2626;
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 4px rgba(220,38,38,0.3), 0 4px 12px rgba(0,0,0,0.4);
    ">
      <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    </div>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  loading: {
    color: 'bg-yellow-500',
    text: 'Connecting...',
    subtext: 'Please wait',
  },
  active: {
    color: 'bg-yellow-500 animate-pulse',
    text: 'Looking for rescuers...',
    subtext: 'Your alert has been sent. A rescuer will accept shortly.',
  },
  acknowledged: {
    color: 'bg-blue-500 animate-pulse',
    text: 'Rescuer is on the way!',
    subtext: 'Stay calm. Help is coming to your location.',
  },
  resolved: {
    color: 'bg-green-500',
    text: 'Help has arrived!',
    subtext: 'Your emergency has been resolved. Stay safe.',
  },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TrackingPage() {
  const { alertId } = useParams();
  const [alert, setAlert] = useState(null);
  const [rescuerLocation, setRescuerLocation] = useState(null);
  const [status, setStatus] = useState('loading');
  const locationIntervalRef = useRef(null);

  // ─── FETCH ALERT + JOIN SOCKET ROOM ────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch alert details to show victim location on map
        const res = await axiosInstance.get(`/api/SOS/${alertId}`);
        setAlert(res.data.data);
        setStatus(res.data.data.status);

        /*
          WHY join room here?
          - Once we have the alertId, victim joins the socket room
          - This is how they receive rescuer location updates
          - Room = "alert:alertId" — isolated to this emergency only
        */
        socket.emit('joinAlertRoom', alertId);
      } catch (err) {
        console.error('Failed to fetch alert:', err);
      }
    };

    init();

    // ─── SOCKET LISTENERS ──────────────────────────────────────────────────
    /*
      WHY listen for alertAccepted?
      - When rescuer accepts, victim's page should update immediately
      - Shows rescuer info (name, phone) without page refresh
    */
    socket.on('alertAccepted', (data) => {
      setStatus('acknowledged');
      setAlert(prev => ({
        ...prev,
        status: 'acknowledged',
        acceptedBy: data.acceptedBy,
      }));
    });

    /*
      WHY listen for rescuerLocationUpdate?
      - Every 5 seconds rescuer sends their location
      - Server relays it to this room
      - We update rescuerLocation state → marker moves on map
    */
    socket.on('rescuerLocationUpdate', ({ lat, lng }) => {
        console.log("hii", lat,lng)
      setRescuerLocation([lat, lng]);
    });

    socket.on('alertResolved', () => {
      setStatus('resolved');
      // Stop expecting location updates
      setRescuerLocation(null);
    });

    // Cleanup — leave room and remove listeners when page closes
    return () => {
      socket.emit('leaveAlertRoom', alertId);
      socket.off('alertAccepted');
      socket.off('rescuerLocationUpdate');
      socket.off('alertResolved');
    };
  }, [alertId]);

  // ─── DERIVED VALUES ────────────────────────────────────────────────────────
  const victimPosition = alert?.location?.coordinates
    ? [alert.location.coordinates[1], alert.location.coordinates[0]]
    : null;

  const mapCenter = rescuerLocation || victimPosition || [20.5937, 78.9629];

  const currentStatus = STATUS[status] || STATUS.active;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-gray-950">

      {/* Status Bar */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${currentStatus.color}`} />
          <div>
            <p className="text-white font-semibold text-sm">{currentStatus.text}</p>
            <p className="text-white/50 text-xs mt-0.5">{currentStatus.subtext}</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        {victimPosition ? (
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Fly to rescuer when location updates */}
            {rescuerLocation && <FlyToLocation position={rescuerLocation} />}

            {/* Victim marker */}
            <Marker position={victimPosition} icon={victimIcon}>
              <Popup>Your location</Popup>
            </Marker>

            {/* Rescuer marker — only shows after accepting */}
            {rescuerLocation && (
              <Marker position={rescuerLocation} icon={rescuerIcon}>
                <Popup>
                  {alert?.acceptedBy?.username || 'Rescuer'} is here
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Panel */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-white/10 p-4">
        <div className="max-w-2xl mx-auto">

          {/* Waiting state */}
          {status === 'active' && (
            <div className="text-center py-2">
              <p className="text-white/40 text-sm">
                Share this link with someone you trust:
              </p>
              <p className="text-blue-400 text-xs mt-1 font-mono break-all">
                {window.location.href}
              </p>
            </div>
          )}

          {/* Rescuer accepted */}
          {status === 'acknowledged' && alert?.acceptedBy && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {alert.acceptedBy.username?.[0]?.toUpperCase() || 'R'}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{alert.acceptedBy.username}</p>
                  <p className="text-white/50 text-xs">Rescuer assigned to you</p>
                </div>
              </div>
              {alert.acceptedBy.phone && (
                <a
                  href={`tel:${alert.acceptedBy.phone}`}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </a>
              )}
            </div>
          )}

          {/* Resolved */}
          {status === 'resolved' && (
            <div className="text-center py-2">
              <p className="text-green-400 font-semibold">✅ Emergency Resolved</p>
              <p className="text-white/40 text-xs mt-1">
                You are safe. Please contact authorities if needed.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}