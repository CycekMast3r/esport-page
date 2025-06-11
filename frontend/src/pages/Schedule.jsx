import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png"
    };

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Błąd ładowania drużyn:", err);
            }
        };

        fetchTeams();
    }, []);

    const groupNames = ["A", "B", "C", "D"];
    const createGroups = () => {
        return groupNames.map((_, i) => {
            const start = i * 4;
            const group = teams.slice(start, start + 4);
            while (group.length < 4) group.push(null);
            return group;
        });
    };

    const generateGroupMatches = () => {
        const allGroupMatches = [];

        const matchPairs = [
            [[0, 1], [2, 3]],
            [[0, 2], [1, 3]],
            [[0, 3], [1, 2]],
        ];

        const groupMatchMap = groups.map((group, groupIdx) => {
            const label = groupLabels[groupIdx];
            const matches = [];

            matchPairs.forEach(pairSet => {
                pairSet.forEach(([i, j]) => {
                    const teamA = group[i];
                    const teamB = group[j];

                    matches.push({
                        round: `Grupa ${label}`,
                        date: "", // zostanie ustawiona niżej
                        teamA: teamA
                            ? { name: teamA.name, logo: `/uploads/${teamA.logo}` }
                            : placeholderTeam,
                        teamB: teamB
                            ? { name: teamB.name, logo: `/uploads/${teamB.logo}` }
                            : placeholderTeam,
                        score: "– : –",
                    });
                });
            });

            return matches;
        });

        const startDate = new Date("2025-06-14T18:00:00");
        let matchDay = 0;
        const matchHourOffsets = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
        let matchIndex = 0;

        // Dopóki są mecze w którejkolwiek grupie
        while (groupMatchMap.some(group => group.length > 0)) {
            for (let g = 0; g < groupMatchMap.length; g++) {
                const groupMatches = groupMatchMap[g];
                let added = 0;

                for (let i = 0; i < groupMatches.length; i++) {
                    const match = groupMatches[i];

                    const hourOffset = matchHourOffsets[matchIndex % 8];
                    const matchDate = new Date(startDate);
                    matchDate.setDate(startDate.getDate() + matchDay);
                    matchDate.setMinutes(matchDate.getMinutes() + hourOffset * 60);

                    match.date = `${matchDate.toLocaleDateString("pl-PL")} ${matchDate.getHours().toString().padStart(2, '0')}:${matchDate.getMinutes().toString().padStart(2, '0')}`;
                    allGroupMatches.push(match);

                    groupMatches.splice(i, 1);
                    added++;
                    matchIndex++;

                    if (added === 2) break;
                    i--;
                }
            }

            if (matchIndex % 8 === 0) {
                matchDay++;
            }
        }

        return allGroupMatches;
    };

    const staticPhases = {
        "Ćwierćfinały": [
            { round: "Ćwierćfinał", date: "17.06.2025, 14:00", teamA: placeholderTeam, teamB: placeholderTeam, score: "– : –" },
            { round: "Ćwierćfinał", date: "17.06.2025, 16:00", teamA: placeholderTeam, teamB: placeholderTeam, score: "– : –" },
            { round: "Ćwierćfinał", date: "17.06.2025, 18:00", teamA: placeholderTeam, teamB: placeholderTeam, score: "– : –" },
            { round: "Ćwierćfinał", date: "17.06.2025, 20:00", teamA: placeholderTeam, teamB: placeholderTeam, score: "– : –" },
        ],
        "Półfinały": [
            { round: "Półfinał", date: "19.06.2025, 16:00", teamA: placeholderTeam, teamB: placeholderTeam, score: "– : –" },
            { round: "Półfinał", date: "19.06.2025, 20:00", teamA: placeholderTeam, teamB: placeholderTeam, score: "– : –" },
        ],
        "Finał": [
            { round: "Finał", date: "21.06.2025, 20:30", teamA: placeholderTeam, teamB: placeholderTeam, score: "– : –" },
        ]
    };

    const scheduleByPhase = {
        "Faza grupowa": generateGroupMatches(),
        ...staticPhases,
    };

    const matches = scheduleByPhase[selectedPhase] || [];

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
                    {Object.keys(scheduleByPhase).map((phase) => (
                        <option key={phase} value={phase}>
                            {phase}
                        </option>
                    ))}
                </select>
            </div>

            <div className="match-list">
                {matches.map((match, i) => {
                    const finished = isFinished(match.score);
                    const [scoreA, scoreB] = match.score.split(":").map(s => parseInt(s.trim()) || 0);
                    const teamAClass = finished && scoreA > scoreB ? "team winner" : "team";
                    const teamBClass = finished && scoreB > scoreA ? "team winner" : "team";

                    return (
                        <div className={`match-card ${finished ? "finished" : "upcoming"}`} key={i}>
                            <div className="match-round">{match.round}</div>
                            <div className="match-date">{match.date}</div>
                            <div className="match-row">
                                <div className={teamAClass}>
                                    {match.teamA.logo && <img src={match.teamA.logo} alt={match.teamA.name} />}
                                    <span>{match.teamA.name}</span>
                                </div>
                                <div className="match-score">{match.score}</div>
                                <div className={teamBClass}>
                                    {match.teamB.logo && <img src={match.teamB.logo} alt={match.teamB.name} />}
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
