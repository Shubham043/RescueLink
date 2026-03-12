import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../src/utils/axiosInstance';
import socket from '../src/utils/socket';
import { toast } from "react-toastify";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createEmergencyIcon = (emergencyType) => {
  const colors = { medical: '#DC2626', fire: '#F59E0B', accident: '#8B5CF6', crime: '#1E40AF' };
  const color = colors[emergencyType] || '#DC2626';
  return new L.DivIcon({
    html: `<div style="background-color:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;box-shadow:0 0 10px rgba(0,0,0,0.5);">SOS</div>`,
    className: 'custom-emergency-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const Dashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [rescuerLocation, setRescuerLocation] = useState(null);

  async function getlocation() {
    try {
      const res = await axiosInstance.get('/api/SOS');
      setEmergencies(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch alerts");
    }
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setRescuerLocation([coords.latitude, coords.longitude]),
        () => setRescuerLocation([51.505, -0.09])
      );
    } else {
      setRescuerLocation([51.505, -0.09]);
    }
    getlocation();
  }, []);

  useEffect(() => {
    socket.on("newAlert", (data) => {
      setEmergencies(prev => [...prev, data.newAlert]);
    });
    return () => socket.off("newAlert");
  }, []);

  const handleAcceptEmergency = async (emergencyId) => {
  try {
    const res = await axiosInstance.patch(`/api/SOS/${emergencyId}/accept`);
    
    // update UI to reflect new status
    setEmergencies(emergencies.map(emergency =>
      emergency._id === emergencyId
        ? res.data.alert  // use updated alert from backend
        : emergency
    ));

    setSelectedEmergency(null);
    toast.success('Emergency accepted! Head to the location.');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to accept emergency');
  }
};

const handleResolveEmergency = async (emergencyId) => {
  try {
    await axiosInstance.patch(`/api/SOS/${emergencyId}/resolve`);

    // remove from list since it's resolved
    setEmergencies(emergencies.filter(e => e._id !== emergencyId));
    setSelectedEmergency(null);
    toast.success('Emergency marked as resolved!');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to resolve emergency');
  }
};

  const formatTime = (timestamp) => {
    const diffMinutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${Math.floor(diffHours / 24)} day(s) ago`;
  };

  const getEmergencyTypeLabel = (type) => {
    const labels = { medical: 'Medical Emergency', fire: 'Fire', accident: 'Accident', crime: 'Crime' };
    return labels[type] || 'Emergency';
  };

  if (!rescuerLocation) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your location...</p>
        </div>
      </div>
    );
  }

  return (
    // h-full fills the flex-1 slot provided by Layout
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Dashboard header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-life-ring text-2xl"></i>
            <h1 className="text-2xl font-bold">RescueLink Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <i className="fas fa-bell"></i>
              <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {emergencies?.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                <i className="fas fa-user"></i>
              </div>
              <span>Rescuer</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

          {/* Emergency List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4 flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex-shrink-0">Active Emergencies</h2>
            {emergencies?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-check-circle text-3xl mb-3 text-green-500"></i>
                <p>No active emergencies</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto  flex-1">
                {emergencies?.map(emergency => (
                  <div
                    key={emergency._id}
                    className={`p-3 rounded-lg cursor-pointer border-l-4 ${
                      selectedEmergency?._id === emergency._id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-red-500'
                    }`}
                    onClick={() => setSelectedEmergency(emergency)}
                  >
                    <div className="flex justify-between  items-start">
                      <div>
                        <h3 className="font-semibold">{getEmergencyTypeLabel(emergency.emergencyType)}</h3>
                        <p className="text-sm text-gray-600">{formatTime(emergency.timestamp)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        emergency.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {emergency.status}
                      </span>
                    </div>
                    <p className="text-sm mt-2 truncate">{emergency.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map + Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden min-h-0">
              <MapContainer center={rescuerLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={rescuerLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
                {emergencies?.map(emergency => (
                  <Marker
                    key={emergency._id}
                    position={[emergency.location.coordinates[1], emergency.location.coordinates[0]]}
                    icon={createEmergencyIcon(emergency.emergencyType)}
                    eventHandlers={{ click: () => setSelectedEmergency(emergency) }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-bold">{getEmergencyTypeLabel(emergency.emergencyType)}</h3>
                        <p>{emergency.message}</p>
                        <p className="text-sm text-gray-600">{formatTime(emergency.timestamp)}</p>
                        <button
                          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => handleAcceptEmergency(emergency._id)}
                        >
                          Accept Emergency
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {selectedEmergency && (
              <div className="p-4 border-t flex-shrink-0 max-h-64 overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{getEmergencyTypeLabel(selectedEmergency.emergencyType)}</h3>
                  <button onClick={() => setSelectedEmergency(null)} className="text-gray-500 hover:text-gray-700">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Reported</p>
                    <p>{formatTime(selectedEmergency.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p>{selectedEmergency.phoneNumber}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Details</p>
                  <p>{selectedEmergency.message}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAcceptEmergency(selectedEmergency._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                  >
                    Accept Emergency
                  </button>
                  <button
                    onClick={() => handleResolveEmergency(selectedEmergency._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;