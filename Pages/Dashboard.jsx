import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import socket from '../src/utils/socket';
console.log(socket);
// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom emergency icons
const createEmergencyIcon = (emergencyType) => {
  let color = '#DC2626'; // Default red
  
  switch(emergencyType) {
    case 'medical':
      color = '#DC2626'; // Red for medical
      break;
    case 'fire':
      color = '#F59E0B'; // Orange for fire
      break;
    case 'accident':
      color = '#8B5CF6'; // Purple for accident
      break;
    case 'crime':
      color = '#1E40AF'; // Blue for crime
      break;
    default:
      color = '#DC2626'; // Red for others
  }
  
  return new L.DivIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      ">SOS</div>
    `,
    className: 'custom-emergency-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const Dashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [rescuerLocation, setRescuerLocation] = useState(null);

  // Mock data - in a real app, this would come from an API
//   const mockEmergencies = [
//     {
//       id: 1,
//       type: 'medical',
//       location: { lat: 31.3430, lng: 76.7880 },
//       timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
//       contact: '+1234567890',
//       status: 'active',
//       details: 'Elderly person experiencing chest pain'
//     },
//   ];
 
 async function getlocation(){
    try {
      const res = await axios.get('https://rescuelink-backend.onrender.com/api/SOS')  
      console.log(res.data.data);
      setEmergencies(res.data.data)
    } catch (error) {
        console.log(error);
    }
  }
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRescuerLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting rescuer location:", error);
          setRescuerLocation([51.505, -0.09]);
        }
      );
    } else {
      setRescuerLocation([51.505, -0.09]);
    }
    getlocation();

  }, []);

  useEffect(() => {
    socket.on("newAlert",(data)=>{
      console.log("new alert data: ",data);
      setEmergencies(prev=> [...prev,data.newAlert]);
    })
  
    return () => {
      socket.off("newAlert")
    }
  }, [])
  
  

  const handleAcceptEmergency = (emergencyId) => {
    // In a real app, this would update the emergency status in the backend
    setEmergencies(emergencies.map(emergency => 
      emergency.id === emergencyId 
        ? { ...emergency, status: 'accepted', acceptedAt: new Date().toISOString() }
        : emergency
    ));
    setSelectedEmergency(null);
    alert(`Emergency #${emergencyId} accepted! Navigating to location...`);
  };

  const handleResolveEmergency = (emergencyId) => {
    // In a real app, this would update the emergency status in the backend
    setEmergencies(emergencies.filter(emergency => emergency.id !== emergencyId));
    setSelectedEmergency(null);
    alert(`Emergency #${emergencyId} resolved!`);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now - time) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getEmergencyTypeLabel = (type) => {
    switch(type) {
      case 'medical': return 'Medical Emergency';
      case 'fire': return 'Fire';
      case 'accident': return 'Accident';
      case 'crime': return 'Crime';
      default: return 'Emergency';
    }
  };

  if (!rescuerLocation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-life-ring text-2xl"></i>
            <h1 className="text-2xl font-bold">RescueLink Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <i className="fas fa-bell"></i>
              <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {emergencies.length}
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

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emergency List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Active Emergencies</h2>
            
            {emergencies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-check-circle text-3xl mb-3 text-green-500"></i>
                <p>No active emergencies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emergencies.map(emergency => (
                  <div 
                    key={emergency.id} 
                    className={`p-3 rounded-lg cursor-pointer border-l-4 ${
                      selectedEmergency?.id === emergency.id 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-gray-50 border-red-500'
                    }`}
                    onClick={() => setSelectedEmergency(emergency)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {getEmergencyTypeLabel(emergency.type)}
                        </h3>
                        <p className="text-sm text-gray-600">{formatTime(emergency.timestamp)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        emergency.status === 'active' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {emergency.status}
                      </span>
                    </div>
                    <p className="text-sm mt-2 truncate">{emergency.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="h-96">
              <MapContainer
                center={rescuerLocation}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Rescuer's location */}
                <Marker position={rescuerLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
                
                {/* Emergency markers */}
                {emergencies.map(emergency => (
                  <Marker 
                    key={emergency._id} 
                    position={[emergency.location.coordinates[1], emergency.location.coordinates[0]]}
                    icon={createEmergencyIcon(emergency.emergencyType)}
                    eventHandlers={{
                      click: () => setSelectedEmergency(emergency),
                    }}
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

            {/* Emergency Details */}
            {selectedEmergency && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{getEmergencyTypeLabel(selectedEmergency.emergencyType)}</h3>
                  <button 
                    onClick={() => setSelectedEmergency(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
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
                    onClick={() => handleResolveEmergency(selectedEmergency.id)}
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