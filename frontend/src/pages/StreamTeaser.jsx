import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import "../styles/StreamTeaser.css";

function StreamTeaser() {
    const videoRef = useRef(null);
    const videoWrapperRef = useRef(null);
    const volumeButtonRef = useRef(null); // NOWY REF dla przycisku głośności
    const volumeSliderRef = useRef(null); // NOWY REF dla suwaka głośności

    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [previousVolume, setPreviousVolume] = useState(0.5);
    const [showTitle, setShowTitle] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const updateVolume = useCallback((newVolumeValue) => {
        const video = videoRef.current;
        if (video) {
            let finalVolume = Math.max(0, Math.min(1, newVolumeValue));
            video.volume = finalVolume;
            setVolume(finalVolume);
            setIsMuted(finalVolume === 0);
            if (finalVolume > 0) {
                setPreviousVolume(finalVolume);
            }
        }
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            if (video.muted) {
                updateVolume(0);
                setPreviousVolume(0.5);
            } else {
                updateVolume(video.volume);
            }
        }
    }, [updateVolume]);

    const toggleMute = () => {
        const video = videoRef.current;
        if (video) {
            if (video.muted) {
                video.muted = false;
                setIsMuted(false);
                updateVolume(previousVolume > 0 ? previousVolume : 0.5);
            } else {
                setPreviousVolume(video.volume > 0 ? video.volume : 0.5);
                video.muted = true;
                setIsMuted(true);
                updateVolume(0);
            }
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        updateVolume(newVolume);
    };

    const toggleFullscreen = () => {
        const videoElement = videoRef.current;
        if (videoElement) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.mozRequestFullScreen) {
                videoElement.mozRequestFullScreen();
            } else if (videoElement.webkitRequestFullscreen) {
                videoElement.webkitRequestFullscreen();
            } else if (videoElement.msRequestFullscreen) {
                videoElement.msRequestFullscreen();
            }
        }
    };

    // Obsługa scrolla myszy na przycisku głośności lub suwaku
    // Ta funkcja jest teraz używana tylko wewnętrznie przez useEffect
    const handleVolumeScroll = useCallback((e) => {
        // Kontrolki powinny być widoczne, ale to jest już warunek najechania myszką
        // na konkretny element, więc warunek showControls jest mniej krytyczny tutaj,
        // ale można go zostawić dla pewności.
        if (!showControls) return;

        e.preventDefault(); // ZAPOBIEGAJ PRZEWIJANIU STRONY!

        const delta = e.deltaY;
        const volumeChange = 0.05;

        let newVolume = volume;
        if (delta < 0) { // Scroll w górę - zwiększ głośność
            newVolume += volumeChange;
        } else { // Scroll w dół - zmniejsz głośność
            newVolume -= volumeChange;
        }
        updateVolume(newVolume);
    }, [showControls, volume, updateVolume]);

    // Obsługa strzałek klawiatury
    const handleKeyDown = useCallback((e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            const currentVideoWrapper = videoWrapperRef.current;
            if (currentVideoWrapper && currentVideoWrapper.contains(document.activeElement)) {
                e.preventDefault(); // ZAPOBIEGAJ PRZEWIJANIU STRONY!

                const volumeChange = 0.05;
                let newVolume = videoRef.current.volume;

                if (e.key === "ArrowUp") {
                    newVolume += volumeChange;
                } else {
                    newVolume -= volumeChange;
                }
                updateVolume(newVolume);
            }
        }
    }, [updateVolume]);


    // Dodawanie i usuwanie event listenerów
    useEffect(() => {
        const videoWrapper = videoWrapperRef.current;
        const volumeButton = volumeButtonRef.current;
        const volumeSlider = volumeSliderRef.current;

        // Listener dla klawiszy (pozostaje na videoWrapper, aby działały, gdy player ma focus)
        if (videoWrapper) {
            videoWrapper.addEventListener('keydown', handleKeyDown);
        }

        // Listenery dla scrolla na konkretnych elementach
        if (volumeButton) {
            volumeButton.addEventListener('wheel', handleVolumeScroll, { passive: false });
        }
        if (volumeSlider) {
            volumeSlider.addEventListener('wheel', handleVolumeScroll, { passive: false });
        }

        return () => {
            if (videoWrapper) {
                videoWrapper.removeEventListener('keydown', handleKeyDown);
            }
            if (volumeButton) {
                volumeButton.removeEventListener('wheel', handleVolumeScroll);
            }
            if (volumeSlider) {
                volumeSlider.removeEventListener('wheel', handleVolumeScroll);
            }
        };
    }, [handleKeyDown, handleVolumeScroll]); // Zależności od obu funkcji callback

    return (
        <section className="stream-section-with-bg">
            <div className="stream-overlay" />
            <div className="stream-content">
                <h2 className="section-title">Oglądaj z nami</h2>

                <div
                    className="stream-media"
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                >
                    <div
                        ref={videoWrapperRef}
                        className="video-wrapper"
                        tabIndex="0"
                    >
                        <video
                            ref={videoRef}
                            id="streamVideo"
                            className="promo-video"
                            autoPlay
                            loop
                            playsInline
                        >
                            <source src="/videos/teaser.mp4" type="video/mp4" />
                            Twoja przeglądarka nie obsługuje odtwarzacza wideo.
                        </video>

                        <div className={`video-title ${showControls ? "visible" : ""}`}>
                            Łódź Rocket Masters – Transmisja
                        </div>

                        {/* KONTROLKI */}
                        <div className={`video-controls ${showControls ? "visible" : ""}`}>
                            {/* Przycisk wyciszenia/głośności */}
                            <button
                                ref={volumeButtonRef}
                                onClick={toggleMute}
                                className="control-button volume-button"
                            // onWheel={handleVolumeScroll} - USUNIĘTO OTWARTY onWheel
                            >
                                {isMuted || volume === 0 ? (
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .9-.23 1.74-.63 2.5l1.43 1.43c.96-1.58 1.5-3.5 1.5-5.43 0-4.01-2.92-7.3-6.75-7.99v2.02c2.48.63 4.3 2.87 4.3 5.97zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V4L7 9H3zm10.73 7.73L12 8.73v3.74l2.73 2.73z" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 .9-.23 1.74-.63 2.5l1.43 1.43c.96-1.58 1.5-3.5 1.5-5.43 0-4.01-2.92-7.3-6.75-7.99v2.02c2.48.63 4.3 2.87 4.3 5.97z" /></svg>
                                )}
                            </button>

                            {/* Suwak głośności */}
                            <input
                                ref={volumeSliderRef}
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                                style={{ backgroundSize: `${volume * 100}% 100%` }}
                            // onWheel={handleVolumeScroll} - USUNIĘTO OTWARTY onWheel
                            />

                            {/* Przycisk fullscreen */}
                            <button onClick={toggleFullscreen} className="control-button fullscreen-button">
                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="stream-description">
                    Emocje, rywalizacja i niesamowite akcje! Oglądaj najważniejsze momenty turnieju Łódź Rocket Masters 2025 i dołącz do naszej społeczności.
                </p>

                <div className="stream-buttons">
                    <a href="https://twitch.tv/twojkanal" target="_blank" rel="noopener noreferrer">
                        <Button variant="neon">Otwórz Twitch</Button>
                    </a>
                    <a href="https://discord.gg/twojserwer" target="_blank" rel="noopener noreferrer">
                        <Button variant="neon">Dołącz do Discorda</Button>
                    </a>
                    <Link to="/transmisje">
                        <Button variant="neon">Zobacz wszystkie transmisje</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default StreamTeaser;