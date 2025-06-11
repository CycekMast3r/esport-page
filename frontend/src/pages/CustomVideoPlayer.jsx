import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/CustomVideoPlayer.css"; // Nowy plik CSS dla odtwarzacza

function CustomVideoPlayer({ videoSrc, twitchChannelName, domainName, title }) {
    const videoRef = useRef(null);
    const videoWrapperRef = useRef(null);
    const volumeButtonRef = useRef(null);
    const volumeSliderRef = useRef(null);

    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [previousVolume, setPreviousVolume] = useState(0.5);
    const [showControls, setShowControls] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTwitchPlayer, setIsTwitchPlayer] = useState(false);

    const updateVolume = useCallback((newVolumeValue) => {
        if (!isTwitchPlayer) {
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
        }
    }, [isTwitchPlayer]);

    useEffect(() => {
        if (twitchChannelName) {
            setIsTwitchPlayer(true);
            setIsPlaying(true);
        } else if (videoSrc) {
            setIsTwitchPlayer(false);
            const video = videoRef.current;
            if (video) {
                video.onloadedmetadata = () => {
                    setIsPlaying(!video.paused);
                    if (video.muted) {
                        updateVolume(0);
                        setPreviousVolume(0.5);
                    } else {
                        updateVolume(video.volume);
                    }
                };
                if (video.readyState >= 3) {
                    setIsPlaying(!video.paused);
                    if (video.muted) {
                        updateVolume(0);
                        setPreviousVolume(0.5);
                    } else {
                        updateVolume(video.volume);
                    }
                }
                video.onplay = () => setIsPlaying(true);
                video.onpause = () => setIsPlaying(false);
                video.onvolumechange = () => {
                    setVolume(video.volume);
                    setIsMuted(video.muted || video.volume === 0);
                };
            }
        }
    }, [videoSrc, twitchChannelName, updateVolume]);

    const togglePlayPause = () => {
        if (!isTwitchPlayer) {
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
        }
    };

    const toggleMute = () => {
        if (!isTwitchPlayer) {
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
        }
    };

    const handleVolumeChange = (e) => {
        if (!isTwitchPlayer) {
            const newVolume = parseFloat(e.target.value);
            updateVolume(newVolume);
        }
    };

    const toggleFullscreen = () => {
        const targetElement = isTwitchPlayer ? videoWrapperRef.current : videoRef.current;
        if (targetElement) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (targetElement.requestFullscreen) {
                targetElement.requestFullscreen();
            } else if (targetElement.webkitRequestFullscreen) {
                targetElement.webkitRequestFullscreen();
            }
        }
    };

    const handleVolumeScroll = useCallback((e) => {
        if (!showControls || isTwitchPlayer) return;
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
    }, [showControls, volume, updateVolume, isTwitchPlayer]);

    const handleKeyDown = useCallback((e) => {
        const currentVideoWrapper = videoWrapperRef.current;
        if (currentVideoWrapper && currentVideoWrapper.contains(document.activeElement) && !isTwitchPlayer) {
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
    }, [updateVolume, isTwitchPlayer]);

    useEffect(() => {
        const videoWrapper = videoWrapperRef.current;
        const volumeButton = volumeButtonRef.current;
        const volumeSlider = volumeSliderRef.current;

        const cleanup = () => {
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
        cleanup();

        if (videoWrapper) {
            videoWrapper.addEventListener('keydown', handleKeyDown);
        }
        if (volumeButton && !isTwitchPlayer) {
            volumeButton.addEventListener('wheel', handleVolumeScroll, { passive: false });
        }
        if (volumeSlider && !isTwitchPlayer) {
            volumeSlider.addEventListener('wheel', handleVolumeScroll, { passive: false });
        }

        return cleanup;
    }, [handleKeyDown, handleVolumeScroll, isTwitchPlayer]);

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
        <div
            className="custom-video-player"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <div
                ref={videoWrapperRef}
                className="video-wrapper"
                tabIndex="0"
            >
                {isTwitchPlayer ? (
                    <iframe
                        src={`https://player.twitch.tv/?channel=${twitchChannelName}&parent=${domainName}&autoplay=true&muted=${isMuted}`}
                        frameBorder="0"
                        allowFullScreen={true}
                        scrolling="no"
                        height="100%"
                        width="100%"
                        title="Twitch Player"
                    ></iframe>
                ) : (
                    <video
                        ref={videoRef}
                        id="streamVideo"
                        className="promo-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                    >
                        <source src={videoSrc} type="video/mp4" />
                        Twoja przeglądarka nie obsługuje odtwarzacza wideo.
                    </video>
                )}

                <div className={`video-title ${showControls ? "visible" : ""}`}>
                    {title || (twitchChannelName ? `Transmisja na żywo: ${twitchChannelName}` : "Łódź Rocket Masters – Intro")}
                </div>

                {!isTwitchPlayer && (
                    <button
                        onClick={togglePlayPause}
                        className={`control-button play-pause-standalone ${showControls ? "visible" : ""}`}
                    >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                )}

                <div className={`video-controls ${showControls ? "visible" : ""}`}>
                    {!isTwitchPlayer && (
                        <>
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
                        </>
                    )}
                    <button onClick={toggleFullscreen} className="control-button fullscreen-button">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomVideoPlayer;