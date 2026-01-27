import { BrowserRouter } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import AppRoutes from "./routes";
import Navbar from "./components/layout/Navbar";

function AppWrapper() {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ user }) => (
          <SocketProvider user={user}>
            <BrowserRouter>
            <Navbar />
              <AppRoutes />
            </BrowserRouter>
          </SocketProvider>
        )}
      </AuthContext.Consumer>
    </AuthProvider>
  );
}

export default AppWrapper;
