import { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "../styles/TeamTeaser.css";
import Button from "./Button";
// Importujemy komponenty animacji
import { Fade, Slide } from 'react-awesome-reveal';

function TeamSlider() { // Prawdopodobnie ten komponent powinien nazywać się TeamTeaser lub być w pliku o takiej nazwie
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true); // Dodajemy stan ładowania, podobnie jak w TeamsPage
    const [error, setError] = useState(null);    // Dodajemy stan błędu

    // Uzyskaj URL backendu z zmiennych środowiskowych Vite
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true); // Rozpocznij ładowanie
            setError(null);   // Resetuj błędy
            try {
                // ZMIANA 1: Pobieramy dane z endpointu API backendu
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Błąd ładowania drużyn dla TeamTeaser:", err);
                setError("Nie udało się załadować drużyn w sekcji teaser. Spróbuj odświeżyć stronę.");
            } finally {
                setLoading(false); // Zakończ ładowanie
            }
        };

        fetchTeams();
    }, []);

    const MIN_SLIDES = 6;
    const totalSlots = Math.max(teams.length, MIN_SLIDES);

    // Wypełniamy puste sloty tylko, jeśli nie ma błędu ładowania i dane są dostępne
    const filledTeams = loading || error ?
        Array.from({ length: totalSlots }, (_, idx) => ({ id: `loading-${idx}`, empty: true })) // Puste sloty podczas ładowania/błędu
        : [
            ...teams,
            ...Array.from({ length: totalSlots - teams.length }, (_, idx) => ({
                id: `empty-${idx}`,
                empty: true
            }))
        ];

    const settings = {
        infinite: true,
        speed: 1000,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 3 }
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 1 }
            }
        ]
    };

    // Dodajemy obsługę stanów ładowania i błędów, podobnie jak w TeamsPage
    if (loading) {
        return (
            <section className="team-slider-section">
                <h2 className="team-slider-title">Zgłoszone drużyny</h2>
                <p className="teams-subtitle">Ładowanie drużyn...</p>
                <div className="team-slider">
                    {Array.from({ length: MIN_SLIDES }, (_, i) => (
                        <div key={i} className="team-slide loading">
                            <div className="team-card-glow">
                                <h3 className="team-name">Ładowanie...</h3>
                                <div className="team-content">
                                    <img src="/images/placeholder-logo.png" alt="Loading" className="team-logo" /> {/* Przykładowy placeholder */}
                                    <p className="empty-label">...</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="team-slider-section">
                <h2 className="team-slider-title">Zgłoszone drużyny</h2>
                <p className="teams-subtitle error-message">{error}</p>
                <p className="teams-subtitle">Sprawdź połączenie internetowe lub spróbuj ponownie.</p>
                <Link to="/rejestracja">
                    <Button variant="primary">Zgłoś drużynę</Button>
                </Link>
            </section>
        );
    }


    return (
        <section className="team-slider-section">
            <Fade direction="up" triggerOnce delay={50}>
                <h2 className="team-slider-title">Zgłoszone drużyny</h2>
            </Fade>

            <Slider {...settings} className="team-slider">
                {filledTeams.map((team, index) => (
                    <Fade key={team.id || index} direction="up" cascade damping={0.08} triggerOnce>
                        <div className="team-slide">
                            <div className="team-card-glow">
                                {team.empty ? (
                                    <>
                                        <h3 className="team-name">Wolne miejsce</h3>
                                        <div className="team-content">
                                            {/* Ścieżka do wolnego miejsca może być lokalna, jeśli to statyczny obrazek */}
                                            <img src="/images/question-mark.png" alt="wolne" className="team-logo" />
                                            <p className="empty-label">Zgłoś swoją drużynę!</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="team-name">{team.name}</h3>
                                        <div className="team-content">
                                            {/* ZMIANA 2: Używamy team.logo bezpośrednio, ponieważ jest już pełnym URL-em Cloudinary */}
                                            {team.logo && <img src={team.logo} alt={team.name} className="team-logo" />}
                                            <ul className="player-list">
                                                {team.players.map((player, idx) => (
                                                    <li key={idx}>{player.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Fade>
                ))}
            </Slider>

            <Fade direction="up" triggerOnce delay={filledTeams.length * 50 + 100}>
                <Link to="/druzyny">
                    <Button variant="neon">Zobacz wszystkie drużyny</Button>
                </Link>
            </Fade>
        </section>
    );
}

export default TeamSlider;