import React from "react";
import {Navigate} from "react-router-dom";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
  
    // Jeśli token nie istnieje, przekieruj na stronę logowania
    if (!token) {
      return <Navigate to="/login" />;
    }
  
    return children;
  }

  export default ProtectedRoute