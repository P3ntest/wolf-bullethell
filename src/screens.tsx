import {
  Prefab,
  ReactUIComponent,
  ReactUIRenderer,
} from "@p3ntest/wolf-engine";
import { restartGame } from "./main";

export const gameOverScreen = new Prefab("GameOverScreen", (entity, props) => {
  entity.addTag("gameOverScreen");

  entity.addComponents(
    new ReactUIComponent(
      () => (
        <div className="w-screen h-screen flex flex-col gap-5 items-center justify-center">
          <h1 className="text-6xl text-white drop-shadow font-black">
            Game Over!
          </h1>
          <button
            onClick={restartGame}
            className="p-5 px-8 bg-gray-700 rounded text-white uppercase font-bold text-xl hover:bg-gray-900 transition-all"
          >
            Restart
          </button>
        </div>
      ),
      {
        position: {
          anchor: "center-center",
        },
        zIndex: 100,
      }
    )
  );
});
