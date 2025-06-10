import { useEffect, useState } from "react";
import "../styles/ScheduleTeaser.css";
import { Link } from "react-router-dom";
import Button from "./Button";
import { generateGroupMatches, getUpcomingMatches } from "./matchUtils";
// Importujemy komponenty animacji
import { Fade, Slide } from 'react-awesome-reveal';

function ScheduleTeaser() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        fetch("/uploads/teams.json")
            .then((res) => res.json())
            .then((teams) => {
                const allMatches = generateGroupMatches(teams);
                // Upewnij się, że getUpcomingMatches zwraca obiekty z potrzebnymi danymi (teamA.logo, teamB.logo itd.)
                const upcoming = getUpcomingMatches(allMatches, 3); // Pobieramy 3 najbliższe mecze
                setMatches(upcoming);
            })
            .catch(err => console.error("Błąd ładowania danych meczów:", err));
    }, []);

    return (
        // ScheduleTeaser jest już otoczony Fade w Home.jsx, więc animujemy wewnętrzne elementy.
        <section className="schedule-section">
            {/* Animacja dla tytułu sekcji */}
            <Fade direction="down" triggerOnce>
                <h2 className="section-title">Najbliższe mecze</h2>
            </Fade>

            {/* Kontener na karty meczów z animacją kaskadową */}
            <div className="match-grid">
                {matches.map((match, index) => (
                    // Animacja dla każdej pojedynczej karty meczu
                    // Używamy Fade z cascade, aby karty pojawiały się kolejno
                    <Fade key={index} direction="up" cascade damping={0.1} triggerOnce delay={index * 50}>
                        <div className="match-card">
                            <div className="match-round">{match.round}</div>
                            <div className="team">
                                {/* Upewnij się, że match.teamA.logo i match.teamB.logo są poprawnymi ścieżkami */}
                                <img src={match.teamA.logo} alt={match.teamA.name} />
                                <span>{match.teamA.name}</span>
                            </div>
                            <div className="match-info">
                                <span className="match-date">{match.date}</span>
                                <div className="match-score">{match.score}</div>
                            </div>
                            <div className="team">
                                <img src={match.teamB.logo} alt={match.teamB.name} />
                                <span>{match.teamB.name}</span>
                            </div>
                        </div>
                    </Fade>
                ))}
            </div>

            {/* Animacja dla kontenera przycisku */}
            <Fade direction="up" triggerOnce delay={matches.length * 50 + 100}> {/* Opóźnienie po kartach */}
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