import { useState } from "react";
import Bracket from "./Bracket";
import Schedule from "./Schedule";
import "../styles/Results.css";

function Results() {
    return (
        <div className="results-page">
            <div id="bracket">
                <Bracket />
            </div>
            <div id="schedule">
                <Schedule />
            </div>
        </div>
    );
}

export default Results;
