import React from "react";

function Services() {
  return (
    <section id="services">
      <h2>Usługi</h2>
      <p style={{ color: "red", fontWeight: "bold", marginBottom: "1rem" }}>
        Pośpiesz się! Do końca września obowiązują ceny z poprzedniego sezonu
      </p>
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
    </section>
  );
}

export default Services;
