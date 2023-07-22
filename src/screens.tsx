import {
  Component,
  Prefab,
  ReactUIComponent,
  ReactUIRenderer,
} from "@p3ntest/wolf-engine";
import { gameDifficulty, restartGame } from "./main";
import { ZombieSystem } from "./zombie";

export const gameOverScreen = new Prefab("GameOverScreen", (entity, props) => {
  entity.addTag("gameOverScreen");

  entity.addComponents(
    new GameOverScreen(),
    new ReactUIComponent(
      () => {
        const gameOverComponent = entity.requireComponent(GameOverScreen);
        const score = gameOverComponent.score;
        const difficulty = gameOverComponent.difficulty;
        return (
          <div className="w-screen h-screen flex flex-col gap-5 items-center justify-center">
            <div className="flex flex-col gap-5 items-center bg-gray-800 bg-opacity-80 p-5 rounded-lg">
              <h1 className="text-6xl text-white drop-shadow font-black">
                Game Over!
              </h1>
              <h2 className="text-4xl text-white drop-shadow font-black">
                Score: {score}
              </h2>
              <h2 className="text-4xl text-white drop-shadow font-black">
                Difficulty: {difficulty}
              </h2>
              <button
                onClick={restartGame}
                className="p-5 px-8 bg-gray-700 rounded text-white uppercase font-bold text-xl hover:bg-gray-900 transition-all"
              >
                Restart
              </button>
            </div>
          </div>
        );
      },

      {
        position: {
          anchor: "center-center",
        },
        zIndex: 100,
      }
    )
  );
});

class GameOverScreen extends Component {
  score: number = 0;
  difficulty: string = "";
  onAttach(): void {
    this.score = this.entity.scene.getSystem(ZombieSystem)?.currentScore!;
    this.difficulty = gameDifficulty;
  }
}
