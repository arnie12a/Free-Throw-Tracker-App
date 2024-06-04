import Login from "./components/auth/login";
import Register from "./components/auth/register/register";
import Header from "./components/header";
import Home from "./components/home";

import AddFTSession from "./components/AddFTSession";
import FTSummary from "./components/FTSummary";


import { AuthProvider } from "./components/contexts/authContext";
import { useRoutes } from "react-router-dom";

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
      element: <Home />,
    },
    {
      path: "/addFTSession",
      element: <AddFTSession />
    }, 
    {
      path: "/FTSummary",
      element: <FTSummary />
    }
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
        <Header />
        <div className="pt-16 w-full h-screen flex flex-col bg-gray-100">
            {routesElement}
        </div>
    </AuthProvider>
  );
}

export default App;