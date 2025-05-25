import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "./pages/Header";
import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Schedule from "./pages/Schedule";
import Teams from "./pages/Teams";
import Bracket from "./pages/Bracket";
import Stream from "./pages/Stream";
import Sponsors from "./pages/Sponsors";
import Footer from "./pages/Footer";

function App() {
    return (
        <BrowserRouter>
            <div>
                <Header />
                <main style={{ padding: "2rem" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/rejestracja" element={<Registration />} />
                        <Route path="/harmonogram" element={<Schedule />} />
                        <Route path="/druzyny" element={<Teams />} />
                        <Route path="/drabinka" element={<Bracket />} />
                        <Route path="/stream" element={<Stream />} />
                        <Route path="/sponsorzy" element={<Sponsors />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
