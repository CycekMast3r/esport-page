import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./pages/Header";
import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Schedule from "./pages/Schedule";
import Teams from "./pages/Teams";
import Bracket from "./pages/Bracket";
import Stream from "./pages/Stream";
import Sponsors from "./pages/Sponsors";
import Contact from "./pages/Contact";
import Footer from "./pages/Footer";
import { useEffect } from "react";
import Results from "./pages/Results";

function AppWrapper() {
    const location = useLocation();
    const isHome = location.pathname === "/";

    // Opcjonalnie: usuwanie paddingu tylko na stronie głównej
    useEffect(() => {
        document.body.style.margin = "0";
    }, []);

    return (
        <div className={isHome ? "layout home-background" : "layout default-background"}>
            <Header isHome={isHome} />
            <main className={isHome ? "home-main" : "default-main"}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/rejestracja" element={<Registration />} />
                    <Route path="/harmonogram" element={<Results />} />
                    <Route path="/druzyny" element={<Teams />} />
                    <Route path="/wyniki" element={<Results />} />
                    <Route path="/stream" element={<Stream />} />
                    <Route path="/sponsorzy" element={<Sponsors />} />
                    <Route path="/kontakt" element={<Contact />} />
                </Routes>
            </main>
            <Footer isHome={isHome} />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppWrapper />
        </BrowserRouter>
    );
}

export default App;
