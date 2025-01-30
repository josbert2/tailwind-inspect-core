import React from 'react';
import { Inspector } from './components/Inspector';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Example content to inspect */}
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-white mb-6">
          Tailwind Inspector
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          A powerful tool for inspecting and modifying Tailwind CSS classes in real-time.
          Click the inspect button and select any element to get started.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">
              Real-time Updates
            </h2>
            <p className="text-blue-100">
              See your changes instantly as you modify classes and styles.
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-orange-600 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">
              Class Management
            </h2>
            <p className="text-pink-100">
              Add, remove, and toggle Tailwind classes with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Inspector Panel */}
      <Inspector />
    </div>
  );
}

export default App;