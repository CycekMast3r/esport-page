import { Link } from "react-router-dom";
import "../styles/Header.css";
import Button from "./Button";



function Header() {
    return (
        <header className="header">
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
                            <Link to="/harmonogram">Harmonogram</Link>
                            <Link to="/drabinka">Drabinka</Link>
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
