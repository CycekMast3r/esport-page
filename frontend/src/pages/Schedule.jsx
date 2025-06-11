import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");
    const [loading, setLoading] = useState(true); // Dodano stan ładowania
    const [error, setError] = useState(null);   // Dodano stan błędu

    // Użyj VITE_API_URL, jeśli jest zdefiniowane, w przeciwnym razie domyślna ścieżka
    const API_BASE_URL = import.meta.env.VITE_API_URL || "";

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            setError(null);
            try {
                // Zmieniono ścieżkę do pobierania danych z teams.json na backend
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Błąd ładowania danych drużyn z backendu:", err);
                setError("Nie udało się załadować harmonogramu. Spróbuj odświeżyć stronę.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [API_BASE_URL]); // Dodaj API_BASE_URL do zależności useEffect

    const isFinished = (score) => /\d\s*:\s*\d/.test(score);

    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png", // Ścieżka do globalnego placeholdera
    };

    // Funkcja pomocnicza do pobierania danych drużyny lub placeholdera
    const getTeamDisplayInfo = (team) => {
        return team
            ? { name: team.name, logo: team.logo ? `/uploads/${team.logo}` : "/images/default-logo.png" } // Zakładam, że logo jest w /uploads/
            : placeholderTeam;
    };

    const groupLabels = ["A", "B", "C", "D"];
    // Podział drużyn na grupy, uzupełniając nullami brakujące miejsca
    const groups = groupLabels.map((_, idx) => {
        const group = teams.slice(idx * 4, (idx + 1) * 4);
        while (group.length < 4) group.push(null);
        return group;
    });

    const generateGroupMatches = () => {
        const allGroupMatches = [];

        // Pary meczów dla każdej grupy (każdy z każdym)
        const matchPairsInGroup = [
            [0, 1], [0, 2], [0, 3],
            [1, 2], [1, 3],
            [2, 3]
        ];

        const groupMatchMap = groups.map((group, groupIdx) => {
            const label = groupLabels[groupIdx];
            const matches = [];

            matchPairsInGroup.forEach(([i, j]) => {
                const teamA = group[i];
                const teamB = group[j];

                // Generuj mecz tylko jeśli przynajmniej jedna z drużyn jest rzeczywistą drużyną
                if (teamA || teamB) {
                    matches.push({
                        round: `Grupa ${label}`,
                        date: "",
                        teamA: getTeamDisplayInfo(teamA),
                        teamB: getTeamDisplayInfo(teamB),
                        score: "– : –",
                    });
                }
            });
            return matches;
        });

        const startDate = new Date("2025-06-14T18:00:00");
        let matchDay = 0;
        const matchHourOffsets = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]; // Co 30 minut
        let matchIndexInDay = 0; // Licznik meczów w danym dniu

        // Spłaszczamy wszystkie mecze grupowe do jednej listy
        const flatGroupMatches = groupMatchMap.flat();

        // Sortowanie po to, aby mecze były równomiernie rozłożone, np. Mecz A1, B1, C1, D1, A2, B2, C2, D2
        flatGroupMatches.sort((a, b) => {
            const groupAIndex = groupLabels.indexOf(a.round.split(' ')[1]);
            const groupBIndex = groupLabels.indexOf(b.round.split(' ')[1]);
            return groupAIndex - groupBIndex;
        });


        // Logika rozłożenia meczów grupowych w czasie
        flatGroupMatches.forEach(match => {
            const hourOffset = matchHourOffsets[matchIndexInDay % 8];
            const currentMatchDate = new Date(startDate);
            currentMatchDate.setDate(startDate.getDate() + matchDay);
            currentMatchDate.setMinutes(currentMatchDate.getMinutes() + hourOffset * 60);

            match.date = `${currentMatchDate.toLocaleDateString("pl-PL")} ${currentMatchDate.getHours().toString().padStart(2, '0')}:${currentMatchDate.getMinutes().toString().padStart(2, '0')}`;
            allGroupMatches.push(match);

            matchIndexInDay++;

            if (matchIndexInDay % 8 === 0) { // Jeśli wykorzystano wszystkie sloty w dniu, przejdź do następnego dnia
                matchDay++;
                matchIndexInDay = 0; // Resetuj licznik meczów w dniu
            }
        });

        return allGroupMatches;
    };

    const generateQuarterfinals = () => {
        // Logika przydzielania drużyn do ćwierćfinałów
        // Zakładamy, że groups[0][0] to A1, groups[1][1] to B2 itp.
        // Jeśli drużyna nie istnieje (jest null), użyjemy placeholdera.

        const qf = [];
        const qfStartDate = new Date("2025-06-17T14:00:00");

        // Ćwierćfinał 1: A1 vs B2
        qf.push({
            round: "Ćwierćfinał",
            date: `${new Date(qfStartDate).toLocaleDateString("pl-PL")} ${new Date(qfStartDate).getHours().toString().padStart(2, '0')}:${new Date(qfStartDate).getMinutes().toString().padStart(2, '0')}`,
            teamA: getTeamDisplayInfo(groups[0][0]),
            teamB: getTeamDisplayInfo(groups[1][1]),
            score: "– : –",
        });

        // Ćwierćfinał 2: C2 vs D1
        const qf2Date = new Date(qfStartDate);
        qf2Date.setHours(qfStartDate.getHours() + 2);
        qf.push({
            round: "Ćwierćfinał",
            date: `${qf2Date.toLocaleDateString("pl-PL")} ${qf2Date.getHours().toString().padStart(2, '0')}:${qf2Date.getMinutes().toString().padStart(2, '0')}`,
            teamA: getTeamDisplayInfo(groups[2][1]),
            teamB: getTeamDisplayInfo(groups[3][0]),
            score: "– : –",
        });

        // Ćwierćfinał 3: B1 vs A2
        const qf3Date = new Date(qfStartDate);
        qf3Date.setHours(qfStartDate.getHours() + 4);
        qf.push({
            round: "Ćwierćfinał",
            date: `${qf3Date.toLocaleDateString("pl-PL")} ${qf3Date.getHours().toString().padStart(2, '0')}:${qf3Date.getMinutes().toString().padStart(2, '0')}`,
            teamA: getTeamDisplayInfo(groups[1][0]),
            teamB: getTeamDisplayInfo(groups[0][1]),
            score: "– : –",
        });

        // Ćwierćfinał 4: C1 vs D2
        const qf4Date = new Date(qfStartDate);
        qf4Date.setHours(qfStartDate.getHours() + 6);
        qf.push({
            round: "Ćwierćfinał",
            date: `${qf4Date.toLocaleDateString("pl-PL")} ${qf4Date.getHours().toString().padStart(2, '0')}:${qf4Date.getMinutes().toString().padStart(2, '0')}`,
            teamA: getTeamDisplayInfo(groups[2][0]),
            teamB: getTeamDisplayInfo(groups[3][1]),
            score: "– : –",
        });

        return qf;
    };


    const staticPhases = {
        "Półfinały": [
            {
                round: "Półfinał",
                date: "19.06.2025, 16:00",
                teamA: placeholderTeam, // placeholder dla zwycięzcy QF1
                teamB: placeholderTeam, // placeholder dla zwycięzcy QF2
                score: "– : –",
            },
            {
                round: "Półfinał",
                date: "19.06.2025, 20:00",
                teamA: placeholderTeam, // placeholder dla zwycięzcy QF3
                teamB: placeholderTeam, // placeholder dla zwycięzcy QF4
                score: "– : –",
            },
        ],
        "Finał": [
            {
                round: "Finał",
                date: "21.06.2025, 20:30",
                teamA: placeholderTeam,
                teamB: placeholderTeam,
                score: "– : –",
            },
        ],
    };

    // Generuj harmonogram zawsze
    const scheduleByPhase = {
        "Faza grupowa": generateGroupMatches(),
        "Ćwierćfinały": generateQuarterfinals(),
        ...staticPhases,
    };

    const matches = scheduleByPhase[selectedPhase] || [];

    if (loading) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <p className="loading-message">Ładowanie harmonogramu...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <p className="error-message">{error}</p>
                <p className="error-message-detail">Sprawdź połączenie internetowe lub spróbuj ponownie.</p>
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
                {matches.length === 0 && selectedPhase === "Faza grupowa" && teams.length === 0 ? (
                    <p className="no-matches-message">Brak zarejestrowanych drużyn do wyświetlenia harmonogramu fazy grupowej.</p>
                ) : matches.length === 0 ? (
                    <p className="no-matches-message">Brak meczów do wyświetlenia w tej fazie.</p>
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