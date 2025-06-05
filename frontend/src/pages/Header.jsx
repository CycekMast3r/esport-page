import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import "../styles/Header.css";
import Button from "./Button";

function Header({ isHome }) {
    return (
        <header className={`header ${isHome ? "transparent-header" : ""}`}>
            {isHome && <div className="header-overlay" />}
            <nav className="nav-bar">
                <div className="nav-section left">
                    <Link to="/" className="logo">
                        <img src="/images/logo.png" alt="Logo" />
                    </Link>
                </div>
                <div className="nav-section center">
                    <Link to="/">Strona Główna</Link>

                    <div className="dropdown">
                        <a className="nav-link">Turniej ▾</a>
                        <div className="dropdown-content">
                            <Link to="/druzyny">Drużyny</Link>
                            <HashLink smooth to="/wyniki#schedule">Harmonogram</HashLink>
                            <HashLink smooth to="/wyniki#bracket">Drabinka</HashLink>
                            <Link to="/sponsorzy">Sponsorzy</Link>
                        </div>
                    </div>

                    <Link to="/stream">Transmisje</Link>
                    <Link to="/kontakt">Kontakt</Link>
                </div>

                <div className="nav-section right">
                    <Link to="/rejestracja">
                        <Button variant="neon">Zapisz się</Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
}

export default Header;
