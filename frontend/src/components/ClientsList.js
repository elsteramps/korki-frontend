import React, { useState, useEffect} from "react";

function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("https://api.sorokokorki.com.pl/admin/clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        setError("Błąd podczas ładowania danych.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) return <p>Wczytywanie danych...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lista klientów</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Imię</th>
              <th className="px-4 py-2 border">E-mail</th>
              <th className="px-4 py-2 border">Telefon</th>
              <th className="px-4 py-2 border">Data</th>
              <th className="px-4 py-2 border">Wiadomość</th>
              <th className="px-4 py-2 border">Złożono</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{client.id}</td>
                <td className="px-4 py-2 border">{client.name}</td>
                <td className="px-4 py-2 border">{client.email}</td>
                <td className="px-4 py-2 border">{client.phone}</td>
                <td className="px-4 py-2 border">{client.date}</td>
                <td className="px-4 py-2 border">{client.message}</td>
                <td className="px-4 py-2 border text-sm text-gray-500">
                  {new Date(client.created_at).toLocaleString("pl-PL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientList