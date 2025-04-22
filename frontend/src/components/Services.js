import React from "react";

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

  export default Services