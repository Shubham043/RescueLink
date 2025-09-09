import { useState } from 'react';

const LocationAccess = ({ onLocationGranted, onLocationDenied }) => {
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const requestLocationAccess = () => {
    if ("geolocation" in navigator) {
      // Close our custom alert and show browser's permission dialog
      setShowCustomAlert(false);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          console.log("Location granted:", coords);
          onLocationGranted(coords);
        },
        (error) => {
          const errorMessage = "Location access denied. Emergency response may be delayed.";
          setLocationError(errorMessage);
          console.error("Location access denied", error.message);
          onLocationDenied(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      const errorMessage = "Geolocation is not supported by your browser.";
      setLocationError(errorMessage);
      console.log("Geolocation not supported");
      onLocationDenied(errorMessage);
    }
  };

  return (
    <>
      {/* Custom Location Alert Modal */}
      {showCustomAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-map-marker-alt text-blue-600 text-2xl mr-3"></i>
              <h3 className="text-xl font-bold text-gray-800">Location Access Needed</h3>
            </div>
            <p className="text-gray-600 mb-6">
              To provide faster emergency response, RescueLink needs access to your location. 
              This allows us to send help to your exact location quickly.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCustomAlert(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-medium"
              >
                Not Now
              </button>
              <button
                onClick={requestLocationAccess}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Allow Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Access Button */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <i className="fas fa-map-marker-alt text-yellow-600 text-xl mt-1 mr-3"></i>
          <div>
            <h3 className="font-semibold text-yellow-800">Location Access</h3>
            <p className="text-yellow-700 text-sm mt-1">Enable location for faster emergency response</p>
          </div>
        </div>
        <button
          onClick={() => setShowCustomAlert(true)}
          className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium"
        >
          Enable Location
        </button>
      </div>

      {/* Location Error Display */}
      {locationError && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <i className="fas fa-exclamation-circle text-red-600 text-xl mt-1 mr-3"></i>
            <div>
              <h3 className="font-semibold text-red-800">Location Error</h3>
              <p className="text-red-700 text-sm mt-1">{locationError}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationAccess;