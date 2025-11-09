import React from "react";
import AuthLayout from "./authLayout";
import Login from "./login";

function App() {
  return (
    <AuthLayout title="Welcome Back">
      <Login />
    </AuthLayout>
  );
}

export default App;
