import { useEffect, useState } from "react";
import "../styles/ScheduleTeaser.css";
import { Link } from "react-router-dom";
import Button from "./Button";
// Usuwamy importy z matchUtils, ponieważ logika będzie po stronie backendu
// import { generateGroupMatches, getUpcomingMatches } from "./matchUtils"; 
// Importujemy komponenty animacji
import { Fade, Slide } from 'react-awesome-reveal';

function ScheduleTeaser() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Uzyskaj URL backendu z zmiennych środowiskowych Vite
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchScheduleTeaser = async () => {
            setLoading(true);
            setError(null);
            try {
                // ZMIANA: Pobieramy dane z nowego endpointu API
                const response = await fetch(`${API_BASE_URL}/api/schedule/teaser`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMatches(data); // `data` powinno już zawierać posortowane, najbliższe mecze
            } catch (err) {
                console.error("Błąd ładowania danych meczów dla ScheduleTeaser:", err);
                setError("Nie udało się załadować nadchodzących meczów. Spróbuj odświeżyć stronę.");
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleTeaser();
    }, []);

    // Funkcja do formatowania daty, aby wyglądała ładniej
    const formatMatchDate = (isoDateString) => {
        const dateObj = new Date(isoDateString);
        // Opcje formatowania daty i godziny
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

        const formattedDate = dateObj.toLocaleDateString('pl-PL', dateOptions);
        const formattedTime = dateObj.toLocaleTimeString('pl-PL', timeOptions);

        return `${formattedDate}, ${formattedTime}`;
    };

    if (loading) {
        return (
            <section className="schedule-section">
                <Fade direction="down" triggerOnce>
                    <h2 className="section-title">Najbliższe mecze</h2>
                </Fade>
                <p className="loading-message">Ładowanie nadchodzących meczów...</p>
                {/* Opcjonalnie: Placeholderowe karty meczów podczas ładowania */}
                <div className="match-grid">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="match-card loading">
                            <div className="match-round"></div>
                            <div className="team skeleton">
                                <div className="skeleton-logo"></div>
                                <span className="skeleton-text"></span>
                            </div>
                            <div className="match-info skeleton">
                                <span className="skeleton-text"></span>
                                <div className="skeleton-text"></div>
                            </div>
                            <div className="team skeleton">
                                <div className="skeleton-logo"></div>
                                <span className="skeleton-text"></span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="schedule-section">
                <Fade direction="down" triggerOnce>
                    <h2 className="section-title">Najbliższe mecze</h2>
                </Fade>
                <p className="error-message">{error}</p>
            </section>
        );
    }

    if (matches.length === 0) {
        return (
            <section className="schedule-section">
                <Fade direction="down" triggerOnce>
                    <h2 className="section-title">Najbliższe mecze</h2>
                </Fade>
                <p className="no-matches-message">Brak zaplanowanych meczów. Zgłoś drużyny, aby zobaczyć harmonogram!</p>
                <Fade direction="up" triggerOnce delay={100}>
                    <div className="see-more-container">
                        <Link to="/rejestracja">
                            <Button variant="neon">Zgłoś drużynę</Button>
                        </Link>
                    </div>
                </Fade>
            </section>
        );
    }

    return (
        <section className="schedule-section">
            <Fade direction="down" triggerOnce>
                <h2 className="section-title">Najbliższe mecze</h2>
            </Fade>

            <div className="match-grid">
                {matches.map((match, index) => (
                    <Fade key={match.id} direction="up" cascade damping={0.1} triggerOnce delay={index * 50}>
                        <div className="match-card">
                            <div className="match-round">{match.round}</div>
                            <div className="team">
                                {/* Logo jest już pełnym URL-em z Cloudinary */}
                                {match.teamA.logo && <img src={match.teamA.logo} alt={match.teamA.name} />}
                                <span>{match.teamA.name}</span>
                            </div>
                            <div className="match-info">
                                {/* Formatujemy datę, match.matchDate to ISO string */}
                                <span className="match-date">{formatMatchDate(match.matchDate)}</span>
                                <div className="match-score">{match.score}</div>
                            </div>
                            <div className="team">
                                {/* Logo jest już pełnym URL-em z Cloudinary */}
                                {match.teamB.logo && <img src={match.teamB.logo} alt={match.teamB.name} />}
                                <span>{match.teamB.name}</span>
                            </div>
                        </div>
                    </Fade>
                ))}
            </div>

            <Fade direction="up" triggerOnce delay={matches.length * 50 + 100}>
                <div className="see-more-container">
                    <Link to="/harmonogram">
                        <Button variant="neon">Zobacz cały harmonogram</Button>
                    </Link>
                </div>
            </Fade>
        </section>
    );
}

export default ScheduleTeaser;