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

            {/* Nowa, ulepszona wersja */}
            <section className="sponsor-benefits">
                <h2 className="section-title">Dlaczego warto nas wspierać?</h2>
                <div className="benefits-grid">
                    {/* Karta 1 - Zasięg */}
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </div>
                        <h4 className="benefit-title">10 000+ Widzów</h4>
                        <p className="benefit-description">Gwarantowany zasięg transmisji docierający do szerokiej publiczności e-sportowej.</p>
                    </div>

                    {/* Karta 2 - Drużyny */}
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"></path><path d="M4 12h16"></path><path d="M15 12a3 3 0 0 1-6 0"></path><path d="M10 12a3 3 0 0 1-6 0"></path><rect width="20" height="12" x="2" y="6" rx="2"></rect></svg>
                        </div>
                        <h4 className="benefit-title">16 Drużyn z Całej Polski</h4>
                        <p className="benefit-description">Rywalizacja najlepszych zespołów, przyciągająca uwagę fanów z całego kraju.</p>
                    </div>

                    {/* Karta 3 - Social Media */}
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                        </div>
                        <h4 className="benefit-title">Obecność w Social Media</h4>
                        <p className="benefit-description">Intensywna promocja na platformach takich jak Facebook, Instagram i X (Twitter).</p>
                    </div>

                    {/* Karta 4 - Prestiż */}
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h4 className="benefit-title">Profesjonalna Oprawa</h4>
                        <p className="benefit-description">Prestiżowe wydarzenie z wysokiej jakości produkcją i oprawą medialną.</p>
                    </div>
                </div>
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