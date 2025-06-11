// src/components/BracketTeaser.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import "../styles/BracketTeaser.css";
import { Fade, Slide } from 'react-awesome-reveal';

function CountdownTimer({ targetDate }) {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                dni: Math.floor(difference / (1000 * 60 * 60 * 24)),
                godziny: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minuty: Math.floor((difference / 1000 / 60) % 60),
                sekundy: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (

        <div className="timer">
            {Object.entries(timeLeft).map(([key, value]) => (
                <div key={key} className="timer-segment">
                    <span className="timer-value">{value}</span>
                    <span className="timer-label">{key}</span>
                </div>
            ))}
        </div>
    );
}

function BracketTeaser() {
    return (
        <section className="bracket-section">
            <Fade direction="up" triggerOnce>
                <h2 className="section-title">Droga do finału</h2>
            </Fade>

            <Fade direction="up" triggerOnce delay={100}>
                <CountdownTimer targetDate="2025-06-14T12:00:00" />
            </Fade>

            <Fade direction="up" triggerOnce delay={200}>
                <p className="bracket-description">
                    Zobacz, jak zespoły będą walczyć o tytuł mistrza w systemie pucharowym. Faza grupowa, półfinały i wielki finał – wszystko tu się rozstrzygnie!
                </p>
            </Fade>

            <Fade direction="up" triggerOnce delay={300}>
                <div className="bracket-preview">
                    <img src="/images/bracket-preview.png" alt="Drabinka turniejowa" />
                </div>
            </Fade>

            <Fade direction="up" triggerOnce delay={400}>
                <div className="see-more-container">
                    <Link to="/drabinka">
                        <Button variant="neon">Zobacz pełną drabinkę</Button>
                    </Link>
                </div>
            </Fade>
        </section>
    );
}

export default BracketTeaser;