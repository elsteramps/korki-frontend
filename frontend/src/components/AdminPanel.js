import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";

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
      fetch("https://api.sorokokorki.com.pl/disabled-dates")
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
    
      fetch("https://api.sorokokorki.com.pl/admin/disable-date", {
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
    
      fetch("https://api.sorokokorki.com.pl/admin/enable-date", {
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
          <ul>
          <li>
            <Link to="/admin/clients" className="text-blue-600 hover:underline">
              Zobacz listę klientów
            </Link>
          </li>
          </ul>
        <button onClick={handleLogout}>Wyloguj</button>
      </div>
    );  
  }

  export default AdminPanel