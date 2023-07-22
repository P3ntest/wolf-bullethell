import {
  DebugRenderer,
  Engine,
  Input,
  Physics2D,
  ReactPositionalRenderer,
  ReactUIRenderer,
  Scene,
} from "@p3ntest/wolf-engine";
import { playerPrefab } from "./player";
import { worldPrefab } from "./world";
import { ZombieSystem } from "./zombie";
import { dogPrefab } from "./dog";
import "./index.css";
import { Upgrade, upgradeSystemPrefab } from "./upgrades";
import { enablePerformanceLogging } from "@p3ntest/wolf-engine/src/Performance";
import { gameUiPrefab } from "./ui";
import { createRoot } from "react-dom/client";
import { useState } from "react";

Engine.init();

let scene: Scene | null;

export type GameDifficulty = "jeffrey" | "easy" | "normal" | "hard" | "adonis";

export let gameDifficulty: GameDifficulty = "normal";

export function getDifficultyMultiplier(significance: number = 1) {
  const num = difficultyNumber();
  return Math.pow(num, significance);
}

function difficultyNumber() {
  switch (gameDifficulty) {
    case "jeffrey":
    case "easy":
      return 0.75;
    case "normal":
      return 1;
    case "hard":
    case "adonis":
      return 1.4;
  }
}

export const restartGame = () => {
  console.log("restarting game");

  if (scene) {
    scene.destroy();
  }

  scene = new Scene();
  scene.setWorldRenderer(
    new ReactPositionalRenderer(document.getElementById("game")!, "#222233")
  );
  scene.addRenderer(new ReactUIRenderer(document.getElementById("ui")!));
  // scene.addRenderer(new DebugRenderer(document.getElementById("debug")!));
  scene.addSystem(
    new Physics2D({
      gravity: false,
    })
  );
  // scene.addSystem(new DebugRenderer(document.getElementById("debug")!));
  Input.init();

  playerPrefab.instantiate(scene, {});
  worldPrefab.instantiate(scene, {});

  if (gameDifficulty !== "jeffrey" && gameDifficulty !== "hard")
    dogPrefab.instantiate(scene, {});

  scene.addSystem(new ZombieSystem());

  gameUiPrefab.instantiate(scene, {});

  upgradeSystemPrefab.instantiate(scene, {});

  scene.start();
};

// enablePerformanceLogging();

function showMainMenu() {
  createRoot(document.getElementById("ui")!).render(<MainMenu />);
}

showMainMenu();

function MainMenu() {
  const buttons = [
    {
      text: "Jeffrey",
      gameDifficulty: "jeffrey",
      noDog: true,
    },
    {
      text: "Easy",
      gameDifficulty: "easy",
    },
    {
      text: "Normal",
      gameDifficulty: "normal",
    },
    {
      text: "Hard",
      gameDifficulty: "hard",
      noDog: true,
    },
    {
      text: "Adonis",
      gameDifficulty: "adonis",
    },
  ];

  const [openPage, setOpenPage] = useState<"main" | "upgrades">("main");
  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('https://filterforge.com/filters/7459.jpg')",
      }}
    >
      {openPage === "upgrades" ? (
        <div className="flex flex-col items-center justify-center bg-slate-600 p-10 rounded-xl bg-opacity-50 gap-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-xl">
            Upgrades
          </h1>

          <div className="flex flex-col items-stretch gap-2 justify-center mt-4">
            {Upgrade.map((upgrade) => (
              <div>
                <div className="flex flex-col justify-between items-center">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                    {upgrade.name}
                  </span>
                  <span className="text-lg font-bold text-gray-300 drop-shadow-lg">
                    {upgrade.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setOpenPage("main");
            }}
            className="relative bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-24 rounded text-xl"
          >
            Back
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-slate-600 p-10 rounded-xl bg-opacity-50 gap-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-xl">
            Zombie Game
          </h1>
          <h2 className="text-xl font-bold text-white drop-shadow-lg">
            Choose your difficulty:
          </h2>
          <div className="flex flex-col items-stretch gap-2 justify-center mt-4">
            {buttons.map((button) => (
              <button
                className="relative bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-24 rounded text-xl"
                onClick={() => {
                  gameDifficulty = button.gameDifficulty as GameDifficulty;
                  restartGame();
                }}
              >
                {button.text}
                {button.noDog && (
                  <span className="absolute top-0 right-0 text-gray-300 text-sm p-1">
                    {" "}
                    (no dog)
                  </span>
                )}
              </button>
            ))}
          </div>
          <h2 className="text-xl font-bold text-white drop-shadow-lg">Or:</h2>
          <button
            className="relative bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-5 rounded text-xl"
            onClick={() => {
              setOpenPage("upgrades");
            }}
          >
            {"See Upgrades"}
          </button>
        </div>
      )}
    </div>
  );
}
