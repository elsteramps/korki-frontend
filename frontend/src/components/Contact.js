// Importy React i biblioteki CSS
import React, { useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



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
      fetch("https://api.sorokokorki.com.pl/contact")
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
    
      const response = await fetch("https://api.sorokokorki.com.pl/contact", {
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
        <h2>Zarezerwuj swoją pierwszą lekcję już teraz! Wypełnij formularz!</h2>
        {/* Baner promocyjny */}
    <div
      style={{
        backgroundColor: "#ffe0e0",
        color: "#b30000",
        padding: "12px",
        borderRadius: "8px",
        fontWeight: "bold",
        marginBottom: "20px",
        textAlign: "center",
      }}
    >
      🎉 Skorzystaj z promocji! Do końca września obowiązują ceny z poprzedniego sezonu 🎉
    </div>

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

export default Contact