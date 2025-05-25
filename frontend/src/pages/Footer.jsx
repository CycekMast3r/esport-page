import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section left">
                    <img src="/images/logo.png" alt="Logo" className="footer-logo" />
                    <p>
                        Turniej e-sportowy CS:GO online z pulą nagród 5 000 zł. Dołącz i pokaż, co potrafisz!
                    </p>
                </div>

                <div className="footer-section center">
                    <h4>Linki</h4>
                    <ul>
                        <li><Link to="/">Strona Główna</Link></li>
                        <li><Link to="/harmonogram">Harmonogram</Link></li>
                        <li><Link to="/rejestracja">Rejestracja</Link></li>
                        <li><Link to="/stream">Transmisja</Link></li>
                    </ul>
                </div>

                <div className="footer-section right">
                    <h4>Social Media</h4>
                    <ul className="social-icons">
                        <li>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                                <img src="/images/instagram.svg" alt="Instagram" />
                            </a>
                        </li>
                        <li>
                            <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord">
                                <img src="/images/discord.svg" alt="Discord" />
                            </a>
                        </li>
                        <li>
                            <a href="https://twitch.tv" target="_blank" rel="noreferrer" aria-label="Twitch">
                                <img src="/images/twitch.svg" alt="Twitch" />
                            </a>
                        </li>
                    </ul>

                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} Turniej E-Sportowy. Wszelkie prawa zastrzeżone.
            </div>
        </footer>
    );
}

export default Footer;
