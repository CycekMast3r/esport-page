const placeholderTeam = {
    name: "???",
    logo: "/images/question-mark.png",
};

const groupLabels = ["A", "B", "C", "D"];
const matchHourOffsets = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];

export function generateGroupMatches(teams) {
    const groups = groupLabels.map((_, idx) => {
        const group = teams.slice(idx * 4, (idx + 1) * 4);
        while (group.length < 4) group.push(null);
        return group;
    });

    const matchPairs = [
        [[0, 1], [2, 3]],
        [[0, 2], [1, 3]],
        [[0, 3], [1, 2]],
    ];

    const groupMatchMap = groups.map((group, groupIdx) => {
        const label = groupLabels[groupIdx];
        const matches = [];

        matchPairs.forEach(pairSet => {
            pairSet.forEach(([i, j]) => {
                const teamA = group[i];
                const teamB = group[j];

                matches.push({
                    round: `Grupa ${label}`,
                    date: "", // ustalimy później
                    teamA: teamA
                        ? { name: teamA.name, logo: `/uploads/${teamA.logo}` }
                        : placeholderTeam,
                    teamB: teamB
                        ? { name: teamB.name, logo: `/uploads/${teamB.logo}` }
                        : placeholderTeam,
                    score: "– : –",
                });
            });
        });

        return matches;
    });

    const allMatches = [];
    const startDate = new Date("2025-06-14T18:00:00");
    let matchDay = 0;
    let matchIndex = 0;

    while (groupMatchMap.some(group => group.length > 0)) {
        for (let g = 0; g < groupMatchMap.length; g++) {
            const groupMatches = groupMatchMap[g];
            let added = 0;

            for (let i = 0; i < groupMatches.length; i++) {
                const match = groupMatches[i];

                const hourOffset = matchHourOffsets[matchIndex % 8];
                const matchDate = new Date(startDate);
                matchDate.setDate(startDate.getDate() + matchDay);
                matchDate.setMinutes(matchDate.getMinutes() + hourOffset * 60);

                match.date = `${matchDate.toLocaleDateString("pl-PL")} ${matchDate.getHours().toString().padStart(2, '0')}:${matchDate.getMinutes().toString().padStart(2, '0')}`;
                match.matchDate = matchDate;

                allMatches.push(match);
                groupMatches.splice(i, 1);
                added++;
                matchIndex++;

                if (added === 2) break;
                i--;
            }
        }

        if (matchIndex % 8 === 0) {
            matchDay++;
        }
    }

    return allMatches;
}

export function getUpcomingMatches(matches, limit = 3) {
    return matches
        .filter((m) => m.score === "– : –")
        .sort((a, b) => a.matchDate - b.matchDate)
        .slice(0, limit);
}
