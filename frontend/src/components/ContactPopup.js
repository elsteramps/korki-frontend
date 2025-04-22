// Importy React i biblioteki CSS
import React, { useState, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Contact from "./Contact";

const ContactPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const contentRef = useRef(null);
  
    useEffect(() => {
      const hasSeenPopup = localStorage.getItem("hasSeenPopup");
  
      if (!hasSeenPopup) {
        const timer = setTimeout(() => {
          setIsVisible(true);
          localStorage.setItem("hasSeenPopup", "true");
        }, 10000); // 10 sekund
        return () => clearTimeout(timer);
      }
    }, []);
  
    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => setIsVisible(false), 300);
    };
  
    const handleOverlayClick = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        handleClose();
      }
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="popup-overlay" onMouseDown={handleOverlayClick}>
        <div
          ref={contentRef}
          className={`popup-content ${isClosing ? "popup-closing" : ""}`}
        >
          <button className="popup-close" onClick={handleClose}>
            &times;
          </button>
          <Contact />
        </div>
      </div>
    );
  };

  export default ContactPopup