import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "../lib/auth/auth-context";
import { NotificationProvider } from "../lib/notifications/notification-context";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider> {/* [WAJIB ADA DI SINI] */}
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  );
}