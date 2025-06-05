import "../styles/Sponsors.css";
import Button from "./Button";
import { Link } from "react-router-dom";

function Sponsors() {
    return (
        <main className="sponsors-page">
            <section className="main-sponsor-section">
                <div className="main-sponsor-header">
                    <img
                        src="/sponsors/sponsor1.png"
                        alt="NeonTech - Główny Sponsor"
                        className="main-sponsor-logo"
                    />
                    <h3 className="main-sponsor-name">NeonTech – Oficjalny Partner Technologiczny</h3>
                </div>

                <div className="main-sponsor-visuals">
                    <div className="main-sponsor-images">
                        <img
                            src="/sponsors/product.png"
                            alt="NeonTech Gear"
                            className="main-sponsor-product"
                        />
                        <img
                            src="/sponsors/product4.png"
                            alt="NeonTech Gear"
                            className="main-sponsor-product"
                        />
                    </div>

                    <div className="main-sponsor-description">
                        <p>
                            <strong>NeonTech</strong> to lider w dziedzinie technologii gamingowych i transmisji strumieniowej. Od lat wspiera profesjonalnych graczy i turnieje e-sportowe, dostarczając najwyższej jakości sprzęt i rozwiązania streamingowe.
                        </p>
                        <p>
                            W ramach turnieju <strong>Rocket Masters 2025</strong>, NeonTech odpowiada za dostarczenie nowoczesnego zaplecza technicznego, transmisji na żywo w jakości 4K oraz specjalnych nagród dla zwycięzców.
                        </p>
                        <p>
                            Wierzą, że e-sport to przyszłość rywalizacji, rozrywki i innowacji – dlatego inwestują w młode talenty i wspierają rozwój społeczności gamingowej.
                        </p>

                        <div className="sponsor-extra-info">
                            <h4>Dlaczego wspierają Rocket Masters?</h4>
                            <ul>
                                <li>Promują rozwój e-sportu w Polsce</li>
                                <li>Prezentują swoje najnowsze produkty</li>
                                <li>Wspierają młodych, utalentowanych graczy</li>
                                <li>Budują relację z technologiczną społecznością</li>
                            </ul>
                        </div>

                        <a
                            href="https://neontech.example.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="main-sponsor-link"
                        >
                            Odwiedź stronę NeonTech →
                        </a>
                    </div>
                </div>
            </section>


            <section className="key-sponsors">
                <h2 className="section-title">Partnerzy strategiczni</h2>
                <div className="sponsor-grid">
                    <div className="sponsor-card">
                        <img src="/sponsors/sponsor2.png" alt="Partner A" />
                        <p>Firma A – lider w branży sprzętu gamingowego.</p>
                    </div>
                    <div className="sponsor-card">
                        <img src="/sponsors/sponsor3.png" alt="Partner B" />
                        <p>Firma B – partner rozwiązań VR i streamingu.</p>
                    </div>
                    <div className="sponsor-card">
                        <img src="/sponsors/sponsor4.png" alt="Partner C" />
                        <p>Firma C – producent napojów dla graczy.</p>
                    </div>
                </div>
            </section>

            <section className="all-sponsors">
                <h2 className="section-title">Pozostali sponsorzy</h2>
                <div className="logo-gallery">
                    {[5, 6, 7, 8, 9, 10].map(i => (
                        <img key={i} src={`/sponsors/sponsor${i}.png`} alt={`Sponsor ${i}`} />
                    ))}
                </div>
            </section>

            <section className="sponsor-benefits">
                <h2 className="section-title">Dlaczego warto nas wspierać?</h2>
                <ul>
                    <li>🎯 Zasięg transmisji: ponad 10 000 widzów</li>
                    <li>🎮 16 drużyn z całej Polski</li>
                    <li>📱 Pełna obecność w social media i na żywo</li>
                    <li>🏆 Prestiż i profesjonalna oprawa turnieju</li>
                </ul>
            </section>

            <section className="sponsor-cta">
                <h2>Zostań sponsorem</h2>
                <p>Dołącz do grona firm wspierających polski e-sport. Twoja marka może być częścią tego wydarzenia!</p>
                <Link to="/kontakt">
                    <Button variant="neon">Skontaktuj się z nami</Button>
                </Link>
            </section>
        </main>
    );
}

export default Sponsors;
