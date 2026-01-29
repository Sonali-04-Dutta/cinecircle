import { BrowserRouter } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRoutes from "./routes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Toaster } from "react-hot-toast";

function AppWrapper() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AuthContext.Consumer>
          {({ user }) => (
            <SocketProvider user={user}>
              <BrowserRouter>
                <div className="flex flex-col min-h-screen">
                  <Toaster position="bottom-center" />
                  <Navbar />
                  <main className="flex-grow">
                    <AppRoutes />
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </SocketProvider>
          )}
        </AuthContext.Consumer>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default AppWrapper;
