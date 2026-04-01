import { useState } from "react";
import { ConfigProvider } from "antd";

import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Student from "@/pages/Student";
import { getStoredUser, logout, type User } from "@/services/auth";

export default function App() {
  const [user, setUser] = useState<User | null>(getStoredUser);

  function handleLogout() {
    logout();
    setUser(null);
  }

  if (!user) {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: "#6366f1" } }}>
        <Login onLogin={setUser} />
      </ConfigProvider>
    );
  }

  if (user.role === "teacher") {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: "#6366f1" } }}>
        <Home userId={user.id} onLogout={handleLogout} />
      </ConfigProvider>
    );
  }

  return <Student userId={user.id} onLogout={handleLogout} />;
}
