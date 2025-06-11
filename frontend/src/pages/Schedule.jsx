import { useEffect, useState } from "react";
import "../styles/Schedule.css";

// Stałe dla adresu API (możesz to wyciągnąć do pliku konfiguracyjnego)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // Upewnij się, że VITE_API_BASE_URL jest ustawione dla Render
// const API_BASE_URL = "https://twoj-backend-na-renderze.onrender.com"; // Przykładowy adres Render

function Schedule() {
    const [matches, setMatches] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Endpointy dla poszczególnych faz z backendu
    const phaseEndpoints = {
        "Faza grupowa": "/api/matches/group-phase", // Założenie, że backend ma taki endpoint
        "Ćwierćfinały": "/api/matches/quarterfinals",
        "Półfinały": "/api/matches/semifinals",
        "Finał": "/api/matches/final",
    };

    // Obsługa zmiany fazy i pobierania danych
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            setError(null);
            const endpoint = phaseEndpoints[selectedPhase];

            if (!endpoint) {
                setMatches([]);
                setLoading(false);
                return;
            }

            try {
                // To jest kluczowe: pobieramy dane z Twojego API backendowego
                const response = await fetch(`${API_BASE_URL}${endpoint}`);
                if (!response.ok) {
                    throw new Error(`Błąd HTTP: ${response.status}`);
                }
                const data = await response.json();
                setMatches(data);
            } catch (err) {
                console.error(`Błąd ładowania meczów dla fazy ${selectedPhase}:`, err);
                setError("Nie udało się załadować meczów. Spróbuj ponownie później.");
                setMatches([]); // Wyczyść mecze w przypadku błędu
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [selectedPhase, phaseEndpoints]); // Re-fetch, gdy zmieni się faza

    const isFinished = (score) => /\d\s*:\s*\d/.test(score);

    // Uwaga: Funkcje generateGroupMatches, generateQuarterfinals i staticPhases
    // powinny być przeniesione na backend i dostarczać gotowe dane przez API.
    // Tutaj zostawiam je jako zaślepkę, aby komponent działał z istniejącymi danymi,
    // dopóki backend nie będzie gotowy. Docelowo te funkcje należy usunąć.

    // === TO POWINNO BYĆ NA BACKENDZIE ===
    // Zaślepka dla teams (powinna pochodzić z bazy danych przez API)
    const [allTeams, setAllTeams] = useState([]);
    useEffect(() => {
        fetch("/uploads/teams.json") // Nadal pobieramy teams.json dla logiki zaślepki
            .then((res) => res.json())
            .then((data) => setAllTeams(data))
            .catch((err) => console.error("Błąd ładowania teams.json:", err));
    }, []);

    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png"
    };

    const generateGroupMatchesPlaceholder = (currentTeams) => {
        const groupLabels = ["A", "B", "C", "D"];
        const groups = groupLabels.map((_, idx) => {
            const group = currentTeams.slice(idx * 4, (idx + 1) * 4);
            while (group.length < 4) group.push(null);
            return group;
        });

        const allGroupMatches = [];
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
                        date: "",
                        teamA: teamA ? { name: teamA.name, logo: `/uploads/${teamA.logo}` } : placeholderTeam,
                        teamB: teamB ? { name: teamB.name, logo: `/uploads/${teamB.logo}` } : placeholderTeam,
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

        while (groupMatchMap.some(group => group.length > 0)) {
            for (let g = 0; g < groupMatchMap.length; g++) {
                const groupMatches = groupMatchMap[g];
                if (groupMatches.length === 0) continue; // Skip empty groups

                let added = 0;
                // Add two matches from the current group for the current slot
                // To avoid modifying array while iterating, pull out matches first
                const matchesToAdd = groupMatches.splice(0, Math.min(2, groupMatches.length));

                matchesToAdd.forEach(match => {
                    const hourOffset = matchHourOffsets[matchIndex % matchHourOffsets.length];
                    const currentMatchDate = new Date(startDate);
                    currentMatchDate.setDate(startDate.getDate() + matchDay);
                    currentMatchDate.setMinutes(startDate.getMinutes() + hourOffset * 60);

                    match.date = `${currentMatchDate.toLocaleDateString("pl-PL")} ${currentMatchDate.getHours().toString().padStart(2, '0')}:${currentMatchDate.getMinutes().toString().padStart(2, '0')}`;
                    allGroupMatches.push(match);
                    matchIndex++;
                });

                if (matchIndex % matchHourOffsets.length === 0) { // If all slots for a day are filled
                    matchDay++;
                }
            }
        }
        return allGroupMatches;
    };


    const generateQuarterfinalsPlaceholder = (currentTeams) => {
        // Ta logika jest trudna do zaimplementowania bez znajomości wyników grup.
        // W realnej aplikacji ćwierćfinały byłyby generowane na podstawie wyników fazy grupowej,
        // które pochodziłyby z backendu. Tutaj zwracam statyczne dane z placeholderami.
        return [
            {
                round: "Ćwierćfinał",
                date: "17.06.2025, 14:00",
                teamA: { name: "A1", logo: placeholderTeam.logo },
                teamB: { name: "B2", logo: placeholderTeam.logo },
                score: "– : –",
            },
            {
                round: "Ćwierćfinał",
                date: "17.06.2025, 16:00",
                teamA: { name: "C2", logo: placeholderTeam.logo },
                teamB: { name: "D1", logo: placeholderTeam.logo },
                score: "– : –",
            },
            {
                round: "Ćwierćfinał",
                date: "17.06.2025, 18:00",
                teamA: { name: "B1", logo: placeholderTeam.logo },
                teamB: { name: "A2", logo: placeholderTeam.logo },
                score: "– : –",
            },
            {
                round: "Ćwierćfinał",
                date: "17.06.2025, 20:00",
                teamA: { name: "C1", logo: placeholderTeam.logo },
                teamB: { name: "D2", logo: placeholderTeam.logo },
                score: "– : –",
            },
        ];
    };

    const staticPhasesPlaceholder = {
        "Półfinały": [
            {
                round: "Półfinał",
                date: "19.06.2025, 16:00",
                teamA: { name: "Zwycięzca QF1", logo: placeholderTeam.logo },
                teamB: { name: "Zwycięzca QF2", logo: placeholderTeam.logo },
                score: "– : –",
            },
            {
                round: "Półfinał",
                date: "19.06.2025, 20:00",
                teamA: { name: "Zwycięzca QF3", logo: placeholderTeam.logo },
                teamB: { name: "Zwycięzca QF4", logo: placeholderTeam.logo },
                score: "– : –",
            },
        ],
        "Finał": [
            {
                round: "Finał",
                date: "21.06.2025, 20:30",
                teamA: { name: "??", logo: placeholderTeam.logo },
                teamB: { name: "??", logo: placeholderTeam.logo },
                score: "– : –",
            },
        ],
    };

    // To służy tylko do zbudowania listy dostępnych faz dla selectora
    // Docelowo, lista faz powinna też pochodzić z backendu lub być stała,
    // jeśli frontend zawsze wie, jakie fazy są dostępne.
    const allAvailablePhases = {
        "Faza grupowa": generateGroupMatchesPlaceholder(allTeams), // Używamy danych z teams.json
        "Ćwierćfinały": generateQuarterfinalsPlaceholder(allTeams),
        ...staticPhasesPlaceholder,
    };
    // === KONIEC: TO POWINNO BYĆ NA BACKENDZIE ===


    if (loading) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <div>Ładowanie harmonogramu...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <div className="error-message">{error}</div>
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
                    {Object.keys(allAvailablePhases).map((phase) => ( // Używamy allAvailablePhases do generowania opcji
                        <option key={phase} value={phase}>
                            {phase}
                        </option>
                    ))}
                </select>
            </div>

            <div className="match-list">
                {matches.length === 0 && !loading && !error ? (
                    <p>Brak meczów do wyświetlenia dla tej fazy.</p>
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