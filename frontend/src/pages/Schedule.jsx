import { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule() {
    const [allMatches, setAllMatches] = useState([]); // Przechowuje wszystkie pobrane mecze
    const [displayedMatches, setDisplayedMatches] = useState([]); // Meze do wyświetlenia po filtrowaniu
    const [selectedPhase, setSelectedPhase] = useState("Faza grupowa"); // Domyślnie Faza grupowa
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Mapa dla ułatwienia filtrowania na frontendzie.
    // Klucze to nazwy, które będą wyświetlane w selektorze,
    // wartości to nazwy rund z backendu, które będziemy filtrować.
    const phaseRoundMapping = {
        "Faza grupowa": "Faza grupowa", // Specjalna obsługa dla fazy grupowej, bo ma podgrupy (A,B,C,D)
        "Ćwierćfinały": "Ćwierćfinały",
        "Półfinały": "Półfinały",
        "Finał": "Finał",
    };

    // Efekt do pobrania WSZYSTKICH meczów z backendu tylko raz
    useEffect(() => {
        const fetchAllMatches = async () => {
            setLoading(true);
            setError(null);
            try {
                // Pobierz wszystkie mecze z jednego endpointu
                const response = await fetch(`${API_BASE_URL}/api/schedule/full`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Błąd HTTP ${response.status}: ${errorText}`);
                    throw new Error(`Błąd HTTP! status: ${response.status}, wiadomość: ${errorText}`);
                }
                const data = await response.json();
                setAllMatches(data); // Zapisz wszystkie mecze w stanie
            } catch (err) {
                console.error("Nie udało się pobrać pełnego harmonogramu:", err);
                setError("Nie udało się załadować harmonogramu. Spróbuj odświeżyć stronę.");
                setAllMatches([]); // Wyczyść mecze w przypadku błędu
            } finally {
                setLoading(false);
            }
        };

        fetchAllMatches();
    }, [API_BASE_URL]); // Odpala się tylko raz przy montowaniu komponentu

    // Efekt do filtrowania meczów, gdy zmienia się wybrana faza LUB lista wszystkich meczów
    useEffect(() => {
        if (allMatches.length > 0) {
            const filtered = allMatches.filter(match => {
                // Specjalna logika dla fazy grupowej, ponieważ jej "round" może być "Faza grupowa A", "Faza grupowa B" itd.
                if (selectedPhase === "Faza grupowa") {
                    return match.round && match.round.startsWith("Faza grupowa");
                }
                // Dla pozostałych faz szukamy dokładnego dopasowania nazwy rundy
                return match.round === phaseRoundMapping[selectedPhase];
            });
            setDisplayedMatches(filtered);
        } else {
            setDisplayedMatches([]); // Jeśli nie ma allMatches, to nie ma też displayedMatches
        }
    }, [selectedPhase, allMatches, phaseRoundMapping]); // Odpala się przy zmianie fazy lub danych meczów

    // Funkcja pomocnicza do sprawdzania, czy mecz się zakończył (po wyniku np. "2:1")
    const isFinished = (score) => score && /\d\s*:\s*\d/.test(score);

    // Loader i komunikat o błędzie
    if (loading) {
        return (
            <section className="schedule-page full-screen">
                <h2 className="schedule-title">Harmonogram rozgrywek</h2>
                <div className="loading-message">Ładowanie harmonogramu...</div>
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

                        // Upewnij się, że logo są poprawnie sformatowane (pełne URL-e z Cloudinary są OK)
                        const teamALogo = match.teamA && match.teamA.logo ? match.teamA.logo : "/images/question-mark.png";
                        const teamBLogo = match.teamB && match.teamB.logo ? match.teamB.logo : "/images/question-mark.png";
                        const teamAName = match.teamA && match.teamA.name ? match.teamA.name : "???";
                        const teamBName = match.teamB && match.teamB.name ? match.teamB.name : "???";

                        return (
                            <div
                                className={`match-card ${finished ? "finished" : "upcoming"}`}
                                key={i}
                            >
                                <div className="match-round">{match.round || "Brak rundy"}</div>
                                <div className="match-date">
                                    {/* Formatowanie daty pobranej z backendu (ISO string) */}
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