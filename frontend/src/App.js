import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./authLayout";
import Login from "./login";
import Registration from "./registration";
import Forget from "./forget";
import ResetPassword from "./resetPassword";

// Customer area
import CustomerLayout from "./layout/CustomerLayout";
import Dashboard from "./pages_customer/Dashboard";
import CreateShipment from "./pages_customer/CreateShipment";
import SchedulePickup from "./pages_customer/SchedulePickup";
import Tracking from "./pages_customer/Tracking";
import Payments from "./pages_customer/Payments";
import ChatWithCourier from "./pages_customer/ChatWithCourier";
import AccountSettings from "./pages_customer/AccountSettings";
import ActiveShipments from "./pages_customer/activeShipments";

//driver
import DriverLayout from "./layout/DriverLayout";
import AssignedShipments from "./pages_Driver/AssignedShipments.jsx";
import UpdateShipment from "./pages_Driver/UpdateShipment.jsx";

//admin
import AdminLayout from "./layout/AdminLayout";
import MonitorDrivers from "./pages_Admin/MonitorDrivers";
import ShippingReport from "./pages_Admin/ShippingReport";
import UpdatePricing from "./pages_Admin/UpdatePricing";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH ROUTES */}
        <Route
          index
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        <Route
          path="registration"
          element={
            <AuthLayout>
              <Registration />
            </AuthLayout>
          }
        />

        <Route
          path="forget"
          element={
            <AuthLayout>
              <Forget />
            </AuthLayout>
          }
        />

        <Route
          path="resetPassword"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />

        {/* CUSTOMER ROUTES */}
        <Route path="customer" element={<CustomerLayout />}>

          {/* default page when visiting /customer */}
          <Route index element={<Dashboard />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-shipment" element={<CreateShipment />} />
          <Route path="activeShipments" element={<ActiveShipments />} />
          <Route path="schedule-pickup" element={<SchedulePickup />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="payments" element={<Payments />} />
          <Route path="chat" element={<ChatWithCourier />} />
          <Route path="settings" element={<AccountSettings />} />

        </Route>

        {/* DRIVER ROUTES */}
        <Route path="driver" element={<DriverLayout />}>

            {/* default page when visiting /driver */}
            <Route index element={<AssignedShipments />} />

            <Route path="assignedShipments" element={<AssignedShipments />} />
            <Route path="updateShipment" element={<UpdateShipment />} />

        </Route>

        {/* ADMIN ROUTES */}
        <Route path="admin" element={<AdminLayout />}>

            {/* default page when visiting /admin */}
            <Route index element={<MonitorDrivers />} />

            <Route path="monitorDrivers" element={<MonitorDrivers />} />
            <Route path="shippingReport" element={<ShippingReport />} />
            <Route path="updatePricing" element={<UpdatePricing />} />

        </Route>


      </Routes>
    </BrowserRouter>
  );
}

export default App;
