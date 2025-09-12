import { useState } from 'react';

function Signup() {
  const [accountType, setAccountType] = useState('guardian');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    ngoName: '',
    ngoWebsite: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', { accountType, ...formData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our community as a Guardian or NGO</p>
        </div>
        
        {/* Account Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              type="button"
              onClick={() => setAccountType('guardian')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                accountType === 'guardian'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Guardian
            </button>
            <button
              type="button"
              onClick={() => setAccountType('ngo')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                accountType === 'ngo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              NGO
            </button>
          </div>
        </div>
        
        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              required
            />
          </div>
          
          {accountType === 'ngo' && (
            <>
              <div>
                <label htmlFor="ngoName" className="block text-sm font-medium text-gray-700 mb-1">
                  NGO Name
                </label>
                <input
                  id="ngoName"
                  name="ngoName"
                  type="text"
                  value={formData.ngoName}
                  onChange={handleInputChange}
                  placeholder="Enter your NGO name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  required={accountType === 'ngo'}
                />
              </div>
              
              <div>
                <label htmlFor="ngoWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                  NGO Website (Optional)
                </label>
                <input
                  id="ngoWebsite"
                  name="ngoWebsite"
                  type="url"
                  value={formData.ngoWebsite}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                />
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a>
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 shadow-md"
          >
            Create {accountType === 'guardian' ? 'Guardian' : 'NGO'} Account
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;