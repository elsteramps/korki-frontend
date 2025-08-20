import React from "react";

function PrivacyPolicy() {
  return (
    <div className="privacy-policy" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>Polityka Prywatności</h1>
      <p>
        Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
        użytkowników strony internetowej <strong>SorokoKorki</strong>, dostępnej pod adresem 
        <a href="https://sorokokorki.com.pl"> sorokokorki.com.pl</a>.
      </p>

      <h2>1. Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest Ivan Sarokin, NIP: 8992832244, 
        e-mail kontaktowy:{" "}
        <a href="mailto:kontakt@sorokokorki.com.pl">kontakt@sorokokorki.com.pl</a>.
      </p>

      <h2>2. Zakres zbieranych danych</h2>
      <p>
        W trakcie korzystania ze strony możemy przetwarzać następujące dane:
      </p>
      <ul>
        <li>dane podawane dobrowolnie w formularzach kontaktowych (np. imię, adres e-mail),</li>
        <li>dane techniczne – adres IP, informacje o przeglądarce i systemie operacyjnym,</li>
        <li>dane dotyczące aktywności na stronie – odwiedzane podstrony, czas wizyty, kliknięcia.</li>
      </ul>

      <h2>3. Cele przetwarzania</h2>
      <p>Dane są przetwarzane w następujących celach:</p>
      <ul>
        <li>udzielanie odpowiedzi na zapytania przesyłane przez formularz kontaktowy,</li>
        <li>realizacja usług edukacyjnych,</li>
        <li>analiza statystyczna korzystania ze strony (Google Analytics),</li>
        <li>zapewnienie bezpieczeństwa i prawidłowego działania serwisu.</li>
      </ul>

      <h2>4. Google Analytics</h2>
      <p>
        Na naszej stronie korzystamy z usługi <strong>Google Analytics 4</strong>, dostarczanej przez Google LLC. 
        Google Analytics wykorzystuje pliki cookies w celu analizy ruchu na stronie. 
        Informacje generowane przez cookies (m.in. adres IP, typ urządzenia, aktywność na stronie) 
        mogą być przesyłane na serwery Google w Stanach Zjednoczonych. 
      </p>
      <p>
        Podstawą prawną przetwarzania danych w tym zakresie jest Twoja zgoda (art. 6 ust. 1 lit. a RODO).
        Zgody możesz udzielić lub wycofać w dowolnym momencie poprzez panel „Ustawienia cookies” 
        dostępny w stopce strony.
      </p>

      <h2>5. Pliki cookies</h2>
      <p>
        Nasza strona wykorzystuje pliki cookies w celu zapewnienia jej prawidłowego działania
        (cookies niezbędne). Za Twoją zgodą wykorzystywane są również cookies analityczne (Google Analytics).
      </p>
      <p>
        Pliki cookies możesz w każdej chwili usunąć lub zablokować w ustawieniach swojej przeglądarki, 
        jednak niektóre funkcje strony mogą wtedy działać nieprawidłowo.
      </p>

      <h2>6. Okres przechowywania danych</h2>
      <p>
        Dane osobowe przechowujemy przez okres niezbędny do realizacji celów, dla których zostały zebrane, 
        lub do momentu wycofania zgody. Ciasteczka analityczne mogą być przechowywane do 24 miesięcy.
      </p>

      <h2>7. Udostępnianie danych</h2>
      <p>
        Twoje dane nie są sprzedawane osobom trzecim. Mogą być przekazywane podmiotom, które świadczą usługi
        hostingowe, IT oraz dostawcom narzędzi analitycznych (Google).
      </p>

      <h2>8. Prawa użytkownika</h2>
      <p>
        Przysługują Ci następujące prawa:
      </p>
      <ul>
        <li>prawo dostępu do danych,</li>
        <li>prawo do sprostowania, usunięcia lub ograniczenia przetwarzania,</li>
        <li>prawo do przenoszenia danych,</li>
        <li>prawo do wycofania zgody,</li>
        <li>prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
      </ul>

      <h2>9. Zmiany polityki prywatności</h2>
      <p>
        Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
        Aktualna wersja dokumentu zawsze będzie publikowana na tej stronie.
      </p>
    </div>
  );
}

export default PrivacyPolicy;
