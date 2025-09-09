const LocationStatus = ({ hasLocation, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <i className="fas fa-exclamation-circle text-red-600 text-xl mt-1 mr-3"></i>
          <div>
            <h3 className="font-semibold text-red-800">Location Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasLocation) {
    return (
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <i className="fas fa-check-circle text-green-600 text-xl mt-1 mr-3"></i>
          <div>
            <h3 className="font-semibold text-green-800">Location Enabled</h3>
            <p className="text-green-700 text-sm mt-1">Your location will be shared with emergency services</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LocationStatus;