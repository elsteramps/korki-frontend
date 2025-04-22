// Importy React i biblioteki CSS
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import "./index.css";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import Header from "./components/Header";
import Home from "./components/Home";
import ThankYou from "./components/ThankYou";
import ClientList from "./components/ClientsList";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";


// Komponent Reviews
// function Reviews() {
//   return (
//     <section id="reviews">
//       <h2>Opinie</h2>
//       <p>"Świetny korepetytor, bardzo polecam!" – Jan Kowalski</p>
//       <p>"Zajęcia są super, wszystko staje się jasne." – Anna Nowak</p>
//     </section>
//   );
// }

// Główny komponent aplikacji
function App() {
  return (
    <Router>
      <div>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
            path="/admin/clients"
            element={
              <ProtectedRoute>
                <ClientList />
              </ProtectedRoute>
            }
          />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/thank-you" element={<ThankYou />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Renderowanie aplikacji do DOM
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);