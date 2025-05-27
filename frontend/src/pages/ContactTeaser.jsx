import { useState } from "react";
import "../styles/ContactTeaser.css";
import ParticlesBackground from "./ParticlesBackground";

function FAQItem({ question, answer }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
            <div className="faq-question">
                {question}
                <span>{open ? "−" : "+"}</span>
            </div>
            {open && <div className="faq-answer">{answer}</div>}
        </div>
    );
}

function ContactTeaser() {
    return (

        <section className="contact-section">
            <ParticlesBackground />
            <h2 className="section-title">Skontaktuj się z nami</h2>

            <div className="contact-content">
                <div className="contact-info">
                    <div className="contact-box">
                        <span className="contact-icon">📧</span>
                        <div>
                            <strong>Email:</strong><br />
                            <a href="mailto:kontakt@rocketmasters.pl">kontakt@rocketmasters.pl</a>
                        </div>
                    </div>
                    <div className="contact-box">
                        <span className="contact-icon">💬</span>
                        <div>
                            <strong>Discord:</strong><br />
                            <a href="https://discord.gg/twojserwer" target="_blank">Dołącz do naszego serwera</a>
                        </div>
                    </div>
                    <img src="/images/logo.png" alt="Logo turnieju" className="contact-logo" />
                </div>

                <div className="faq-section">
                    <h3>Najczęściej zadawane pytania</h3>

                    <FAQItem
                        question="Jak mogę zarejestrować drużynę?"
                        answer="Kliknij w przycisk 'Zapisz się' na stronie głównej i wypełnij formularz rejestracyjny."
                    />
                    <FAQItem
                        question="Czy udział jest płatny?"
                        answer="Nie. Turniej Rocket Masters 2025 jest całkowicie darmowy dla uczestników."
                    />
                    <FAQItem
                        question="Jak wygląda system rozgrywek?"
                        answer="Rozgrywki zaczynają się fazą grupową, a następnie przechodzą w fazę pucharową. Szczegóły znajdziesz w zakładce Drabinka."
                    />
                    <FAQItem
                        question="Gdzie będą transmisje z meczów?"
                        answer="Na naszym oficjalnym kanale Twitch oraz w zakładce Transmisje na stronie."
                    />
                </div>
            </div>
        </section>
    );
}

export default ContactTeaser;
