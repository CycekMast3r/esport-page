import { useEffect, useState } from "react";
import "../styles/Teams.css";
import Button from "./Button";
import { Link } from "react-router-dom";

function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [flippedIndex, setFlippedIndex] = useState(null);
    const [loading, setLoading] = useState(true); // Dodajemy stan ładowania
    const [error, setError] = useState(null);    // Dodajemy stan błędu

    const totalSlots = 16;

    // Uzyskaj URL backendu z zmiennych środowiskowych Vite
    // Pamiętaj, aby dodać np. VITE_API_URL=https://your-backend-service.onrender.com
    // w pliku .env w katalogu głównym Twojego frontendu.
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true); // Rozpocznij ładowanie
            setError(null);   // Resetuj błędy
            try {
                // Zmieniamy ścieżkę z pliku JSON na endpoint API
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Nie udało się pobrać drużyn:", err);
                setError("Nie udało się załadować drużyn. Spróbuj odświeżyć stronę."); // Ustaw komunikat błędu
            } finally {
                setLoading(false); // Zakończ ładowanie niezależnie od wyniku
            }
        };

        fetchTeams();
    }, []); // Pusta tablica zależności oznacza, że useEffect uruchomi się tylko raz po zamontowaniu komponentu

    const emptySlots = Array.from({ length: totalSlots - teams.length }, () => null);
    const allCards = [...teams, ...emptySlots];

    const toggleFlip = (index) => {
        setFlippedIndex(flippedIndex === index ? null : index);
    };

    if (loading) {
        return (
            <section className="teams-page">
                <h2 className="teams-title">Drużyny turniejowe</h2>
                <p className="teams-subtitle">Ładowanie drużyn...</p>
                <div className="teams-grid">
                    {/* Możesz dodać proste animacje ładowania tutaj */}
                    {Array.from({ length: totalSlots }, (_, i) => (
                        <div key={i} className="flip-card loading">
                            <div className="flip-inner">
                                <div className="flip-front empty-card"></div>
                                <div className="flip-back empty-card"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="teams-page">
                <h2 className="teams-title">Drużyny turniejowe</h2>
                <p className="teams-subtitle error-message">{error}</p>
                <p className="teams-subtitle">Sprawdź połączenie internetowe lub spróbuj ponownie.</p>
                {/* Możesz dodać przycisk do ponownego ładowania, jeśli chcesz */}
                <Link to="/rejestracja">
                    <Button variant="primary">Zgłoś drużynę</Button>
                </Link>
            </section>
        );
    }

    return (
        <section className="teams-page">
            <h2 className="teams-title">Drużyny turniejowe</h2>
            <p className="teams-subtitle">Kliknij na kartę, aby zobaczyć skład drużyny</p>

            <div className="teams-grid">
                {allCards.map((team, index) => (
                    <div
                        key={index}
                        className={`flip-card ${flippedIndex === index ? "flipped" : ""} ${team ? "filled" : "empty"}`}
                        onClick={() => team && toggleFlip(index)}
                    >
                        <div className="flip-inner">
                            {team ? (
                                <>
                                    <div className="flip-front">
                                        {/* ZMIANA TUTAJ: Używamy team.logo bezpośrednio, ponieważ jest już pełnym URL-em Cloudinary */}
                                        {team.logo && <img src={team.logo} alt={team.name} className="team-logo" />}
                                        <h3 className="team-name">{team.name}</h3>
                                    </div>
                                    <div className="flip-back">
                                        {/* ZMIANA TUTAJ: Używamy team.logo bezpośrednio */}
                                        {team.logo && <img src={team.logo} alt={team.name} className="team-logo small" />}
                                        <table className="player-stats">
                                            <thead>
                                                <tr>
                                                    <th>Zawodnik</th>
                                                    <th>G</th>
                                                    <th>A</th>
                                                    <th>S</th>
                                                    <th>MVP</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {team.players.map((player, i) => (
                                                    <tr key={i}>
                                                        <td>{player.name}</td>
                                                        <td>{player.G}</td>
                                                        <td>{player.A}</td>
                                                        <td>{player.S}</td>
                                                        <td>{player.MVP}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flip-front empty-card">
                                        <p className="empty-text">Wolne miejsce</p>
                                        <Link to="/rejestracja">
                                            <Button variant="primary">Zgłoś drużynę</Button>
                                        </Link>
                                    </div>
                                    <div className="flip-back empty-card">
                                        <p className="empty-text">Czekamy na drużynę...</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default TeamsPage;