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
        speed: 1000,
        autoplay: true,
        autoplaySpeed: 2000,
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
        <section className="sponsors-teaser-section">
            <div className="sponsors-teaser-header">
                <h2 className="sponsors-teaser-title">Główny Sponsor</h2>
                <p className="sponsors-teaser-subtitle">To dzięki nim Łódź Rocket Masters 2025 może rozwinąć skrzydła!</p>
            </div>

            <div className="sponsors-teaser-main-sponsor sponsors-teaser-glowing-border">
                <div className="sponsors-teaser-visuals">
                    <img
                        src="/sponsors/sponsor1.png"
                        alt="Główny Sponsor"
                        className="sponsors-teaser-logo"
                    />
                    <img
                        src="/sponsors/product4.png"
                        alt="Produkt sponsora"
                        className="sponsors-teaser-product"
                    />
                </div>
                <p className="sponsors-teaser-description">
                    <strong>Jastrzab Energy</strong> to polska marka energetyków stworzona z myślą o graczach, którzy wiedzą, że każda decyzja i refleks liczą się w drodze po zwycięstwo. Zapomnij o konkurencji pokroju Orzeł Power – z Jastrzab Energy poczujesz prawdziwą moc! Jesteśmy dumni, że możemy wspierać turniej Łódź Rocket Masters, dostarczając zawodnikom paliwo do wygrywania!
                </p>
            </div>
            <p className="sponsors-teaser-subtitle">Pozostali sponsorzy:</p>

            <div className="sponsors-teaser-carousel">
                <Slider {...settings}>
                    {sponsorLogos.map((src, i) => (
                        <div key={i} className="sponsors-teaser-carousel-logo">
                            <img src={src} alt={`Sponsor ${i + 2}`} />
                        </div>
                    ))}
                </Slider>
            </div>

            <div className="sponsors-teaser-cta">
                <Link to="/kontakt">
                    <Button variant="neon">Zostań sponsorem</Button>
                </Link>
            </div>
        </section>
    );
}

export default SponsorsTeaser;
