import { useState } from 'react';
import LocationAccess from '../components/getlocation';
import LocationStatus from '../components/LocationStatus';
import axios from "axios";
import { toast } from "react-toastify";
import { BACKEND_URL } from '../src/config';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
function Home() {
  const [isSosActive, setIsSosActive] = useState(false);
  const [hasLocationAccess, setHasLocationAccess] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nearestLocation, setNearestLocation] = useState('')
 const navigate = useNavigate()
  const handleSosClick = () => {
    setIsSosActive(true);

    console.log("SOS activated! Sending emergency alert...");
  };

  const handleCancelSos = () => {
    setIsSosActive(false);
    setEmergencyType('');
  };

  const handleLocationGranted = (coordinates) => {
    setCoords(coordinates);
    setHasLocationAccess(true);
    setLocationError(null);
  };

  const handleLocationDenied = (error) => {
    setHasLocationAccess(false);
    setLocationError(error);
  };

  const handleSubmitEmergency = async () => {
  if (!emergencyType || !contactNumber) {
    toast.error("Please fill out all fields");
    return;
  }

  try {
    const response = await axios.post(`${BACKEND_URL}/api/SOS`, {
      phoneNumber: contactNumber,
      username: "Nitin_sharma_Polist",
      emergencyType: emergencyType,
      message: "SOS Alert triggered from frontend",
      nearestLandmark: nearestLocation || "Not provided",
      latitude: 29.3255,
      longitude: 76.2998,
    });

    toast.success(`✅ Emergency alert sent! ID: ${response.data.alert._id}`);
    navigate(`/track/${response.data.alert._id}`);
    console.log("Alert sent:", response.data.alert);
  } catch (error) {
    console.error("Error sending SOS:", error);
    toast.error(error.response?.data?.error || "Failed to send emergency alert");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4">
       
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <i className="fas fa-life-ring text-3xl"></i>
            <h1 className="text-3xl font-bold">RescueLink</h1>
          </div>
          <p className="mt-2">Emergency Response System</p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {!isSosActive ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Emergency Assistance</h2>
                <p className="text-gray-600 mt-2">Press the button below in case of emergency</p>
              </div>

              {/* SOS Button */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={handleSosClick}
                  className="w-64 h-64 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse"
                >
                  <div className="text-center">
                    <span className="text-6xl font-bold block">SOS</span>
                    <span className="text-lg block mt-2">EMERGENCY</span>
                  </div>
                </button>
              </div>

              {/* Location Components */}
              {!hasLocationAccess && !locationError && (
                <LocationAccess 
                  onLocationGranted={handleLocationGranted} 
                  onLocationDenied={handleLocationDenied} 
                />
              )}
              
              <LocationStatus 
                hasLocation={hasLocationAccess} 
                error={locationError} 
              />
            </>
          ) : (
            <div className="text-center">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                <i className="fas fa-exclamation-triangle text-red-600 text-3xl mb-3"></i>
                <h2 className="text-xl font-bold text-red-800">Emergency Alert Activated</h2>
                <p className="text-red-700 mt-2">Help is on the way! Please provide details:</p>
                {coords && (
                  <p className="text-green-700 text-sm mt-2">
                    <i className="fas fa-map-marker-alt mr-1"></i> Your location will be shared with responders
                  </p>
                )}
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-gray-700 mb-2">Emergency Type</label>
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select emergency type</option>
                    <option value="landslide">Landslide</option>
                    <option value="Flood">Flood</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="accident">Accident</option>
                    <option value="fire">Fire</option>
                    <option value="crime">Crime in Progress</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                 <div>
                  <label className="block text-gray-700 mb-2">Nearest Location</label>
                  <input
                    type="tel"
                    value={nearestLocation}
                    onChange={(e) => setNearestLocation(e.target.value)}
                    placeholder="Nearest landmark or cross street"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                

                {!hasLocationAccess && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                      <p className="text-yellow-700 text-sm">
                        Location not available. Emergency services may have difficulty finding you.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={handleCancelSos}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitEmergency}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                  >
                    Send Alert
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
          <p>© 2025 RescueLink. Your safety is our priority.</p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="max-w-md w-full mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contacts</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <i className="fas fa-ambulance text-blue-600 text-2xl mb-2"></i>
            <p className="font-medium">Ambulance</p>
            <p className="text-blue-600">911</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <i className="fas fa-fire-extinguisher text-red-600 text-2xl mb-2"></i>
            <p className="font-medium">Fire Department</p>
            <p className="text-red-600">911</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <i className="fas fa-shield-alt text-purple-600 text-2xl mb-2"></i>
            <p className="font-medium">Police</p>
            <p className="text-purple-600">911</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <i className="fas fa-phone-alt text-green-600 text-2xl mb-2"></i>
            <p className="font-medium">RescueLink</p>
            <p className="text-green-600">1-800-HELP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;