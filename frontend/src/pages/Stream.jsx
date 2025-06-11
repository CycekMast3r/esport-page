// src/pages/Stream.jsx

import React from 'react';
import '../styles/Stream.css';

function Stream() {
    const twitchChannelName = "rocketleague";

    // ZMIANA: Dynamiczne pobieranie nazwy domeny z przeglądarki
    // To sprawi, że kod będzie działał zarówno lokalnie, jak i na serwerze
    const domainName = window.location.hostname;

    return (
        <main className="stream-page">
            <div className="stream-container">
                <h1 className="stream-title">Transmisja na żywo</h1>
                <p className="stream-subtitle">
                    Oglądaj zmagania na oficjalnym kanale: <strong>Łódź Rocket Masters</strong>!
                </p>
                <div className="stream-layout">
                    {/* Odtwarzacz wideo */}
                    <div className="stream-video">
                        <iframe
                            src={`https://player.twitch.tv/?channel=${twitchChannelName}&parent=${domainName}`}
                            frameBorder="0"
                            allowFullScreen={true}
                            scrolling="no"
                            height="100%"
                            width="100%"
                            title="Twitch Player">
                        </iframe>
                    </div>

                    {/* Czat */}
                    <div className="stream-chat">
                        <iframe
                            src={`https://www.twitch.tv/embed/${twitchChannelName}/chat?parent=${domainName}&theme=dark`}
                            frameBorder="0"
                            scrolling="no"
                            height="100%"
                            width="100%"
                            title="Twitch Chat">
                        </iframe>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Stream;