import { useEffect, useState } from "react";
import "../styles/Bracket.css";

function TournamentBracket() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true); // Rozpocznij ładowanie
            setError(null);   // Resetuj błędy
            try {
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Nie udało się pobrać drużyn dla drabinki:", err);
                setError("Nie udało się załadować drabinki. Spróbuj odświeżyć stronę."); // Ustaw komunikat błędu
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const groupNames = ["A", "B", "C", "D"];
    const groups = groupNames.map((groupName, i) => {
        const start = i * 4;
        const groupTeams = teams.slice(start, start + 4);
        while (groupTeams.length < 4) {
            groupTeams.push(null); // wolne miejsce
        }
        return groupTeams;
    });

    const placeholderTeamData = {
        name: "???",
        logo: "/images/question-mark.png" // Zakładam, że ten placeholder logo jest statycznym plikiem w frontendzie
    };

    if (loading) {
        return (
            <section className="bracket-page">
                <h2 className="schedule-title">Faza Grupowa</h2>
                <p className="schedule-subtitle">Ładowanie drabinki...</p>
                <div className="groups-container">
                    <p>Proszę czekać...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bracket-page">
                <h2 className="schedule-title">Faza Grupowa</h2>
                <p className="schedule-subtitle error-message">{error}</p>
                <p className="schedule-subtitle">Sprawdź połączenie internetowe lub spróbuj ponownie.</p>
            </section>
        );
    }

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
                                                    {team.logo && <img src={team.logo} alt={team.name} />}
                                                    <span>{team.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <img src={placeholderTeamData.logo} alt={placeholderTeamData.name} />
                                                    <span>{placeholderTeamData.name}</span>
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

                <div className="round quarter">
                    <h3 className="round-title">Ćwierćfinały</h3>
                    {[...Array(4)].map((_, i) => (
                        <div className="match" key={i}>
                            <div className="team">
                                <img src={placeholderTeamData.logo} alt={placeholderTeamData.name} className="team-logo" />
                                {placeholderTeamData.name}
                            </div>
                            <div className="score">– : –</div>
                            <div className="team">
                                <img src={placeholderTeamData.logo} alt={placeholderTeamData.name} className="team-logo" />
                                {placeholderTeamData.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="round semi">
                    <h3 className="round-title">Półfinały</h3>
                    {[...Array(2)].map((_, i) => (
                        <div className="match" key={i}>
                            <div className="team">
                                <img src={placeholderTeamData.logo} alt={placeholderTeamData.name} className="team-logo" />
                                {placeholderTeamData.name}
                            </div>
                            <div className="score">– : –</div>
                            <div className="team">
                                <img src={placeholderTeamData.logo} alt={placeholderTeamData.name} className="team-logo" />
                                {placeholderTeamData.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="round final">
                    <h3 className="round-title">Finał</h3>
                    <div className="match">
                        <div className="team">
                            <img src={placeholderTeamData.logo} alt={placeholderTeamData.name} className="team-logo" />
                            {placeholderTeamData.name}
                        </div>
                        <div className="score">– : –</div>
                        <div className="team">
                            <img src={placeholderTeamData.logo} alt={placeholderTeamData.name} className="team-logo" />
                            {placeholderTeamData.name}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TournamentBracket;