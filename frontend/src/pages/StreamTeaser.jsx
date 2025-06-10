import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import "../styles/StreamTeaser.css";
// Importujemy komponenty animacji
import { Fade, Slide } from 'react-awesome-reveal';

function StreamTeaser() {
    const videoRef = useRef(null);
    const videoWrapperRef = useRef(null);
    const volumeButtonRef = useRef(null);
    const volumeSliderRef = useRef(null);

    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [previousVolume, setPreviousVolume] = useState(0.5);
    const [showControls, setShowControls] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true); // Domyślnie odtwarzane, bo `autoPlay`

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
            setIsPlaying(!video.paused);

            if (video.muted) {
                updateVolume(0);
                setPreviousVolume(0.5);
            } else {
                updateVolume(video.volume);
            }
        }
    }, [updateVolume]);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (video) {
            if (video.paused) {
                video.play();
                setIsPlaying(true);
            } else {
                video.pause();
                setIsPlaying(false);
            }
        }
    };


    const toggleMute = () => {
        const video = videoRef.current;
        if (video) {
            if (video.muted || video.volume === 0) {
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
            } else if (videoElement.webkitRequestFullscreen) {
                videoElement.webkitRequestFullscreen();
            }
        }
    };

    const handleVolumeScroll = useCallback((e) => {
        if (!showControls) return;
        e.preventDefault();
        const delta = e.deltaY;
        const volumeChange = 0.05;
        let newVolume = volume;
        if (delta < 0) {
            newVolume += volumeChange;
        } else {
            newVolume -= volumeChange;
        }
        updateVolume(newVolume);
    }, [showControls, volume, updateVolume]);

    const handleKeyDown = useCallback((e) => {
        const currentVideoWrapper = videoWrapperRef.current;
        if (currentVideoWrapper && currentVideoWrapper.contains(document.activeElement)) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
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

    useEffect(() => {
        const videoWrapper = videoWrapperRef.current;
        const volumeButton = volumeButtonRef.current;
        const volumeSlider = volumeSliderRef.current;
        if (videoWrapper) {
            videoWrapper.addEventListener('keydown', handleKeyDown);
        }
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
    }, [handleKeyDown, handleVolumeScroll]);

    // Definicje ikon jako małe komponenty funkcyjne
    const TwitchIcon = () => (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
    );
    const DiscordIcon = () => (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
    );
    const StreamsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
        </svg>
    );

    // Ikony Play i Pause
    const PlayIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
        </svg>
    );

    const PauseIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
    );

    return (
        <section className="stream-section-with-bg">
            <div className="stream-overlay" />
            <div className="stream-content">
                <Fade direction="down" triggerOnce>
                    <h2 className="section-title">Oglądaj z nami</h2>
                </Fade>

                <Slide direction="right" triggerOnce delay={100}>
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
                                muted
                                playsInline
                                // Upewnij się, że atrybut controls jest WYŁĄCZONY
                                controls={false} // <--- Dodaj lub upewnij się, że to jest ustawione na false
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            >
                                <source src="/videos/teaser.mp4" type="video/mp4" />
                                Twoja przeglądarka nie obsługuje odtwarzacza wideo.
                            </video>
                            <div className={`video-title ${showControls ? "visible" : ""}`}>
                                Łódź Rocket Masters – Intro
                            </div>
                            {/* Nowy kontener dla przycisku Play/Pause w lewym dolnym rogu */}
                            <button
                                onClick={togglePlayPause}
                                className={`control-button play-pause-standalone ${showControls ? "visible" : ""}`}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>

                            <div className={`video-controls ${showControls ? "visible" : ""}`}>
                                {/* Przycisk Volume */}
                                <button
                                    ref={volumeButtonRef}
                                    onClick={toggleMute}
                                    className="control-button volume-button"
                                >
                                    {isMuted || volume === 0 ? (
                                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .9-.23 1.74-.63 2.5l1.43 1.43c.96-1.58 1.5-3.5 1.5-5.43 0-4.01-2.92-7.3-6.75-7.99v2.02c2.48.63 4.3 2.87 4.3 5.97zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V4L7 9H3zm10.73 7.73L12 8.73v3.74l2.73 2.73z" /></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 .9-.23 1.74-.63 2.5l1.43 1.43c.96-1.58 1.5-3.5 1.5-5.43 0-4.01-2.92-7.3-6.75-7.99v2.02c2.48.63 4.3 2.87 4.3 5.97z" /></svg>
                                    )}
                                </button>
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
                                />
                                {/* Przycisk Fullscreen */}
                                <button onClick={toggleFullscreen} className="control-button fullscreen-button">
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </Slide>

                <Fade direction="left" triggerOnce delay={400}>
                    <p className="stream-description">
                        Emocje, rywalizacja i niesamowite akcje! Oglądaj najważniejsze momenty turnieju Łódź Rocket Masters 2025 i dołącz do naszej społeczności.
                    </p>
                </Fade>

                <Fade direction="up" cascade damping={0.15} triggerOnce delay={500}>
                    <div className="stream-buttons">
                        <a href="https://twitch.tv/twojkanal" target="_blank" rel="noopener noreferrer">
                            <Button variant="neon" icon={<TwitchIcon />}>
                                Otwórz Twitch
                            </Button>
                        </a>
                        <a href="https://discord.gg/twojserwer" target="_blank" rel="noopener noreferrer">
                            <Button variant="neon" icon={<DiscordIcon />}>
                                Dołącz do Discorda
                            </Button>
                        </a>
                        <Link to="/stream">
                            <Button variant="neon" icon={<StreamsIcon />}>
                                Zobacz transmisje
                            </Button>
                        </Link>
                    </div>
                </Fade>
            </div>
        </section>
    );
}

export default StreamTeaser;