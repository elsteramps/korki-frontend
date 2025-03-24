// Importy React i biblioteki CSS
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useNavigate, Navigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./index.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Jeśli token nie istnieje, przekieruj na stronę logowania
  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://korki-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem("token", token); // Zapisz token w localStorage
        navigate("/admin");
      } else {
        const { error } = await response.json();
        setError(error);
      }
    } catch (err) {
      setError("Błąd podczas logowania.");
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Logowanie</h1>
      <form onSubmit={handleLogin}>
        <label>
          Użytkownik:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Hasło:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Zaloguj</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

function AdminPanel() {
  const [disabledDates, setDisabledDates] = useState({ fullDays: [], hours: {} });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Usuń token JWT
    navigate("/login"); // Przekieruj na stronę logowania
  };
  

  useEffect(() => {
    fetch("https://korki-backend.onrender.com/disabled-dates")
      .then((response) => response.json())
      .then((data) => {
        setDisabledDates({
          fullDays: data.fullDays || [],
          hours: data.hours || {},
        });
      });
  }, []);

  const handleAdd = (isFullDay) => {
    if (!selectedDate) {
      alert("Wybierz datę!");
      return;
    }
  
    const payload = {
      date: selectedDate.toLocaleDateString("en-CA"), // Lokalna data w formacie YYYY-MM-DD
      time: isFullDay
        ? null
        : selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), // Lokalny czas w formacie HH:mm
    };
  
    console.log("Przesyłane dane:", payload); // Debugowanie
  
    fetch("https://korki-backend.onrender.com/admin/disable-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        if (isFullDay) {
          setDisabledDates((prev) => ({
            ...prev,
            fullDays: [...(prev.fullDays || []), payload.date],
          }));
        } else {
          setDisabledDates((prev) => ({
            ...prev,
            hours: {
              ...prev.hours,
              [payload.date]: [...(prev.hours[payload.date] || []), payload.time],
            },
          }));
        }
        setSelectedTime("");
      });
  };
  
  

  const handleRemove = (date, isFullDay, time = null) => {
    const payload = { date, time };
  
    fetch("https://korki-backend.onrender.com/admin/enable-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        if (isFullDay) {
          setDisabledDates((prev) => ({
            ...prev,
            fullDays: prev.fullDays.filter((d) => d !== date),
          }));
        } else {
          setDisabledDates((prev) => ({
            ...prev,
            hours: {
              ...prev.hours,
              [date]: prev.hours[date].filter((h) => h !== time),
            },
          }));
  
          // Usuń dzień, jeśli nie ma więcej godzin
          if (disabledDates.hours[date].length === 1) {
            const { [date]: _, ...remainingHours } = disabledDates.hours;
            setDisabledDates((prev) => ({
              ...prev,
              hours: remainingHours,
            }));
          }
        }
      });
  };

  return (
    <div>
      <h1>Panel Administracyjny</h1>
      <DatePicker
  selected={selectedDate}
  onChange={(date) => {
    setSelectedDate(date);
  }}
  showTimeSelect
  timeIntervals={30} // Wybór co 30 minut
  timeFormat="HH:mm"
  dateFormat="yyyy-MM-dd h:mm aa"
/>

      <button onClick={() => handleAdd(false)}>Dodaj Godzinę</button>
      <button onClick={() => handleAdd(true)}>Dodaj Cały Dzień</button>
  
      <h2>Niedostępne dni</h2>
      <ul>
        {disabledDates.fullDays.map((day, index) => (
          <li key={index}>
            {day}{" "}
            <button onClick={() => handleRemove(day, true)}>Usuń Cały Dzień</button>
          </li>
        ))}
      </ul>
  
      <h2>Niedostępne godziny</h2>
      {Object.keys(disabledDates.hours).map((day) => (
        <div key={day}>
          <h3>{day}</h3>
          <ul>
            {disabledDates.hours[day].map((hour, index) => (
              <li key={index}>
                {hour}{" "}
                <button onClick={() => handleRemove(day, false, hour)}>Usuń</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={handleLogout}>Wyloguj</button>
    </div>
  );  
}


// Komponent Header
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
    <header>
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
    </header>
  );
}

// Komponent Home
function Home() {
  return (
    <div className="home">
      {/* Sekcja powitalna */}
      <header className="home-header">
        <h1>Korepetycje z fizyki i matematyki dla szkół podstawowych, liceum, technikum oraz studentów uczelni</h1>
        <p>Od pięciui lat specjalizujemy się w korepetycjach z fizyki i matematyki, pomagając uczniom na każdym poziomie osiągać lepsze wyniki!</p>
      </header>

      {/* Sekcja opisowa */}
      <section className="home-services">
        <h2>Dlaczego warto wybrać nas?</h2>
        <div className="service-block">
          <h3>DARMOWA lekcja próbna</h3>
          <p>Oferujemy darmowe spotkanie, na którym poznamy się i wspólnie określimy cele, których chcesz osiągnąć oraz stworzymy na ich podstawie plan naszych działań, żeby te cele osiągnąć! Spotkanie zazwyczaj trwa nie więcej niż 30 minut.</p>
        </div>
        <div className="service-block">
          <h3>Nowoczesne metody nauczania</h3>
          <p>Specjalizujemy się przede wszystkim w prowadzeniu lekcji online, i w ciągu pięciu lat zdążyliśmy przekonać wielu ludzi, jakie to jest proste, efektywne, zabawne, a przy okazji, tańsze od tradycyjnych korepetycji z dojazdem, szczególnie w porze zimy! Brrrrr!</p>
          <p>Na lekcjach będziemy korzystać z prezentacji, gier, tablic interaktywnych, gdzie będziemy mogli wspólnie pracować nad materiałem, a nawet eksperymentów-online!</p>
        </div>
        <div className="service-block">
          <h3>Indywidualne podejście</h3>
          <p>Każdy uczeń jest inny, dlatego dostosowujmy program nauczania do Twoich potrzeb.</p>
        </div>
        <div className="service-block">
          <h3>Przygotowanie do matury</h3>
          <p>Zapewniamy kompleksowe przygotowanie do egzaminu maturalnego z fizyki, koncentrując się na najważniejszych zagadnieniach.</p>
        </div>
        <div className="service-block">
          <h3>Rozwiązywanie trudnych problemów</h3>
          <p>Nie ma problemów, których nie da się rozwiązać. Razem znajdziemy odpowiedzi na Twoje pytania!</p>
        </div>
      </section>

      {/* Sekcja opinii
      <section className="home-testimonials">
        <h2>Co mówią moi uczniowie?</h2>
        <blockquote>
          "Dzięki tym korepetycjom zdałem maturę z fizyki na 90%! Polecam każdemu!" - Jan Kowalski
        </blockquote>
        <blockquote>
          "Profesjonalizm i cierpliwość! Lekcje były zrozumiałe i ciekawe." - Anna Nowak
        </blockquote>
      </section> */}

      {/* Sekcja CTA */}
      <section className="home-cta">
        <h2>Gotowy na lepsze wyniki?</h2>
        <p>Skontaktuj się z nami i rozpocznij swoją podróż do sukcesu.</p>
        {/* <a href="/contact" className="cta-button">Skontaktuj się</a> */}
        <Link to="/contact" className="cta-button">Skontaktuj się</Link>
      </section>
    </div>
  );
}

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

// Komponent Services
function Services() {
  return (
    <section id="services">
      <h2>Usługi</h2>
      <table className="services-table">
        <thead>
          <tr>
            <th>Usługa</th>
            <th>Czas trwania</th>
            <th>Cena</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Zajęcia dla szkół podstawowych oraz szkół średnich na poziomie podstawowym</td>
            <td>60 minut</td>
            <td>60 PLN*</td>
          </tr>
          <tr>
            <td>Szkoła średnia (poziom rozszerzony oraz przygotowanie do matury)</td>
            <td>60 minut</td>
            <td>80 PLN*</td>
          </tr>
          <tr>
            <td>Studenci</td>
            <td>60 minut</td>
            <td>od 100 PLN*</td>
          </tr>
        </tbody>
        <p>*Ceny są podane przy odbyciu zajęć online. Istnieje możliwoźć dojazdu do ucznia w granicach województwa Dolnośląskiego. Koszt dojazdu jest zależny od lokalizacji ucznia i jest ustalany indywidualnie</p>
      </table>
    </section>
  );
}

// Komponent Contact
function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    selectedDate: null,
    message: "",
    consentEmail: false,
    consentPhone: false
  });

  const [disabledDates, setDisabledDates] = useState({ fullDays: [], hours: {} });
  const [isLoading, setIsLoading] = useState(true); // Zmienna stanu do śledzenia ładowania
  const [key, setKey] = useState(0);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    fetch("https://korki-backend.onrender.com/disabled-dates")
      .then((response) => response.json())
      .then((data) => {
        setDisabledDates({
          fullDays: data.fullDays || [],
          hours: data.hours || {},
        });
        setIsLoading(false); // Dane zostały załadowane
        if (!isLoading) {
          setKey((prev) => prev + 1);
        }
      })
      .catch((error) => {
        console.error("Błąd pobierania danych:", error);
        setIsLoading(false); // Nawet w przypadku błędu pozwalamy otworzyć kalendarz
      });
  }, []);
  


  const handleDateChange = (date) => {
    setFormData({ ...formData, selectedDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("/thank-you");

    const newErrors = {};
    if (!formData.consentEmail) {
      newErrors.consentEmail = "Musisz wyrazić zgodę na kontakt e-mail.";
    }
    if (!formData.consentPhone) {
      newErrors.consentPhone = "Musisz wyrazić zgodę na kontakt telefoniczny.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    console.log({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      selectedDate: formData.selectedDate ? `${formData.selectedDate.toLocaleDateString("en-CA")} ${formData.selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`
      : null,
      message: formData.message,
      consentEmail: formData.consentEmail,
      consentPhone: formData.consentPhone
    });
  
    if (!formData.selectedDate) {
      alert("Wybierz termin.");
      return;
    }
  
    const response = await fetch("https://korki-backend.onrender.com/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        selectedDate: formData.selectedDate ? `${formData.selectedDate.toLocaleDateString("en-CA")} ${formData.selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`
      : null,
        message: formData.message,
        consentEmail: formData.consentEmail,
        consentPhone: formData.consentPhone
      }),
    });
  
    if (response.ok) {
    } else {
      const error = await response.json();
      alert(`Błąd: ${error.error}`);
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Imię:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </label>
      <label>
        E-mail:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </label>
      <label>
        Telefon:
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </label>
      <label>
        Wybierz termin:
        <DatePicker
        key = {key}
  selected={formData.selectedDate}
  timeFormat="HH:mm"
  dateFormat="yyyy-MM-dd h:mm aa"
  onChange={(date) => setFormData({ ...formData, selectedDate: date })}
  showTimeSelect
  // dateFormat="Pp"
  filterTime={(time) => {
    if (!formData.selectedDate) return true;
  
    const selectedDay = formData.selectedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const hour = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }); // HH:mm
  
    // Sprawdź, czy cały dzień jest niedostępny
    if (disabledDates.fullDays.includes(selectedDay)) {
      return false;
    }
  
    // Sprawdź, czy godzina jest niedostępna
    if (disabledDates.hours[selectedDay] && disabledDates.hours[selectedDay].includes(hour)) {
      return false;
    }
  
    return true;
  }}
  
  excludeDates={(disabledDates.fullDays || []).map((date) => new Date(date))}
  disabled={isLoading}
