import React from 'react';

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 min-h-screen flex items-center justify-center">
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white animate-pulse">Free Throw Percentage Tracker</h1>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="md:w-1/2 text-center md:text-right md:pr-6 mb-6 md:mb-0">
            <img
              src="https://www.carlswebgraphics.com/basketball-graphics/free-throw-animation-2018.gif"
              alt="man shooting a free throw"
              width="400"
              className="mx-auto md:mx-0 transform transition-transform hover:scale-110"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left md:pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p className="text-lg text-gray-200">
              Our mission is to help basketball players of all levels improve their free throw shooting skills. Through personalized tracking and analytics, we aim to provide insights and strategies that will help you increase your free throw percentage and become a more reliable player on the court.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
