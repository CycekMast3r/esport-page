import React, { useState, useEffect } from 'react';
import CustomVideoPlayer from '../components/CustomVideoPlayer'; // Importujemy CustomVideoPlayer
import MatchCard from '../components/MatchCard'; // Będziemy potrzebować MatchCard z sekcji Schedule
import '../styles/Stream.css'; // Ten plik CSS będziemy modyfikować
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

function Stream() {
    const defaultTwitchChannel = "rocketleague"; // Domyślny kanał Twitcha
    const [currentTwitchChannel, setCurrentTwitchChannel] = useState(defaultTwitchChannel);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Domena dla Twitcha (dla środowiska Render i lokalnego)
    const getDomainName = () => {
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "localhost";
        }
        // Dla Render.com (lub innych hostów produkcyjnych)
        // Render często udostępnia zmienne środowiskowe, możesz użyć process.env.REACT_APP_FRONTEND_URL
        // Jeśli nie, możesz spróbować window.location.hostname
        return window.location.hostname;
    };
    const domainName = getDomainName();


    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Fetch pełny harmonogram (teraz, żeby mieć wszystkie mecze do wyboru)
                const response = await fetch('/api/schedule/full');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMatches(data);
            } catch (err) {
                console.error("Błąd pobierania meczów:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    const handleMatchSelect = (channelName) => {
        setCurrentTwitchChannel(channelName);
        // Możesz dodać logikę, aby przewinąć do góry odtwarzacz lub inne efekty
    };

    if (loading) {
        return (
            <main className="stream-page">
                <div className="stream-container">
                    <p className="loading-message">Ładowanie meczów...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="stream-page">
                <div className="stream-container">
                    <p className="error-message">Wystąpił błąd: {error.message}</p>
                    <p className="error-message">Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="stream-page">
            <div className="stream-container">
                <h1 className="stream-title">Transmisja na żywo</h1>
                <p className="stream-subtitle">
                    Oglądaj zmagania na oficjalnym kanale: <strong>Łódź Rocket Masters</strong>!
                </p>
                <div className="stream-layout">
                    {/* Główny obszar wideo */}
                    <div className="stream-main-video">
                        <CustomVideoPlayer
                            twitchChannelName={currentTwitchChannel}
                            domainName={domainName}
                            title={`Mecz: ${currentTwitchChannel}`} // Dynamiczny tytuł
                        />
                        {/* Możesz dodać tutaj opis wybranego meczu, jeśli chcesz */}
                        <div className="match-description-live">
                            {/* Przykład wyświetlania informacji o bieżącym meczu */}
                            {matches.length > 0 && matches.find(m => m.id === currentTwitchChannel) ? (
                                <>
                                    <h3>{matches.find(m => m.id === currentTwitchChannel).teamA.name} vs {matches.find(m => m.id === currentTwitchChannel).teamB.name}</h3>
                                    <p>Runda: {matches.find(m => m.id === currentTwitchChannel).round}</p>
                                    <p>Data: {format(new Date(matches.find(m => m.id === currentTwitchChannel).matchDate), 'PPPPp', { locale: pl })}</p>
                                    <p>Wynik: {matches.find(m => m.id === currentTwitchChannel).score}</p>
                                </>
                            ) : (
                                <h3>Aktualnie transmitowany kanał: {currentTwitchChannel}</h3>
                            )}
                        </div>
                    </div>

                    {/* Pasek boczny z listą meczów */}
                    <div className="stream-sidebar">
                        <h2>Wybierz mecz:</h2>
                        <div className="match-list">
                            {matches.length > 0 ? (
                                matches.map((match) => (
                                    <div
                                        key={match.id}
                                        className={`sidebar-match-item ${currentTwitchChannel === match.id ? 'active' : ''}`}
                                        onClick={() => handleMatchSelect(match.id)} // Użyj id meczu jako "kanału"
                                    >
                                        <MatchCard
                                            match={match}
                                            showDetails={true} // Pokaż więcej detali w bocznym pasku
                                        />
                                    </div>
                                ))
                            ) : (
                                <p>Brak nadchodzących meczów do wyświetlenia.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Stream;