/>
{isLoading && <p>Ładowanie dostępnych terminów...</p>}


      </label>
      {/* <label>
  Wybrana data i godzina:
  <input
    type="text"
    value={
      formData.selectedDate
        ? `${formData.selectedDate.toLocaleDateString()} ${formData.selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
        : "Nie wybrano"
    }
    readOnly
  />
</label> */}
      <label>
        Wiadomość:
        <textarea
          name="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </label>
      <div>
        <label className="checkbox-group">
        Wyrażam zgodę na kontakt e-mail.
          <input
            type="checkbox"
            checked={formData.consentEmail}
            onChange={(e) =>
              setFormData({ ...formData, consentEmail: e.target.checked })
            }
          />
        </label>
        {errors.consentEmail && <p className="error">{errors.consentEmail}</p>}
      </div>

      <div>
        <label className="checkbox-group">
        Wyrażam zgodę na kontakt telefoniczny.
          <input
            type="checkbox"
            checked={formData.consentPhone}
            onChange={(e) =>
              setFormData({ ...formData, consentPhone: e.target.checked })
            }
          />
        </label>
        {errors.consentPhone && <p className="error">{errors.consentPhone}</p>}
      </div>
      <button type="submit">Wyślij</button>
    </form>
  );
}


// Komponent Reviews
function Reviews() {
  return (
    <section id="reviews">
      <h2>Opinie</h2>
      <p>"Świetny korepetytor, bardzo polecam!" – Jan Kowalski</p>
      <p>"Zajęcia są super, wszystko staje się jasne." – Anna Nowak</p>
    </section>
  );
}

// Komponent Footer
function Footer() {
  return (
    <footer>
      <p>&copy; 2025 Ivan Sarokin, NIP: 8992832244. Wszelkie prawa zastrzeżone.</p>
    </footer>
  );
}

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
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reviews" element={<Reviews />} />
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