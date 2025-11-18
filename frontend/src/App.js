import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./authLayout";
import Login from "./login";
import Registration from "./registration";
import Forget from "./forget";
import ResetPassword from "./resetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/registration"
          element={
            <AuthLayout>
              <Registration />
            </AuthLayout>
          }
        />
        <Route
          path="/forget"
          element={
            <AuthLayout>
              <Forget />
            </AuthLayout>
          }
        />

        <Route
          path="/resetPassword"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />
      </Routes>

      
    </BrowserRouter>
  );
}

export default App;