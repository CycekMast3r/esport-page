import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function ParticlesBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: { enable: false },
                background: { color: "transparent" },
                fpsLimit: 60,
                detectRetina: true,
                particles: {
                    number: {
                        value: 40,
                        density: {
                            enable: true,
                            area: 800,
                        },
                    },
                    color: {
                        value: "#00ffff",
                    },
                    shape: {
                        type: "line",
                    },
                    opacity: {
                        value: 0.3,
                        random: true,
                    },
                    size: {
                        value: {
                            min: 100,
                            max: 300,
                        },
                        random: true,
                    },
                    move: {
                        enable: true,
                        speed: 1.5,
                        direction: "right",
                        straight: true,
                        outModes: {
                            default: "out",
                        },
                    },
                },
            }}
        />
    );
}

export default ParticlesBackground;
