import { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "../styles/TeamTeaser.css";
import Button from "./Button";
// Importujemy komponenty animacji
import { Fade, Slide } from 'react-awesome-reveal';

function TeamSlider() { // Prawdopodobnie ten komponent powinien nazywać się TeamTeaser lub być w pliku o takiej nazwie
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        fetch("/uploads/teams.json")
            .then(res => res.json())
            .then(data => setTeams(data))
            .catch(err => console.error("Błąd ładowania drużyn:", err));
    }, []);

    const MIN_SLIDES = 6;
    const totalSlots = Math.max(teams.length, MIN_SLIDES);

    const filledTeams = [
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

    return (
        // Cały TeamTeaser jest już otoczony Fade w Home.jsx,
        // więc tutaj animujemy wewnętrzne elementy.
        <section className="team-slider-section">
            {/* Animacja dla tytułu sekcji */}
            <Fade direction="up" triggerOnce delay={50}> {/* Lekkie opóźnienie, aby pojawił się po sekcji */}
                <h2 className="team-slider-title">Zgłoszone drużyny</h2>
            </Fade>

            {/* Możesz zastosować animację do całego slidera,
                albo do pojedynczych slajdów w zależności od preferowanego efektu.
                Tutaj zastosuję do każdego slajdu z kaskadą. */}
            <Slider {...settings} className="team-slider">
                {filledTeams.map((team, index) => (
                    // Animacja dla każdego pojedynczego slajdu
                    // Używamy Fade z cascade, aby slajdy pojawiały się kolejno
                    // Damping kontroluje "gęstość" kaskady
                    <Fade key={team.id || index} direction="up" cascade damping={0.08} triggerOnce>
                        <div className="team-slide">
                            <div className="team-card-glow">
                                {team.empty ? (
                                    <>
                                        <h3 className="team-name">Wolne miejsce</h3>
                                        <div className="team-content">
                                            <img src="/images/question-mark.png" alt="wolne" className="team-logo" />
                                            <p className="empty-label">Zgłoś swoją drużynę!</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="team-name">{team.name}</h3>
                                        <div className="team-content">
                                            <img src={`/uploads/${team.logo}`} alt={team.name} className="team-logo" />
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

            {/* Animacja dla przycisku */}
            <Fade direction="up" triggerOnce delay={filledTeams.length * 50 + 100}> {/* Opóźnienie po slajdach */}
                <Link to="/druzyny">
                    <Button variant="neon">Zobacz wszystkie drużyny</Button>
                </Link>
            </Fade>
        </section>
    );
}

export default TeamSlider; // Jeśli plik to TeamTeaser.jsx, zmień eksport na `export default TeamTeaser;`