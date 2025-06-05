import { Link } from "react-router-dom";
import "../styles/Schedule.css"; // Używamy głównych stylów harmonogramu
import Button from "./Button";
import scheduleData from "./ScheduleData"; // Wydziel dane z Schedule.jsx

function ScheduleTeaser() {
    const teaserMatches = scheduleData["Faza grupowa"].slice(0, 3);

    const isFinished = (score) => /\d\s*:\s*\d/.test(score);

    return (
        <section className="schedule-page">
            <h2 className="schedule-title">Harmonogram</h2>
            <div className="match-list">
                {teaserMatches.map((match, i) => {
                    const finished = isFinished(match.score);
                    let teamAClass = "team";
                    let teamBClass = "team";

                    if (finished) {
                        const [scoreA, scoreB] = match.score.split(":").map(s => parseInt(s.trim()));
                        if (scoreA > scoreB) teamAClass += " winner";
                        else if (scoreB > scoreA) teamBClass += " winner";
                    }

                    return (
                        <div
                            className={`match-card ${finished ? "finished" : "upcoming"}`}
                            key={i}
                        >
                            <div className="match-round">{match.round}</div>
                            <div className="match-date">{match.date}</div>
                            <div className="match-row">
                                <div className={teamAClass}>
                                    {match.teamA.logo && (
                                        <img src={match.teamA.logo} alt={match.teamA.name} />
                                    )}
                                    <span>{match.teamA.name}</span>
                                </div>
                                <div className="match-score">{match.score}</div>
                                <div className={teamBClass}>
                                    {match.teamB.logo && (
                                        <img src={match.teamB.logo} alt={match.teamB.name} />
                                    )}
                                    <span>{match.teamB.name}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="see-more-container">
                <Link to="/harmonogram">
                    <Button variant="neon">Zobacz więcej</Button>
                </Link>
            </div>
        </section>
    );
}

export default ScheduleTeaser;
