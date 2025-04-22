// Importy React i biblioteki CSS
import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ContactPopup from "./ContactPopup";

// Komponent Home
function Home() {
    return (
      <div className="home relative">
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
        <ContactPopup/>
      </div>
    );
  }

  export default Home