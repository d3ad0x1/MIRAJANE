import { AppRoutes } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import DockerEventsListener from "./components/DockerEventsListener";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* глобальный слушатель событий + голос Миры */}
        <DockerEventsListener />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
