import Slider from "react-slick";
import { Link } from "react-router-dom";
import "../styles/TeamTeaser.css";
import Button from "./Button";

function TeamSlider() {
    const fakeTeams = [
        {
            name: "ShadowFox",
            logo: "/teams/team1.png",
            players: ["GhostRider", "Blaze", "NightWolf"]
        },
        {
            name: "PulseCore",
            logo: "/teams/team2.png",
            players: ["Hyper", "Echo", "Storm"]
        },
        {
            name: "NovaStrike",
            logo: "/teams/team3.png",
            players: ["Zeta", "Photon", "Drift"]
        },
        {
            name: "IronHowl",
            logo: "/teams/team4.png",
            players: ["Rogue", "Shield", "Crank"]
        },
        {
            name: "VoidFlare",
            logo: "/teams/team5.png",
            players: ["Ash", "Fury", "Nova"]
        },
        {
            name: "CrimsonRush",
            logo: "/teams/team6.png",
            players: ["Strike", "Cinder", "Volt"]
        }
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
                breakpoint: 768,
                settings: {
                    slidesToShow: 2
                }
            }
        ]
    };

    return (
        <section className="team-slider-section">
            <h2 className="team-slider-title">Zgłoszone drużyny</h2>
            <Slider {...settings} className="team-slider">
                {fakeTeams.map((team) => (
                    <div key={team.name} className="team-slide">
                        <div className="team-card-glow">
                            <h3 className="team-name">{team.name}</h3>

                            <div className="team-content">
                                <img src={team.logo} alt={team.name} className="team-logo" />
                                <ul className="player-list">
                                    {team.players.map((player, idx) => (
                                        <li key={idx}>{player}</li>
                                    ))}
                                </ul>
                            </div>

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
