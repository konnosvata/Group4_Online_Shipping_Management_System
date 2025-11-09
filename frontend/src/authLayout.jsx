import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AuthLayout = ({ children}) => {
  return (
    <div className="vh-100 position-relative">
      <div className="d-flex h-100">
        <div
          className="col-12 col-lg-6 position-relative overflow-hidden d-none d-lg-block"
          style={{
            backgroundImage: "url('/images/loginBackground.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "left",
          }}
        >
        </div>

        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center bg-lg-none bg-image-lg p-4">
          <div className="w-100" style={{ maxWidth: "600px" }}>
            {children}
          </div>
        </div>
      </div>

      <div className="position-absolute top-0 start-0 p-3">
        <a href="/">
          <img
            className="img-fluid mx-1 p-2 bg-white bg-opacity-50 rounded-end"
            src="/images/logo.png"
            alt="Logo"
            style={{ width: "200px", height: "auto" }}
          />
        </a>
      </div>
    </div>
  );
};

export default AuthLayout;