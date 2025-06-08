import { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "../styles/TeamTeaser.css";
import Button from "./Button";

function TeamSlider() {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        fetch("/uploads/teams.json")
            .then(res => res.json())
            .then(data => setTeams(data))
            .catch(err => console.error("Błąd ładowania drużyn:", err));
    }, []);

    // Minimalna liczba slajdów do wyświetlenia (np. 6)
    const MIN_SLIDES = 6;
    const totalSlots = Math.max(teams.length, MIN_SLIDES);

    // Uzupełnij do wymaganej liczby slotów pustymi miejscami
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
        <section className="team-slider-section">
            <h2 className="team-slider-title">Zgłoszone drużyny</h2>
            <Slider {...settings} className="team-slider">
                {filledTeams.map((team, index) => (
                    <div key={team.id || index} className="team-slide">
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
                ))}
            </Slider>

            <Link to="/druzyny">
                <Button variant="neon">Zobacz wszystkie drużyny</Button>
            </Link>
        </section>
    );
}

export default TeamSlider;
