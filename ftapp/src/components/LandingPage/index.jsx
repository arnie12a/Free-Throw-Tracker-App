import React, { useEffect, useState } from 'react';
//https://coolors.co/909cc2-084887-f58a07-f9ab55-f7f5fb
export default function LandingPage() {

  const [quote, setQuote] = useState('');
  const [player, setPlayer] = useState('');

  const freeThrowQuotes = [
    "Free throws win championships.",
    "Free throws are the difference between a good player and a great player.",
    "You can be great at a lot of things, but if you can't make free throws, you'll struggle in the big moments.",
    "Free throws are about focus, confidence, and routine. They’re not just another shot.",
    "In a close game, free throws are the key to victory.",
    "The difference between winning and losing often comes down to free throws."
    
  ]

  const playerName = [
    "Pat Riley", 
    "Larry Bird",
    "Shaquille O'Neal",
    "Steve Nash",
    "Phil Jackson",
    "Greg Popovich"
  ]

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 6);
    setQuote(freeThrowQuotes[randomNumber])
    setPlayer(playerName[randomNumber])
}, [])

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
              "{quote}"
            </p>
            <p className="mt-12 text-xl text-gray-700">
              - {player}
            </p>
          </div>
        </div>
      </div>
    </div>

  

  );
}
