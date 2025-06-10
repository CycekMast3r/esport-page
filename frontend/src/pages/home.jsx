import { Link } from "react-router-dom";
import Button from "./Button";
import "../styles/Home.css";
import { loadFull } from "tsparticles";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import TeamsTeaser from "./TeamTeaser";
import BracketTeaser from "./BracketTeaser";
import ScheduleTeaser from "./ScheduleTeaser";
import StreamTeaser from "./StreamTeaser";
import ContactTeaser from "./ContactTeaser";
import SponsorsTeaser from "./SponsorsTeaser";
import { Parallax } from 'react-parallax';
import bgImage from '/images/parallax.jpg';
// Importujemy komponenty animacji
import { Fade, Slide } from 'react-awesome-reveal';


function Home() {
    const particlesInit = useCallback(async engine => {
        await loadFull(engine);
    }, []);

    return (
        <main>
            {/* Sekcja 1 - Hero Section */}
            <section className="home-hero">
                <div className="home-hero-overlay">
                    <div className="home-hero-content">
                        {/* Animacja dla głównego tytułu */}
                        <Fade direction="down" triggerOnce delay={200}>
                            <h1>Największy turniej Rocket League w Polsce!</h1>
                        </Fade>

                        {/* Animacja dla podtytułu hero */}
                        <Fade direction="down" triggerOnce delay={400}>
                            <p className="hero-subtitle">
                                Dołącz do <strong>Łódź Rocket Masters 2025</strong> i zawalcz o tytuł mistrza!<br />
                                <strong>20 000 zł</strong> w puli nagród czeka na najlepszych graczy!
                            </p>
                        </Fade>

                        {/* Animacja dla informacji o dacie i miejscu */}
                        <Fade direction="up" triggerOnce delay={600}>
                            <div className="hero-info">
                                <p><strong>14–21 czerwca 2025</strong> </p>
                                <p><strong>Atlas Arena, Łódź</strong></p>
                            </div>
                        </Fade>

                        {/* Jeśli będziesz miał przycisk "Zapisz się" w hero, dodaj mu animację */}
                        {/* <Fade direction="up" triggerOnce delay={800}>
                            <Link to="/rejestracja">
                                <Button variant="neon">Zapisz się</Button>
                            </Link>
                        </Fade> */}
                    </div>
                </div>
            </section>

            {/* 🔹 Sekcja 2 – Opis turnieju z drobinkami */}
            <section className="tournament-overview-vertical">
                <Particles
                    id="tournament-particles"
                    init={particlesInit}
                    className="particles"
                    options={{
                        fullScreen: false,
                        background: { color: { value: "transparent" } },
                        particles: {
                            number: { value: 40 },
                            size: { value: 3 },
                            color: { value: "#00ffff" },
                            move: {
                                enable: true,
                                speed: 1,
                                direction: "none",
                                outModes: { default: "bounce" }
                            },
                            links: {
                                enable: true,
                                distance: 120,
                                color: "#00ffff88",
                                opacity: 0.5
                            }
                        },
                        interactivity: {
                            events: {
                                onHover: { enable: true, mode: "repulse" }
                            }
                        }
                    }}
                />
                <div className="overview-image">
                    {/* Animacja dla obrazka */}
                    <Slide direction="left" triggerOnce delay={200}>
                        <img src="/images/rocketleague-banner.jpg" alt="Rocket League Tournament" />
                    </Slide>
                </div>
                <div className="overview-description">
                    {/* Animacja dla tytułu opisu */}
                    <Fade direction="down" triggerOnce delay={400}>
                        <h2>Łódź Rocket Masters 2025</h2>
                    </Fade>
                    {/* Animacja dla paragrafów opisu */}
                    <Fade direction="up" triggerOnce delay={500}>
                        <p>
                            Przygotujcie się na epickie starcia i niezapomniane akcje! W dniach <strong>14-21 czerwca, Atlas Arena w Łodzi</strong> stanie się sercem polskiego Rocket League, goszcząc turniej Łódź Rocket Masters.
                            <br /><br />
                            Czeka na Was nie tylko intensywna rywalizacja w grze, którą kochacie, ale i szansa na zgarnięcie części z puli nagród o wartości <strong>20 000 złotych!</strong> To Wasza okazja, by pokazać swoje umiejętności w powietrzu i na ziemi, zagrać pod presją i udowodnić, że to właśnie Wasza drużyna zasługuje na tytuł mistrza Łodzi.
                            <br /><br />
                            Pamiętajcie, że turniej jest ograniczony do <strong>16 drużyn</strong>, a każdy z uczestników musi mieć ukończone <strong>16 lat</strong>. Nieważne, czy jesteś weteranem z tysiącami godzin na koncie, czy chcesz wspiąć się na wyższy poziom – Łódź Rocket Masters to idealna platforma do zaprezentowania swojego talentu. Przygotujcie swoje samochody i pokażcie, kto naprawdę rządzi w samochodowej piłce nożnej!
                        </p>
                    </Fade>
                    {/* Animacja dla podtytułu i przycisku */}
                    <Fade direction="up" triggerOnce delay={700}>
                        {/* <h3>Dołącz do nas!</h3> */}
                        <Link to="/rejestracja">
                            <Button variant="neon">Zgłoś drużynę</Button>
                        </Link>
                    </Fade>
                </div>
            </section>

            <Parallax bgImage={bgImage} strength={300}>
                <div className="teams-parallax-wrapper">
                    <div className="teams-parallax-overlay" />
                    <div className="teams-parallax-content">
                        <TeamsTeaser />
                    </div>
                </div>
            </Parallax>
            <BracketTeaser />
            <ScheduleTeaser />
            <StreamTeaser />
            <SponsorsTeaser />
            <ContactTeaser />
        </main>
    );
}

export default Home;
