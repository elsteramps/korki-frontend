import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";


function Header() {

    const [theme, setTheme] = useState('light');
  
    useEffect(() => {
      // Dodaj data-theme do elementu html
      document.documentElement.setAttribute('data-theme', theme);
      
      // Opcjonalnie: zapisz motyw w localStorage
      localStorage.setItem('theme', theme);
    }, [theme]);
  
    const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
  // Dodaj przycisk w headerze:
    return (
      <header className="main-header">
        <div className="header-wrapper">
        <Link to="/">
            <img src="/bird.png" alt="Logo" className="header-logo" />
        </Link>
        <nav>
          <ul>
            <li><Link to="/">Strona główna</Link></li>
            <li><Link to="/services">Usługi</Link></li>
            <li><Link to="/contact">Kontakt</Link></li>
          </ul>
        </nav>
        {/* <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'}
        </button> */}
        </div>
      </header>
    );
  }

  export default Header