import Login from "./components/auth/login";
import Register from "./components/auth/register/register";
import Header from "./components/header";
import Home from "./components/home";

import AddFTSession from "./components/AddFTSession";
import FTLog from "./components/FTLog";
import FTSummary from "./components/FTSummary";

import { AuthProvider } from "./components/contexts/authContext";
import { useRoutes } from "react-router-dom";
import Leaderboard from "./components/Leaderboard";


function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />
    },
    {
      path: "/addFTSession",
      element: <AddFTSession />
    }, 
    {
      path: "/FTLog",
      element: <FTLog />
    },
    {
      path: "/FTSummary",
      element: <FTSummary />
    },
    {
      path: "/leaderboard",
      element: <Leaderboard />
    }
  ];

  let routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      {/* Ensure the header stays fixed with proper z-index */}
      <Header/>
      
      {/* Add padding to prevent overlap and allow scrolling */}
      <div className="pt-20 w-full flex-1 flex flex-col bg-gray-100">
        {routesElement}
      </div>
    </AuthProvider>
  );
}

export default App;
