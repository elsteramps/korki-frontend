import React from "react";

function Services() {
  return (
    <section id="services">
      <h2>Usługi</h2>
      <p style={{ color: "red", fontWeight: "bold", marginBottom: "1rem" }}>
        Pośpiesz się! Do końca września obowiązują ceny z poprzedniego sezonu
      </p>

      {/* Tabela: Zajęcia (istniejąca oferta) */}
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
            <td>55 minut</td>
            <td>
              60 PLN&nbsp;
              <span style={{ textDecoration: "line-through", color: "gray" }}>80 PLN</span>*
            </td>
          </tr>
          <tr>
            <td>Szkoła średnia (poziom rozszerzony oraz przygotowanie do matury)</td>
            <td>55 minut</td>
            <td>
              80 PLN&nbsp;
              <span style={{ textDecoration: "line-through", color: "gray" }}>100 PLN</span>*
            </td>
          </tr>
          <tr>
            <td>Studenci</td>
            <td>55 minut</td>
            <td>
              od 100 PLN&nbsp;
              <span style={{ textDecoration: "line-through", color: "gray" }}>od 120 PLN</span>*
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        *Ceny są podane przy odbyciu zajęć online. Istnieje możliwoźć dojazdu do ucznia w granicach województwa Dolnośląskiego. Koszt dojazdu jest zależny od lokalizacji ucznia i jest ustalany indywidualnie
      </p>

      {/* Nowa sekcja: Rozwiązanie sprawdzianów/kartkówek */}
      <h3 style={{ marginTop: "2rem" }}>Rozwiązanie sprawdzianów / kartkówek</h3>
      <p style={{ marginBottom: "0.75rem" }}>
        Bez konieczności umawiania lekcji. Gotowe w mniej niż <strong>12 godzin</strong> od
        momentu potwierdzenia zlecenia.
      </p>
      <table className="services-table">
        <thead>
          <tr>
            <th>Poziom</th>
            <th>Wariant</th>
            <th>Cena</th>
            <th>Szacowany czas realizacji</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan={2}>Podstawowy</td>
            <td>Z wyjaśnieniami i pełnym rozwiązaniem</td>
            <td>40 PLN</td>
            <td rowSpan={4}>do 12 godzin</td>
          </tr>
          <tr>
            <td>Bez wyjaśnień (same odpowiedzi)</td>
            <td>20 PLN</td>
          </tr>
          <tr>
            <td rowSpan={2}>Rozszerzony</td>
            <td>Z wyjaśnieniami i pełnym rozwiązaniem</td>
            <td>60 PLN</td>
          </tr>
          <tr>
            <td>Bez wyjaśnień (same odpowiedzi)</td>
            <td>30 PLN</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: "0.95rem", marginTop: "0.5rem" }}>
        Jak to działa? Prześlij zdjęcia/zadania oraz krótki opis wymagań (np. zakres materiału,
        termin). W odpowiedzi potwierdzę wycenę i orientacyjny czas wykonania. Płatność z góry.
      </p>
      {/* Jeśli masz formularz kontaktowy lub CTA, możesz podlinkować go poniżej: */}
      {/* <p><a className="btn" href="#kontakt">Zleć rozwiązanie</a></p> */}
    </section>
  );
}

export default Services;
