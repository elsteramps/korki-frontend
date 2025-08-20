// Importy React i biblioteki CSS
import React, { useState, useEffect } from "react";
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
import PrivacyPolicy from "./components/PrivacyPolicy";
import CookieConsent from "./components/CookieConsent";


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

  const [consent, setConsent] = useState({ necessary: true, analytics: false, marketing: false });

  useEffect(() => {
    // Przykład: włącz GA dopiero po zgodzie "analytics"
    if (consent.analytics && !window.__gaLoaded) {
      const s = document.createElement('script');
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-7DVJBE9DNM';
      s.async = true;
      document.head.appendChild(s);
      window.__gaLoaded = true;
    
    s.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", "G-7DVJBE9DNM"); // <-- Twoje ID
      window.__gaLoaded = true;
    };

  }

    }, [consent]);

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
            <Route path="/polityka-prywatnosci" element={<PrivacyPolicy/>}/>
          </Routes>
        </main>
        <Footer />
        <CookieConsent onChange={setConsent} />
      </div>
    </Router>
  );
}

// Renderowanie aplikacji do DOM
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);