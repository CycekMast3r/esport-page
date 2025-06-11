import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");
    const [loading, setLoading] = useState(true); // Dodajemy stan ładowania
    const [error, setError] = useState(null);    // Dodajemy stan błędu

    // Uzyskaj URL backendu z zmiennych środowiskowych Vite
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true); // Rozpocznij ładowanie
            setError(null);   // Resetuj błędy
            try {
                // Zmieniamy ścieżkę z pliku JSON na endpoint API
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Nie udało się pobrać drużyn dla harmonogramu:", err);
                setError("Nie udało się załadować harmonogramu. Spróbuj odświeżyć stronę."); // Ustaw komunikat błędu
            } finally {
                setLoading(false); // Zakończ ładowanie niezależnie od wyniku
            }
        };

        fetchTeams();
    }, []); // Pusta tablica zależności, uruchomi się tylko raz

    const isFinished = (score) => /\d\s*:\s*\d/.test(score);
    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png" // Zakładam, że ten placeholder logo jest statycznym plikiem w frontendzie
    };

    // === Generowanie fazy grupowej ===
    const groupLabels = ["A", "B", "C", "D"];
    const groups = groupLabels.map((_, idx) => {
        const group = teams.slice(idx * 4, (idx + 1) * 4);
        while (group.length < 4) group.push(null); // Upewnij się, że każda grupa ma 4 miejsca
        return group;
    });

    const generateGroupMatches = () => {
        const allGroupMatches = [];

        // 3 ustalone kolejki: [0,1]-[2,3], [0,2]-[1,3], [0,3]-[1,2]
        const matchPairs = [
            [[0, 1], [2, 3]],
            [[0, 2], [1, 3]],
            [[0, 3], [1, 2]]
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
                        date: "", // dodamy później
                        teamA: teamA
                            ? { name: teamA.name, logo: `${API_BASE_URL}/uploads/${teamA.logo}` } // Użyj API_BASE_URL
                            : placeholderTeam,
                        teamB: teamB
                            ? { name: teamB.name, logo: `${API_BASE_URL}/uploads/${teamB.logo}` } // Użyj API_BASE_URL
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

        // Flatten the groupMatchMap and assign dates
        while (groupMatchMap.some(group => group.length > 0)) {
            for (let g = 0; g < groupMatchMap.length; g++) {
                const groupMatches = groupMatchMap[g];
                if (groupMatches.length > 0) { // Tylko jeśli są mecze do dodania w tej grupie
                    const match = groupMatches.shift(); // Weź pierwszy mecz z grupy

                    const hourOffset = matchHourOffsets[matchIndex % 8];
                    const matchDate = new Date(startDate);
                    matchDate.setDate(startDate.getDate() + matchDay);
                    matchDate.setMinutes(matchDate.getMinutes() + hourOffset * 60);

                    match.date = `${matchDate.toLocaleDateString("pl-PL")} ${matchDate.getHours().toString().padStart(2, '0')}:${matchDate.getMinutes().toString().padStart(2, '0')}`;
                    allGroupMatches.push(match);
                    matchIndex++;
                }
            }
            // Przechodź do następnego dnia, jeśli wszystkie grupy wyczerpały "obecne" mecze
            if (matchIndex % 8 === 0 && matchIndex > 0) {
                matchDay++;
            }
        }
        return allGroupMatches;
    };


    // === Generowanie ćwierćfinałów na podstawie grup ===
    const generateQuarterfinals = () => {
        const qf = [];

        // Zakładamy, że teams są już załadowane i posortowane lub że masz sensowny sposób na wybór A1, B2 itd.
        // Jeśli chcesz faktycznie brać "pierwszą drużynę z grupy A", potrzebujesz logiki, która ustali zwycięzców grup.
        // Na razie użyjemy prostych placeholderów, dopóki nie będzie logiki wyników meczów grupowych.

        // Przykładowe drużyny (tylko do celów wizualnych, do czasu implementacji logiki fazy grupowej)
        // W przyszłości, A[0] będzie oznaczać zwycięzcę grupy A itp.
        const A1 = teams[0] || placeholderTeam; // Przykładowo, pierwsza drużyna w liście to A1
        const B1 = teams[4] || placeholderTeam; // Drużyna z drugiej grupy
        const C1 = teams[8] || placeholderTeam;
        const D1 = teams[12] || placeholderTeam;

        const A2 = teams[1] || placeholderTeam;
        const B2 = teams[5] || placeholderTeam;
        const C2 = teams[9] || placeholderTeam;
        const D2 = teams[13] || placeholderTeam;


        const matchups = [
            [A1, B2], // A1 vs B2
            [C2, D1], // C2 vs D1
            [B1, A2], // B1 vs A2
            [C1, D2], // C1 vs D2
        ];

        matchups.forEach(([teamA, teamB], i) => {
            qf.push({
                round: "Ćwierćfinał",
                date: `17.06.2025, ${14 + i * 2}:00`,
                teamA: { name: teamA.name, logo: teamA.logo.startsWith(API_BASE_URL) ? teamA.logo : `${API_BASE_URL}/uploads/${teamA.logo}` },
                teamB: { name: teamB.name, logo: teamB.logo.startsWith(API_BASE_URL) ? teamB.logo : `${API_BASE_URL}/uploads/${teamB.logo}` },
                score: "– : –",
            });
        });

        return qf;
    };

    // === Półfinały i Finał statycznie ===
    // Tutaj logo będą puste, bo nie ma jeszcze zwycięzców z prawdziwymi logo.
    // To jest OK, bo to są placeholder'y.
    const staticPhases = {
        "Półfinały": [
            {
                round: "Półfinał",
                date: "19.06.2025, 16:00",
                teamA: { name: "Zwycięzca QF1", logo: "" },
                teamB: { name: "Zwycięzca QF2", logo: "" },
                score: "– : –",
            },
            {
                round: "Półfinał",
                date: "19.06.2025, 20:00",
                teamA: { name: "Zwycięzca QF3", logo: "" },
                teamB: { name: "Zwycięzca QF4", logo: "" },
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

    // Używamy funkcji dopiero po załadowaniu teams
    // Jeśli teams się zmieniają, scheduleByPhase też się przeliczy
    const scheduleByPhase = {
        "Faza grupowa": generateGroupMatches(),
        "Ćwierćfinały": generateQuarterfinals(),
        ...staticPhases,
    };

    const matches = scheduleByPhase[selectedPhase] || [];

    // Dodajemy warunki ładowania i błędu
    if (loading) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <p className="schedule-subtitle">Ładowanie harmonogramu...</p>
                <div className="match-list">
                    {/* Możesz dodać proste animacje ładowania tutaj */}
                    <p>Proszę czekać...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <p className="schedule-subtitle error-message">{error}</p>
                <p className="schedule-subtitle">Sprawdź połączenie internetowe lub spróbuj ponownie.</p>
            </section>
        );
    }

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
                {matches.length === 0 && !loading && !error ? (
                    <p className="no-matches-message">Brak meczów do wyświetlenia w tej fazie lub brak zarejestrowanych drużyn.</p>
                ) : (
                    matches.map((match, i) => {
                        const finished = isFinished(match.score);
                        let teamAClass = "team";
                        let teamBClass = "team";

                        if (finished) {
                            const [a, b] = match.score.split(":").map((s) => parseInt(s.trim()));
                            if (a > b) teamAClass += " winner";
                            else if (b > a) teamBClass += " winner";
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
                    })
                )}
            </div>
        </section>
    );
}

export default Schedule;