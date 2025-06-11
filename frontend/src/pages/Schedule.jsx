import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");
    const [loading, setLoading] = useState(true); // Stan ładowania danych
    const [error, setError] = useState(null);   // Stan błędu

    // Użyj zmiennej środowiskowej dla adresu URL API
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            setError(null);
            try {
                // Zmieniono na pobieranie z backendu /api/teams
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Błąd HTTP ${response.status}: ${errorText}`);
                    throw new Error(`Błąd HTTP! status: ${response.status}, wiadomość: ${errorText}`);
                }
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Błąd ładowania drużyn z API:", err);
                setError("Nie udało się załadować drużyn. Spróbuj odświeżyć stronę.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [API_BASE_URL]); // Dodaj API_BASE_URL jako zależność, aby uniknąć ostrzeżeń

    const isFinished = (score) => score && /\d\s*:\s*\d/.test(score);
    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png"
    };

    // === Generowanie fazy grupowej ===
    const groupLabels = ["A", "B", "C", "D"];
    const groups = groupLabels.map((_, idx) => {
        // Podziel teams na grupy po 4, uzupełniając nullami jeśli brakuje drużyn
        const group = teams.slice(idx * 4, (idx + 1) * 4);
        while (group.length < 4) group.push(null);
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
                        round: `Faza grupowa ${label}`, // Zmieniono z "Grupa X" na "Faza grupowa X" dla spójności
                        date: "", // Data zostanie dodana później
                        teamA: teamA
                            ? { name: teamA.name, logo: teamA.logo } // Logo jest już pełnym URL-em
                            : placeholderTeam,
                        teamB: teamB
                            ? { name: teamB.name, logo: teamB.logo }
                            : placeholderTeam,
                        score: "– : –",
                    });
                });
            });
            return matches;
        });

        // Dokładnie odwzorowana logika datowania meczów grupowych
        const startDate = new Date("2025-06-14T18:00:00");
        let matchDay = 0;
        const matchHourOffsets = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]; // Co 30 minut
        let matchIndex = 0; // Globalny indeks meczów, by rozkładać je równomiernie

        // Ta pętla symuluje Twoją oryginalną logikę rozkładania meczów na dni i godziny
        while (groupMatchMap.some(group => group.length > 0)) {
            for (let g = 0; g < groupMatchMap.length; g++) {
                const groupMatches = groupMatchMap[g];
                let added = 0;

                for (let i = 0; i < groupMatches.length; i++) {
                    const match = groupMatches[i];

                    const hourOffset = matchHourOffsets[matchIndex % 8];
                    const currentMatchDate = new Date(startDate);
                    currentMatchDate.setDate(startDate.getDate() + matchDay);
                    currentMatchDate.setMinutes(currentMatchDate.getMinutes() + hourOffset * 60);

                    match.date = `${currentMatchDate.toLocaleDateString("pl-PL")} ${currentMatchDate.getHours().toString().padStart(2, '0')}:${currentMatchDate.getMinutes().toString().padStart(2, '0')}`;
                    allGroupMatches.push(match);

                    groupMatches.splice(i, 1); // Usuń dodany mecz z tymczasowej listy
                    added++;
                    matchIndex++;

                    if (added === 2) break; // Dodawaj 2 mecze na grupę w "kolejce" dziennej
                    i--; // Po usunięciu elementu, zmniejsz indeks
                }
            }
            if (matchIndex % 8 === 0) { // Zmieniaj dzień co 8 meczów (czyli 2 mecze z każdej z 4 grup)
                matchDay++;
            }
        }
        return allGroupMatches;
    };

    // === Generowanie ćwierćfinałów na podstawie grup ===
    const generateQuarterfinals = () => {
        const qf = [];
        const qfStartDate = new Date("2025-06-17T14:00:00"); // Startowa data dla ćwierćfinałów

        // Odwzorowanie oryginalnych placeholderów z Twojego pliku, ale z próbą przypisania drużyn
        // UWAGA: Ta logika zakłada, że `teams` są posortowane w jakiś sposób, który pozwala określić "A1", "B2" itd.
        // Jeśli nie masz logicznego sortowania lub zasad kwalifikacji, te miejsca będą wypełniane na sztywno.
        // DLA CELÓW ODWZOROWANIA, NA RAZIE BEZ ZAAWANSOWANEJ LOGIKI KWALIFIKACJI
        // Po prostu użyjemy pierwszych 8 drużyn z `teams` jako przykładowych zwycięzców/drugich miejsc.
        // W PRZYSZŁOŚCI POTRZEBNA BYŁABY LOGIKA DO WYLICZANIA STANU GRUP I KTO PRZESZEDŁ DALEJ.
        const qualifiedTeamPlaceholders = [
            teams[0] || { name: "A1", logo: placeholderTeam.logo },
            teams[4] || { name: "B2", logo: placeholderTeam.logo }, // Zastąp placeholderem, jeśli teams[4] nie istnieje
            teams[8] || { name: "C2", logo: placeholderTeam.logo },
            teams[12] || { name: "D1", logo: placeholderTeam.logo },
            teams[1] || { name: "B1", logo: placeholderTeam.logo },
            teams[5] || { name: "A2", logo: placeholderTeam.logo },
            teams[9] || { name: "C1", logo: placeholderTeam.logo },
            teams[13] || { name: "D2", logo: placeholderTeam.logo },
        ];


        const matchups = [
            [qualifiedTeamPlaceholders[0], qualifiedTeamPlaceholders[1]], // A1 vs B2
            [qualifiedTeamPlaceholders[2], qualifiedTeamPlaceholders[3]], // C2 vs D1
            [qualifiedTeamPlaceholders[4], qualifiedTeamPlaceholders[5]], // B1 vs A2
            [qualifiedTeamPlaceholders[6], qualifiedTeamPlaceholders[7]], // C1 vs D2
        ];

        matchups.forEach(([teamA, teamB], i) => {
            const matchDate = new Date(qfStartDate);
            matchDate.setHours(qfStartDate.getHours() + i * 2); // Co 2 godziny

            qf.push({
                round: "Ćwierćfinały", // Nazwa zgodna z phaseRoundMapping
                date: `${matchDate.toLocaleDateString("pl-PL")} ${matchDate.getHours().toString().padStart(2, '0')}:${matchDate.getMinutes().toString().padStart(2, '0')}`,
                teamA: { name: teamA.name, logo: teamA.logo },
                teamB: { name: teamB.name, logo: teamB.logo },
                score: "– : –",
            });
        });
        return qf;
    };

    // === Półfinały i Finał statycznie, z ulepszonymi placeholderami ===
    const generateSemifinals = () => {
        const sfStartDate = new Date("2025-06-19T16:00:00");
        return [
            {
                round: "Półfinały",
                date: `${sfStartDate.toLocaleDateString("pl-PL")} ${sfStartDate.getHours().toString().padStart(2, '0')}:${sfStartDate.getMinutes().toString().padStart(2, '0')}`,
                teamA: { name: "Zwycięzca QF1", logo: placeholderTeam.logo },
                teamB: { name: "Zwycięzca QF2", logo: placeholderTeam.logo },
                score: "– : –",
            },
            {
                round: "Półfinały",
                date: `${new Date(sfStartDate.getTime() + 4 * 60 * 60 * 1000).toLocaleDateString("pl-PL")} ${new Date(sfStartDate.getTime() + 4 * 60 * 60 * 1000).getHours().toString().padStart(2, '0')}:${new Date(sfStartDate.getTime() + 4 * 60 * 60 * 1000).getMinutes().toString().padStart(2, '0')}`,
                teamA: { name: "Zwycięzca QF3", logo: placeholderTeam.logo },
                teamB: { name: "Zwycięzca QF4", logo: placeholderTeam.logo },
                score: "– : –",
            },
        ];
    };

    const generateFinal = () => {
        const finalDate = new Date("2025-06-21T20:30:00");
        return [
            {
                round: "Finał",
                date: `${finalDate.toLocaleDateString("pl-PL")} ${finalDate.getHours().toString().padStart(2, '0')}:${finalDate.getMinutes().toString().padStart(2, '0')}`,
                teamA: { name: "Zwycięzca SF1", logo: placeholderTeam.logo },
                teamB: { name: "Zwycięzca SF2", logo: placeholderTeam.logo },
                score: "– : –",
            },
        ];
    };

    // Obliczanie wszystkich meczów za pomocą funkcji generujących
    // Używamy useMemo, aby harmonogram był generowany tylko, gdy zmieniają się drużyny
    const allGeneratedMatches = useState(() => {
        if (teams.length > 0) {
            return [
                ...generateGroupMatches(),
                ...generateQuarterfinals(),
                ...generateSemifinals(),
                ...generateFinal(),
            ];
        }
        return []; // Zwróć pustą tablicę, jeśli nie ma drużyn
    }, [teams]); // Zależność od teams

    // Mapa dla ułatwienia filtrowania na frontendzie.
    const phaseRoundMapping = {
        "Faza grupowa": "Faza grupowa",
        "Ćwierćfinały": "Ćwierćfinały",
        "Półfinały": "Półfinały",
        "Finał": "Finał",
    };

    // Filtrowanie meczów do wyświetlenia na podstawie wybranej fazy
    const matchesToDisplay = allGeneratedMatches[0].filter(match => { // Bierzemy wartość z useMemo
        if (selectedPhase === "Faza grupowa") {
            return match.round && match.round.startsWith("Faza grupowa");
        }
        return match.round === phaseRoundMapping[selectedPhase];
    });


    // Loader i komunikat o błędzie
    if (loading) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <div className="loading-message">Ładowanie drużyn...</div>
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
                    {Object.keys(phaseRoundMapping).map((phase) => (
                        <option key={phase} value={phase}>
                            {phase}
                        </option>
                    ))}
                </select>
            </div>

            <div className="match-list">
                {matchesToDisplay.length === 0 ? (
                    <p className="no-matches-message">Brak meczów do wyświetlenia dla tej fazy.</p>
                ) : (
                    matchesToDisplay.map((match, i) => {
                        const finished = isFinished(match.score);
                        let teamAClass = "team";
                        let teamBClass = "team";

                        if (finished) {
                            const [scoreA, scoreB] = match.score.split(":").map((s) => parseInt(s.trim()));
                            if (scoreA > scoreB) teamAClass += " winner";
                            else if (scoreB > scoreA) teamBClass += " winner";
                        }

                        // Upewnij się, że logo są poprawnie sformatowane (pełne URL-e z Cloudinary są OK)
                        const teamALogo = match.teamA && match.teamA.logo ? match.teamA.logo : placeholderTeam.logo;
                        const teamBLogo = match.teamB && match.teamB.logo ? match.teamB.logo : placeholderTeam.logo;
                        const teamAName = match.teamA && match.teamA.name ? match.teamA.name : placeholderTeam.name;
                        const teamBName = match.teamB && match.teamB.name ? match.teamB.name : placeholderTeam.name;

                        return (
                            <div
                                className={`match-card ${finished ? "finished" : "upcoming"}`}
                                key={i}
                            >
                                <div className="match-round">{match.round || "Brak rundy"}</div>
                                <div className="match-date">{match.date || "Brak daty"}</div>
                                <div className="match-row">
                                    <div className={teamAClass}>
                                        <img src={teamALogo} alt={teamAName} />
                                        <span>{teamAName}</span>
                                    </div>
                                    <div className="match-score">{match.score || "– : –"}</div>
                                    <div className={teamBClass}>
                                        <img src={teamBLogo} alt={teamBName} />
                                        <span>{teamBName}</span>
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