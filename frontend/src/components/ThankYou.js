import React from "react";
import { Link } from "react-router-dom";

function ThankYou() {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Dziękujemy za rezerwację!</h1>
        <p>Otrzymaliśmy Twoją wiadomość i wkrótce się z Tobą skontaktujemy.</p>
        <Link to="/" style={{ textDecoration: "none", fontSize: "18px", color: "#007BFF" }}>
          Wróć na stronę główną
        </Link>
      </div>
    );
  }

  export default ThankYou