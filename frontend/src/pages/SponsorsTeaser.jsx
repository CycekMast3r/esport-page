import "../styles/SponsorsTeaser.css";
import Button from "./Button";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SponsorsTeaser() {
    const sponsorLogos = [
        "/sponsors/sponsor2.png",
        "/sponsors/sponsor3.png",
        "/sponsors/sponsor4.png",
        "/sponsors/sponsor5.png",
        "/sponsors/sponsor6.png",
        "/sponsors/sponsor7.png",
    ];

    const settings = {
        infinite: true,
        speed: 1000,             // czas animacji: 2 sekundy
        autoplay: true,
        autoplaySpeed: 2000,     // 3 sekundy między przesunięciami
        cssEase: "ease-in-out",
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            {
                breakpoint: 768,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 1 }
            }
        ]
    };

    return (
    <section className="sponsors-section">
        <div className="sponsors-header">
            <h2 className="section-title">Główny Sponsor</h2>
            <p className="section-subtitle">To dzięki nim Łódź Rocket Masters 2025 może rozwinąć skrzydła!</p>
        </div>

        {/* NOWA STRUKTURA GŁÓWNEGO SPONSORA */}
        <div className="main-sponsor-card">
            {/* Kolumna z tekstem */}
            <div className="sponsor-content">
                <h3 className="sponsor-name">Jastrząb Energy</h3>
                <p className="sponsor-description">
                    To polska marka energetyków stworzona z myślą o graczach, którzy wiedzą, że każda decyzja i refleks liczą się w drodze po zwycięstwo. Zapomnij o konkurencji pokroju Orzeł Power – z <strong>Jastrząb Energy</strong> poczujesz prawdziwą moc! Jesteśmy dumni, że możemy wspierać turniej Łódź Rocket Masters, dostarczając zawodnikom paliwo do wygrywania!
                </p>
                <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">Odwiedź stronę sponsora</Button>
                </a>
            </div>

            {/* Kolumna z grafikami */}
            <div className="sponsor-visuals-new"> {/* Używamy nowej klasy, aby uniknąć konfliktu */}
                <img
                    src="/sponsors/sponsor1.png"
                    alt="Logo Jastrzab Energy"
                    className="visual-logo"
                />
                <img
                    src="/sponsors/product4.png"
                    alt="Produkt Jastrzab Energy"
                    className="visual-product"
                />
            </div>
        </div>

        <h3 className="section-subtitle partners-title">Pozostali Sponsorzy i Partnerzy</h3>
        {/* Slider z partnerami (pozostaje bez zmian) */}
        <div className="partners-carousel">
            <Slider {...settings}>
                {sponsorLogos.map((src, i) => (
                    <div key={i} className="carousel-logo">
                        <img src={src} alt={`Sponsor ${i + 2}`} />
                    </div>
                ))}
            </Slider>
        </div>

        <div className="sponsor-cta">
            <Link to="/kontakt">
                <Button variant="neon">Zostań sponsorem</Button>
            </Link>
        </div>
    </section>
);
}

export default SponsorsTeaser;
