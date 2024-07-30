import Login from "./components/auth/login";
import Register from "./components/auth/register/register";
import Header from "./components/header";
import Home from "./components/home";

import AddFTSession from "./components/AddFTSession";
import FTLog from "./components/FTLog";
import FTSummary from "./components/FTSummary";

import { AuthProvider } from "./components/contexts/authContext";
import { useRoutes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Leaderboard from "./components/Leaderboard";

import { DataProvider } from "./components/contexts/dataContext";

function App() {
  const routesArray = [
    {
      path: "*",
      element: <LandingPage />,
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
      element: <Home />,
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
      <DataProvider>
      <Header />
        <div className="pt-16 w-full h-screen flex flex-col bg-gray-100">
            {routesElement}
        </div>
      </DataProvider>
        
    </AuthProvider>
  );
}

export default App;