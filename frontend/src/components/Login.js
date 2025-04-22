import React, { useState } from "react";
import { useNavigate} from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch("https://api.sorokokorki.com.pl/login", {
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

  export default Login