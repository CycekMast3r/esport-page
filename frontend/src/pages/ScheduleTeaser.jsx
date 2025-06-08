import { useEffect, useState } from "react";
import "../styles/ScheduleTeaser.css";
import { Link } from "react-router-dom";
import Button from "./Button";
import { generateGroupMatches, getUpcomingMatches } from "./matchUtils";

function ScheduleTeaser() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        fetch("/uploads/teams.json")
            .then((res) => res.json())
            .then((teams) => {
                const allMatches = generateGroupMatches(teams);
                const upcoming = getUpcomingMatches(allMatches, 3);
                setMatches(upcoming);
            });
    }, []);

    return (
        <section className="schedule-section">
            <h2 className="section-title">Najbliższe mecze</h2>
            <div className="match-grid">
                {matches.map((match, index) => (
                    <div key={index} className="match-card">
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
                ))}
            </div>

            <div className="see-more-container">
                <Link to="/harmonogram">
                    <Button variant="neon">Zobacz cały harmonogram</Button>
                </Link>
            </div>
        </section>
    );
}

export default ScheduleTeaser;
