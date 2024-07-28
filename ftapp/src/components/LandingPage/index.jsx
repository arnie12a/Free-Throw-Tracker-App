import React from 'react';
//https://coolors.co/909cc2-084887-f58a07-f9ab55-f7f5fb
export default function LandingPage() {
  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center">
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray animate-pulse">Free Throw Percentage Tracker</h1>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="text-center md:pr-6 mb-6 md:mb-0">
            <img
              src="https://www.carlswebgraphics.com/basketball-graphics/free-throw-animation-2018.gif"
              alt="man shooting a free throw"
              width="400"
              className="mx-auto md:mx-0 transform transition-transform hover:scale-110"
            />
            <p className="mt-12 text-xl text-gray-700">
              “The key to success is making those free throws count.” – Michael Jordan
            </p>
          </div>
        </div>
      </div>
    </div>

  

  );
}
