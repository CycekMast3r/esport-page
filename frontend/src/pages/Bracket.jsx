import { useEffect, useState } from "react";
import "../styles/Bracket.css";

function TournamentBracket() {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        fetch("/uploads/teams.json")
            .then((res) => res.json())
            .then((data) => setTeams(data))
            .catch((err) => console.error("Błąd ładowania teams.json:", err));
    }, []);

    // === Grupowanie ===
    const groupNames = ["A", "B", "C", "D"];
    const groups = groupNames.map((group, i) => {
        const start = i * 4;
        const groupTeams = teams.slice(start, start + 4);
        while (groupTeams.length < 4) {
            groupTeams.push(null); // wolne miejsce
        }
        return groupTeams;
    });

    return (
        <section className="bracket-page">
            <h2 className="schedule-title">Faza Grupowa</h2>

            <div className="groups-container">
                {groups.map((group, groupIdx) => (
                    <div className="group-card" key={groupIdx}>
                        <h3>Grupa {groupNames[groupIdx]}</h3>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Zespół</th>
                                    <th>Punkty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.map((team, idx) => (
                                    <tr key={idx} className={idx < 2 && team ? "qualified" : ""}>
                                        <td>{idx + 1}</td>
                                        <td className="team-cell">
                                            {team ? (
                                                <>
                                                    <img src={`/uploads/${team.logo}`} alt={team.name} />
                                                    <span>{team.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <img src="/images/question-mark.png" alt="Wolne miejsce" />
                                                    <span>???</span>
                                                </>
                                            )}
                                        </td>
                                        <td>{team ? team.points || 0 : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            <h2 className="schedule-title">Faza Pucharowa</h2>
            <div className="bracket-wrapper">

                {/* Ćwierćfinały */}
                <div className="round quarter">
                    <h3 className="round-title">Ćwierćfinały</h3>
                    {[...Array(4)].map((_, i) => (
                        <div className="match" key={i}>
                            <div className="team">
                                <img src="/images/question-mark.png" alt="?" className="team-logo" />
                                ???
                            </div>
                            <div className="score">– : –</div>
                            <div className="team">
                                <img src="/images/question-mark.png" alt="?" className="team-logo" />
                                ???
                            </div>
                        </div>
                    ))}
                </div>

                {/* Półfinały */}
                <div className="round semi">
                    <h3 className="round-title">Półfinały</h3>
                    {[...Array(2)].map((_, i) => (
                        <div className="match" key={i}>
                            <div className="team">
                                <img src="/images/question-mark.png" alt="?" className="team-logo" />
                                ???
                            </div>
                            <div className="score">– : –</div>
                            <div className="team">
                                <img src="/images/question-mark.png" alt="?" className="team-logo" />
                                ???
                            </div>
                        </div>
                    ))}
                </div>

                {/* Finał */}
                <div className="round final">
                    <h3 className="round-title">Finał</h3>
                    <div className="match">
                        <div className="team">
                            <img src="/images/question-mark.png" alt="?" className="team-logo" />
                            ???
                        </div>
                        <div className="score">– : –</div>
                        <div className="team">
                            <img src="/images/question-mark.png" alt="?" className="team-logo" />
                            ???
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TournamentBracket;
