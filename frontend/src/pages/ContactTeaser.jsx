// src/pages/ContactTeaser.jsx

import { useState } from "react";
import "../styles/ContactTeaser.css";
import ParticlesBackground from "./ParticlesBackground";

// Definicje ikon jako małe komponenty funkcyjne
const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);
const DiscordIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
);


function FAQItem({ question, answer }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
            <div className="faq-question">
                <span>{question}</span>
                <div className="faq-icon">{/* Znak '+' zostanie dodany przez CSS */}</div>
            </div>
            <div className="faq-answer-wrapper">
                <div className="faq-answer">{answer}</div>
            </div>
        </div>
    );
}

function ContactTeaser() {
    return (
        <section className="contact-section">
            <ParticlesBackground />
            <div className="contact-container">
                <h2 className="section-title">Skontaktuj się z nami</h2>

                <div className="contact-content">
                    <div className="contact-info">
                        <a href="mailto:kontakt@rocketmasters.pl" className="contact-box-link">
                            <div className="contact-box">
                                <span className="contact-icon"><EmailIcon /></span>
                                <div className="contact-text">
                                    <strong>Email</strong>
                                    <span>kontakt@rocketmasters.pl</span>
                                </div>
                            </div>
                        </a>
                        <a href="https://discord.gg/twojserwer" target="_blank" rel="noopener noreferrer" className="contact-box-link">
                            <div className="contact-box">
                                <span className="contact-icon"><DiscordIcon /></span>
                                <div className="contact-text">
                                    <strong>Discord</strong>
                                    <span>Dołącz do naszego serwera</span>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="faq-section">
                        <h3>Najczęściej zadawane pytania</h3>

                        <FAQItem
                            question="Jak mogę zarejestrować drużynę?"
                            answer="Kliknij w przycisk 'Zapisz się' w prawym górnym rogu strony i wypełnij formularz rejestracyjny, podając wszystkie wymagane dane."
                        />
                        <FAQItem
                            question="Czy udział jest płatny?"
                            answer="Nie. Turniej Łódź Rocket Masters 2025 jest całkowicie darmowy dla wszystkich uczestników. Nie ma żadnych ukrytych opłat."
                        />
                        <FAQItem
                            question="Jak wygląda system rozgrywek?"
                            answer="Rozgrywki składają się z fazy grupowej, po której najlepsze drużyny awansują do fazy pucharowej (play-off) w systemie pojedynczej eliminacji."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactTeaser;