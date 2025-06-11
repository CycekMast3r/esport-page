import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Endpoint do pobierania drużyn z backendu
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            setError(null);
            try {
                // Pobierz drużyny z Twojego backendu
                const response = await fetch(`${API_BASE_URL}/api/teams`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Błąd HTTP ${response.status}: ${errorText}`);
                    throw new Error(`Błąd HTTP! status: ${response.status}, wiadomość: ${errorText}`);
                }
                const data = await response.json();
                setTeams(data);
            } catch (err) {
                console.error("Błąd ładowania drużyn:", err);
                setError("Nie udało się załadować drużyn. Spróbuj odświeżyć stronę.");
                setTeams([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [API_BASE_URL]);

    const isFinished = (score) => score && /\d\s*:\s*\d/.test(score);
    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png" // Domyślne logo, jeśli brak
    };

    // === Generowanie fazy grupowej ===
    const groupLabels = ["A", "B", "C", "D"];
    const groups = groupLabels.map((_, idx) => {
        // Podziel teams na grupy po 4, uzupełniając nullami jeśli brakuje drużyn
        const group = teams.slice(idx * 4, (idx + 1) * 4);
        while (group.length < 4) group.push(null); // Uzupełnij nullami, jeśli mniej niż 4 drużyny w grupie
        return group;
    });

    const generateGroupMatches = () => {
        const allGroupMatches = [];

        // 3 ustalone kolejki: [0,1]-[2,3], [0,2]-[1,3], [0,3]-[1,2] (klasyczny system kołowy dla 4 drużyn)
        const matchPairs = [
            [[0, 1], [2, 3]], // Mecz 1, Mecz 2
            [[0, 2], [1, 3]], // Mecz 3, Mecz 4
            [[0, 3], [1, 2]]  // Mecz 5, Mecz 6
        ];

        // Startowa data i godzina dla meczów fazy grupowej
        const startDate = new Date("2025-06-14T18:00:00");
        let currentMatchDate = new Date(startDate);
        let matchCounter = 0; // Licznik meczów do rozłożenia w czasie

        groups.forEach((group, groupIdx) => {
            const label = groupLabels[groupIdx];
            matchPairs.forEach(pairSet => {
                pairSet.forEach(([i, j]) => {
                    const teamA = group[i];
                    const teamB = group[j];

                    // Zwiększamy datę o 1 dzień co 8 meczów (co 2 mecze na grupę w ciągu dnia)
                    // lub zmieniamy godzinę co 2 mecze
                    const dayOffset = Math.floor(matchCounter / (groupLabels.length * 2)); // Dzień zmienia się po wszystkich grupach (8 meczów/dzień)
                    const hourOffset = (matchCounter % (groupLabels.length * 2)) * 2; // Godzina co 2 godziny, reset co 8 meczów

                    const matchDate = new Date(startDate);
                    matchDate.setDate(startDate.getDate() + dayOffset);
                    matchDate.setHours(startDate.getHours() + hourOffset);
                    matchDate.setMinutes(startDate.getMinutes()); // Reset minut na początek godziny

                    allGroupMatches.push({
                        round: `Faza grupowa ${label}`, // Zmieniono na Faza grupowa X
                        matchDate: matchDate.toISOString(), // Użyj ISO String dla łatwiejszego formatowania
                        teamA: teamA
                            ? { name: teamA.name, logo: teamA.logo } // Logo jest już pełnym URL-em z Cloudinary
                            : placeholderTeam,
                        teamB: teamB
                            ? { name: teamB.name, logo: teamB.logo }
                            : placeholderTeam,
                        score: "– : –",
                    });
                    matchCounter++;
                });
            });
        });
        // Sortowanie wszystkich meczów grupowych po dacie
        return allGroupMatches.sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
    };

    // === Generowanie ćwierćfinałów na podstawie grup (dynamiczne, ale z placeholderami) ===
    const generateQuarterfinals = () => {
        const qf = [];
        const qfStartDate = new Date("2025-06-17T14:00:00");

        // Założenia do matchupów: A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2 (przykładowe, musisz ustalić swoje)
        const teamPlaceholders = [
            { name: "Zwycięzca Gr. A (1)", logo: "" }, // Zwycięzca Grupy A
            { name: "2. miejsce Gr. B", logo: "" },    // Drugie miejsce Grupy B
            { name: "Zwycięzca Gr. C (1)", logo: "" },
            { name: "2. miejsce Gr. D", logo: "" },
            { name: "Zwycięzca Gr. B (1)", logo: "" },
            { name: "2. miejsce Gr. A", logo: "" },
            { name: "Zwycięzca Gr. D (1)", logo: "" },
            { name: "2. miejsce Gr. C", logo: "" },
        ];

        // Przykładowe drużyny z grup - zakładamy, że pierwsze dwie drużyny z każdej grupy przechodzą
        // TO JEST UPROSZCZONE! Realnie potrzebowałbyś logiki do określania zwycięzców/drugich miejsc
        const qualifiedTeams = groups.flatMap(group => group.slice(0, 2));

        const matchups = [
            [qualifiedTeams[0] || teamPlaceholders[0], qualifiedTeams[3] || teamPlaceholders[1]], // A1 vs B2
            [qualifiedTeams[4] || teamPlaceholders[2], qualifiedTeams[7] || teamPlaceholders[3]], // C1 vs D2
            [qualifiedTeams[2] || teamPlaceholders[4], qualifiedTeams[1] || teamPlaceholders[5]], // B1 vs A2
            [qualifiedTeams[6] || teamPlaceholders[6], qualifiedTeams[5] || teamPlaceholders[7]], // D1 vs C2
        ];


        matchups.forEach((pair, i) => {
            const [teamA, teamB] = pair;
            const matchDate = new Date(qfStartDate);
            matchDate.setHours(qfStartDate.getHours() + i * 2); // Co 2 godziny

            qf.push({
                round: "Ćwierćfinały", // Nazwa zgodna z phaseRoundMapping
                matchDate: matchDate.toISOString(),
                teamA: teamA
                    ? { name: teamA.name, logo: teamA.logo || placeholderTeam.logo }
                    : placeholderTeam,
                teamB: teamB
                    ? { name: teamB.name, logo: teamB.logo || placeholderTeam.logo }
                    : placeholderTeam,
                score: "– : –",
            });
        });
        return qf;
    };

    // === Półfinały i Finał (statyczne z placeholderami) ===
    const generateSemifinals = () => {
        const sfStartDate = new Date("2025-06-19T16:00:00");
        return [
            {
                round: "Półfinały",
                matchDate: sfStartDate.toISOString(),
                teamA: { name: "Zwycięzca QF1", logo: placeholderTeam.logo },
                teamB: { name: "Zwycięzca QF2", logo: placeholderTeam.logo },
                score: "– : –",
            },
            {
                round: "Półfinały",
                matchDate: new Date(sfStartDate.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 godziny później
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
                matchDate: finalDate.toISOString(),
                teamA: { name: "Zwycięzca SF1", logo: placeholderTeam.logo },
                teamB: { name: "Zwycięzca SF2", logo: placeholderTeam.logo },
                score: "– : –",
            },
        ];
    };

    // Obliczanie wszystkich meczów za pomocą funkcji generujących
    const allGeneratedMatches = [
        ...generateGroupMatches(),
        ...generateQuarterfinals(),
        ...generateSemifinals(),
        ...generateFinal(),
    ];

    // Mapa dla ułatwienia filtrowania na frontendzie.
    // Klucze to nazwy, które będą wyświetlane w selektorze,
    // wartości to nazwy rund z generowanego harmonogramu, które będziemy filtrować.
    const phaseRoundMapping = {
        "Faza grupowa": "Faza grupowa", // Specjalna obsługa dla fazy grupowej, bo ma podgrupy (A,B,C,D)
        "Ćwierćfinały": "Ćwierćfinały",
        "Półfinały": "Półfinały",
        "Finał": "Finał",
    };

    // Filtrowanie meczów do wyświetlenia
    const displayedMatches = allGeneratedMatches.filter(match => {
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
                    {/* Generuj opcje na podstawie kluczy z phaseRoundMapping */}
                    {Object.keys(phaseRoundMapping).map((phase) => (
                        <option key={phase} value={phase}>
                            {phase}
                        </option>
                    ))}
                </select>
            </div>

            <div className="match-list">
                {displayedMatches.length === 0 ? (
                    <p className="no-matches-message">Brak meczów do wyświetlenia dla tej fazy.</p>
                ) : (
                    displayedMatches.map((match, i) => {
                        const finished = isFinished(match.score);
                        let teamAClass = "team";
                        let teamBClass = "team";

                        if (finished) {
                            const [scoreA, scoreB] = match.score.split(":").map((s) => parseInt(s.trim()));
                            if (scoreA > scoreB) teamAClass += " winner";
                            else if (scoreB > scoreA) teamBClass += " winner";
                        }

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
                                <div className="match-date">
                                    {match.matchDate
                                        ? new Date(match.matchDate).toLocaleDateString("pl-PL", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "Brak daty"}
                                </div>
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