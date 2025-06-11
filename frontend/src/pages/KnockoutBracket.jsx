// src/components/KnockoutBracket.jsx
import React from "react";
import { Bracket, RoundProps } from "react-brackets";

const rounds = [
    {
        title: "Półfinały",
        seeds: [
            {
                id: 1,
                date: "21.06.2025",
                teams: [
                    { name: "Cyber Wolves" },
                    { name: "Turbo Titans" }
                ]
            },
            {
                id: 2,
                date: "21.06.2025",
                teams: [
                    { name: "Dark Phoenix" },
                    { name: "Neon Strikers" }
                ]
            }
        ]
    },
    {
        title: "Finał",
        seeds: [
            {
                id: 3,
                date: "22.06.2025",
                teams: [
                    { name: "Cyber Wolves" },
                    { name: "Dark Phoenix" }
                ]
            }
        ]
    }
];

function KnockoutBracket() {
    return (
        <div style={{ overflowX: "auto", padding: "2rem" }}>
            <Bracket rounds={rounds} />
        </div>
    );
}

export default KnockoutBracket;
