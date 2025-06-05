import { useState } from "react";
import "../styles/Schedule.css";

const scheduleData = {
    "Faza grupowa": [
        {
            round: "Grupa A",
            date: "14.06.2025, 16:00",
            teamA: { name: "Cyber Wolves", logo: "/teams/team1.png" },
            teamB: { name: "Rocket Kings", logo: "/teams/team2.png" },
            score: "2 : 1",
        },
        {
            round: "Grupa B",
            date: "15.06.2025, 18:00",
            teamA: { name: "Dark Phoenix", logo: "/teams/team4.png" },
            teamB: { name: "Pixel Raiders", logo: "/teams/team3.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa A",
            date: "14.06.2025, 16:00",
            teamA: { name: "Cyber Wolves", logo: "/teams/team1.png" },
            teamB: { name: "Rocket Kings", logo: "/teams/team2.png" },
            score: "2 : 1",
        },
        {
            round: "Grupa B",
            date: "15.06.2025, 18:00",
            teamA: { name: "Dark Phoenix", logo: "/teams/team4.png" },
            teamB: { name: "Pixel Raiders", logo: "/teams/team3.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
        {
            round: "Grupa C",
            date: "15.06.2025, 20:00",
            teamA: { name: "Turbo Titans", logo: "/teams/team5.png" },
            teamB: { name: "Neon Strikers", logo: "/teams/team6.png" },
            score: "– : –",
        },
    ],
    "Półfinały": [
        {
            round: "Półfinał",
            date: "19.06.2025, 16:00",
            teamA: { name: "Zwycięzca Grupy A", logo: "" },
            teamB: { name: "Zwycięzca Grupy C", logo: "" },
            score: "– : –",
        },
        {
            round: "Półfinał",
            date: "19.06.2025, 20:00",
            teamA: { name: "Zwycięzca Grupy B", logo: "" },
            teamB: { name: "Zwycięzca Grupy D", logo: "" },
            score: "– : –",
        },
    ],
    "Finał": [
        {
            round: "Finał",
            date: "21.06.2025, 20:30",
            teamA: { name: "??", logo: "" },
            teamB: { name: "??", logo: "" },
            score: "– : –",
        },
    ],
};


function Schedule() {
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");
    const matches = scheduleData[selectedPhase];

    const isFinished = (score) => /\d\s*:\s*\d/.test(score);

    return (
        <section className="schedule-page full-screen">
            <h2 className="schedule-title">Harmonogram rozgrywek</h2>

            <div className="phase-selector">
                <label htmlFor="phase">Wybierz fazę:</label>
                <select
                    id="phase"
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                >
                    {Object.keys(scheduleData).map((phase) => (
                        <option key={phase} value={phase}>
                            {phase}
                        </option>
                    ))}
                </select>
            </div>

            <div className="match-list">
                {matches.map((match, i) => {
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
        </section>
    );
}


export default Schedule;
