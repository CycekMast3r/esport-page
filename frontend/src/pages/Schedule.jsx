import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [teams, setTeams] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa");

    useEffect(() => {
        fetch("/api/teams")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setTeams(data); // Po prostu ustawiamy drużyny, nie uzupełniamy ich tutaj do 16
            })
            .catch((err) => console.error("Błąd ładowania danych drużyn z backendu:", err));
    }, []);

    const isFinished = (score) => /\d\s*:\s*\d/.test(score);

    const placeholderTeam = {
        name: "???",
        logo: "/images/question-mark.png"
    };

    const groupLabels = ["A", "B", "C", "D"];
    // Podziel dostępne zarejestrowane drużyny na grupy
    // Dostępne drużyny są rozdzielane równomiernie do grup, a reszta miejsc jest pusta (null)
    const groups = groupLabels.map((_, groupIdx) => {
        const group = [];
        // Rozdziel drużyny do grup, próbując rozłożyć je równomiernie
        // Dla 16 drużyn: group[0] = teams[0], teams[1], teams[2], teams[3] itd.
        // Dla mniej niż 16 drużyn: np. 5 drużyn: G_A=[t0, t1], G_B=[t2], G_C=[t3], G_D=[t4]
        // Jeśli masz np. 5 drużyn, to:
        // group A: teams[0], teams[1]
        // group B: teams[2]
        // group C: teams[3]
        // group D: teams[4]
        for (let i = 0; i < 4; i++) { // Każda grupa ma maksymalnie 4 miejsca
            const teamIndex = groupIdx * 4 + i;
            if (teamIndex < teams.length) {
                group.push(teams[teamIndex]);
            } else {
                group.push(null); // Brak drużyny w tym miejscu
            }
        }
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

                    // Generuj mecz tylko jeśli obie drużyny istnieją (nie są null)
                    // lub jeśli chcemy pokazać "??? vs ???", to zawsze generujemy
                    // Obecna logika: generujemy, nawet jeśli to "??? vs ???", ale teamA i teamB są brane jako placeholder
                    matches.push({
                        round: `Grupa ${label}`,
                        date: "",
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

        // Flatten the group matches and assign dates
        const flatGroupMatches = groupMatchMap.flat();
        // Sortowanie po to, aby mecze były równomiernie rozłożone, np. Mecz A1, B1, C1, D1, A2, B2, C2, D2
        // To jest tylko dla lepszej prezentacji, faktyczna kolejność nie ma znaczenia dla logiki turnieju
        flatGroupMatches.sort((a, b) => {
            const groupAIndex = groupLabels.indexOf(a.round.split(' ')[1]);
            const groupBIndex = groupLabels.indexOf(b.round.split(' ')[1]);
            return groupAIndex - groupBIndex;
        });


        // Logika rozłożenia meczów grupowych w czasie
        while (flatGroupMatches.length > 0) {
            const match = flatGroupMatches.shift(); // Pobierz pierwszy mecz z listy
            const hourOffset = matchHourOffsets[matchIndex % 8];
            const matchDate = new Date(startDate);
            matchDate.setDate(startDate.getDate() + matchDay);
            matchDate.setMinutes(matchDate.getMinutes() + hourOffset * 60);

            match.date = `${matchDate.toLocaleDateString("pl-PL")} ${matchDate.getHours().toString().padStart(2, '0')}:${matchDate.getMinutes().toString().padStart(2, '0')}`;
            allGroupMatches.push(match);

            matchIndex++;

            if (matchIndex % 8 === 0) { // Przejdź do następnego dnia, jeśli zapełniono 8 slotów
                matchDay++;
            }
        }
        return allGroupMatches;
    };

    const generateQuarterfinals = () => {
        // Logika przydzielania drużyn do ćwierćfinałów
        // Zakładamy, że groups[0][0] to A1, groups[1][1] to B2 itp.
        // Jeśli drużyna nie istnieje (jest null), użyjemy placeholdera.

        const A1 = groups[0][0];
        const B2 = groups[1][1];
        const C2 = groups[2][1];
        const D1 = groups[3][0];
        const B1 = groups[1][0];
        const A2 = groups[0][1];
        const C1 = groups[2][0];
        const D2 = groups[3][1];

        const matchups = [
            // QF1
            { teamA: getTeamDisplayInfo(A1), teamB: getTeamDisplayInfo(B2) },
            // QF2
            { teamA: getTeamDisplayInfo(C2), teamB: getTeamDisplayInfo(D1) },
            // QF3
            { teamA: getTeamDisplayInfo(B1), teamB: getTeamDisplayInfo(A2) },
            // QF4
            { teamA: getTeamDisplayInfo(C1), teamB: getTeamDisplayInfo(D2) },
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
                    <p className="no-matches-message">Brak meczów w tej fazie.</p>
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