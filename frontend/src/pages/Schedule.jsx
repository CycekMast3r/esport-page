import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || ""; // Upewnij się, że VITE_API_URL jest zdefiniowane

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            setError(null);
            try {
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
        logo: "/images/question-mark.png"
    };

    const groupLabels = ["A", "B", "C", "D"];

    // Funkcja do dzielenia drużyn na grupy, zgodna z logiką z TournamentBracket.jsx
    const divideIntoGroups = (allTeams) => {
        return groupLabels.map((groupName, i) => {
            const start = i * 4;
            const groupTeams = allTeams.slice(start, start + 4);
            // Uzupełnij grupę nullami, jeśli jest mniej niż 4 drużyny
            while (groupTeams.length < 4) {
                groupTeams.push(null);
            }
            return groupTeams;
        });
    };

    // Podziel drużyny na grupy w oparciu o aktualny stan `teams`
    const groups = divideIntoGroups(teams);

    // Funkcja pomocnicza do pobierania danych drużyny lub placeholdera
    const getTeamDisplayInfo = (team) => {
        return team
            ? { name: team.name, logo: team.logo || "/images/default-logo.png" } // Dodaj domyślne logo, jeśli drużyna nie ma
            : placeholderTeam;
    };

    const generateGroupMatches = () => {
        const allGroupMatches = [];
        const matchPairs = [
            [0, 1], [0, 2], [0, 3], // Mecze dla pierwszej drużyny
            [1, 2], [1, 3],         // Mecze dla drugiej drużyny
            [2, 3]                  // Mecze dla trzeciej drużyny
        ]; // Wszystkie unikalne pary w grupie 4-osobowej

        const groupMatchMap = groups.map((group, groupIdx) => {
            const label = groupLabels[groupIdx];
            const matches = [];

            // Generuj mecze tylko pomiędzy istniejącymi drużynami
            // Przejdź przez wszystkie unikalne pary indeksów w grupie
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const teamA = group[i];
                    const teamB = group[j];

                    // Utwórz mecz tylko jeśli przynajmniej jedna z drużyn jest rzeczywistą drużyną
                    // Jeśli obie są null, ten mecz nie ma sensu i zostanie pominięty
                    if (teamA || teamB) {
                        matches.push({
                            round: `Grupa ${label}`,
                            date: "",
                            teamA: getTeamDisplayInfo(teamA),
                            teamB: getTeamDisplayInfo(teamB),
                            score: "– : –",
                        });
                    }
                }
            }
            return matches;
        });

        // Płaskie połączenie wszystkich meczów grupowych
        const flatGroupMatches = groupMatchMap.flat();

        // Sortowanie dla lepszej prezentacji, np. A1, B1, C1, D1, A2, B2, C2, D2
        flatGroupMatches.sort((a, b) => {
            const groupAIndex = groupLabels.indexOf(a.round.split(' ')[1]);
            const groupBIndex = groupLabels.indexOf(b.round.split(' ')[1]);
            // Jeśli z tej samej grupy, posortuj po nazwach drużyn (dla stabilności)
            if (groupAIndex === groupBIndex) {
                return a.teamA.name.localeCompare(b.teamA.name);
            }
            return groupAIndex - groupBIndex;
        });

        // Logika przypisywania dat
        const startDate = new Date("2025-06-14T18:00:00");
        let matchDay = 0;
        const matchHourOffsets = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]; // Co 30 minut
        let matchIndexInDay = 0; // Licznik meczów w danym dniu

        // Przejdź przez wszystkie mecze i przypisz im daty
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
        // Zakładamy, że groups[X][0] to zwycięzca grupy X (1. miejsce), a groups[X][1] to 2. miejsce
        // To jest uproszczenie; w prawdziwym turnieju potrzebny byłby system rankingowy.

        // Mecz 1: A1 vs B2
        const qf1TeamA = groups[0][0]; // Pierwsza drużyna z grupy A
        const qf1TeamB = groups[1][1]; // Druga drużyna z grupy B

        // Mecz 2: C2 vs D1
        const qf2TeamA = groups[2][1]; // Druga drużyna z grupy C
        const qf2TeamB = groups[3][0]; // Pierwsza drużyna z grupy D

        // Mecz 3: B1 vs A2
        const qf3TeamA = groups[1][0]; // Pierwsza drużyna z grupy B
        const qf3TeamB = groups[0][1]; // Druga drużyna z grupy A

        // Mecz 4: D2 vs C1
        const qf4TeamA = groups[3][1]; // Druga drużyna z grupy D
        const qf4TeamB = groups[2][0]; // Pierwsza drużyna z grupy C

        const matchups = [
            { teamA: getTeamDisplayInfo(qf1TeamA), teamB: getTeamDisplayInfo(qf1TeamB) },
            { teamA: getTeamDisplayInfo(qf2TeamA), teamB: getTeamDisplayInfo(qf2TeamB) },
            { teamA: getTeamDisplayInfo(qf3TeamA), teamB: getTeamDisplayInfo(qf3TeamB) },
            { teamA: getTeamDisplayInfo(qf4TeamA), teamB: getTeamDisplayInfo(qf4TeamB) },
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
                teamA: placeholderTeam,
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

    // Generuj harmonogram zawsze
    const scheduleByPhase = {
        "Faza grupowa": generateGroupMatches(),
        "Ćwierćfinały": generateQuarterfinals(),
        "Półfinały": generateSemifinals(),
        "Finał": generateFinal(),
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
                {matches.length === 0 ? (
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