import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");

    useEffect(() => {
        // Pobieramy drużyny z backendu. Zakładamy, że /api/teams zwróci 16 drużyn,
        // posortowanych w kolejności, w jakiej mają być przydzielone do grup.
        fetch("/api/teams")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                // Jeśli teams jest puste lub ma mniej niż 16 elementów,
                // uzupełniamy je placeholderami, aby uniknąć błędów indeksowania.
                const filledTeams = [...data];
                while (filledTeams.length < 16) {
                    filledTeams.push(null); // Używamy null, aby oznaczyć brak drużyny
                }
                setTeams(filledTeams);
            })
            .catch((err) => console.error("Błąd ładowania danych drużyn z backendu:", err));
    }, []);

    const isFinished = (score) => /\d\s*:\s*\d/.test(score);

    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png"
    };

    const groupLabels = ["A", "B", "C", "D"];
    // Podziel zarejestrowane drużyny na grupy po 4
    const groups = groupLabels.map((_, idx) => {
        const group = teams.slice(idx * 4, (idx + 1) * 4);
        // Uzupełniamy grupy nullami, jeśli brakuje drużyn, aby utrzymać strukturę
        while (group.length < 4) group.push(null);
        return group;
    });

    // Funkcja pomocnicza do pobierania danych drużyny lub placeholdera
    const getTeamDisplayInfo = (team) => {
        return team
            ? { name: team.name, logo: team.logo }
            : placeholderTeam;
    };

    const generateGroupMatches = () => {
        const allGroupMatches = [];
        const matchPairs = [
            [[0, 1], [2, 3]], // Mecz 1, Mecz 2
            [[0, 2], [1, 3]], // Mecz 3, Mecz 4
            [[0, 3], [1, 2]]  // Mecz 5, Mecz 6
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
                        date: "", // Data zostanie przypisana później
                        teamA: getTeamDisplayInfo(teamA),
                        teamB: getTeamDisplayInfo(teamB),
                        score: "– : –",
                    });
                });
            });
            return matches;
        });

        const startDate = new Date("2025-06-14T18:00:00");
        let matchDay = 0;
        const matchHourOffsets = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]; // Co 30 minut
        let matchIndex = 0;

        // Logika rozłożenia meczów grupowych w czasie (tak jak w Twojej wersji)
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

                    groupMatches.splice(i, 1); // Usuń dodany mecz
                    added++;
                    matchIndex++;

                    if (added === 2) break; // Dodano 2 mecze z tej grupy, przejdź do następnej
                    i--; // Dostosuj indeks po usunięciu elementu
                }
            }
            if (matchIndex % 8 === 0) { // Przejdź do następnego dnia, jeśli zapełniono 8 slotów
                matchDay++;
            }
        }
        return allGroupMatches;
    };

    const generateQuarterfinals = () => {
        // Logika przydzielania drużyn do ćwierćfinałów
        // Zakładamy, że teams[0] to A1, teams[1] to A2, teams[4] to B1 itd.
        // To wymaga, aby teams było posortowane w konkretnej kolejności (np. alfabetycznie według nazwy)
        // i aby A1, A2, B1, B2 itd. były pierwszymi dwoma drużynami z każdej grupy.
        // W prawdziwym turnieju potrzebny byłby ranking grup.

        const A = groups[0];
        const B = groups[1];
        const C = groups[2];
        const D = groups[3];

        const matchups = [
            // A1 vs B2
            { teamA: getTeamDisplayInfo(A[0]), teamB: getTeamDisplayInfo(B[1]) },
            // C2 vs D1
            { teamA: getTeamDisplayInfo(C[1]), teamB: getTeamDisplayInfo(D[0]) },
            // B1 vs A2
            { teamA: getTeamDisplayInfo(B[0]), teamB: getTeamDisplayInfo(A[1]) },
            // C1 vs D2
            { teamA: getTeamDisplayInfo(C[0]), teamB: getTeamDisplayInfo(D[1]) },
        ];

        const qf = [];
        const qfStartDate = new Date("2025-06-17T14:00:00");

        matchups.forEach((pair, i) => {
            const matchDate = new Date(qfStartDate);
            matchDate.setHours(qfStartDate.getHours() + i * 2); // Co 2 godziny
            qf.push({
                round: "Ćwierćfinał",
                date: `${matchDate.toLocaleDateString("pl-PL")} ${matchDate.getHours().toString().padStart(2, '0')}:${matchDate.getMinutes().toString().padStart(2, '0')}`,
                teamA: pair.teamA,
                teamB: pair.teamB,
                score: "– : –",
            });
        });
        return qf;
    };

    const generateSemifinals = () => {
        return [
            {
                round: "Półfinał",
                date: "19.06.2025, 16:00",
                teamA: placeholderTeam, // Zwycięzcy są nieznani na początku
                teamB: placeholderTeam,
                score: "– : –",
            },
            {
                round: "Półfinał",
                date: "19.06.2025, 20:00",
                teamA: placeholderTeam,
                teamB: placeholderTeam,
                score: "– : –",
            },
        ];
    };

    const generateFinal = () => {
        return [
            {
                round: "Finał",
                date: "21.06.2025, 20:30",
                teamA: placeholderTeam,
                teamB: placeholderTeam,
                score: "– : –",
            },
        ];
    };

    // Oblicz harmonogram tylko wtedy, gdy teams są załadowane
    const scheduleByPhase = teams.length === 16 ? {
        "Faza grupowa": generateGroupMatches(),
        "Ćwierćfinały": generateQuarterfinals(),
        "Półfinały": generateSemifinals(), // Używamy nowej funkcji
        "Finał": generateFinal(),           // Używamy nowej funkcji
    } : {
        "Faza grupowa": [],
        "Ćwierćfinały": [],
        "Półfinały": [],
        "Finał": [],
    };

    const matches = scheduleByPhase[selectedPhase] || [];

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
                {teams.length < 16 ? (
                    <p className="no-matches-message">Oczekiwanie na pełną rejestrację 16 drużyn, aby wygenerować harmonogram.</p>
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