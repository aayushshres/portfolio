import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";

/**
 * App-wide shell. Wraps every route in shared providers so the public site
 * and the admin routes read and write the same state.
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <Outlet />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
