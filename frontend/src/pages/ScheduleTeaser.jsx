import { useEffect, useState } from "react";
import "../styles/ScheduleTeaser.css";
import { Link } from "react-router-dom";
import Button from "./Button";
import { Fade, Slide } from 'react-awesome-reveal';

function ScheduleTeaser() {
    const [matches, setMatches] = useState([]);

    const staticMatches = [
        {
            round: "Grupa A",
            date: "14.06.2025, 18:00",
            teamA: { name: "Ceramika Opoczno Esports", logo: "/teams/team7.png" },
            teamB: { name: "FC Drzewce", logo: "/teams/team8.png" },
            score: "– : –",
        },
        {
            round: "Grupa B",
            date: "14.06.2025, 18:30",
            teamA: { name: "Vamos", logo: "/teams/team3.png" },
            teamB: { name: "Virtus Pro", logo: "/teams/team9.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "14.06.2025, 19:00",
            teamA: { name: "???", logo: "/images/question-mark.png" },
            teamB: { name: "???", logo: "/images/question-mark.png" },
            score: "– : –",
        },
    ];

    useEffect(() => {
        setMatches(staticMatches);
    }, []);

    return (
        <section className="schedule-section">
            <Fade direction="down" triggerOnce>
                <h2 className="section-title">Najbliższe mecze</h2>
            </Fade>

            <div className="match-grid">
                {matches.map((match, index) => (
                    <Fade key={index} direction="up" cascade damping={0.1} triggerOnce delay={index * 50}>
                        <div className="match-card">
                            <div className="match-round">{match.round}</div>
                            <div className="team">
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