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
import { upgradeSystemPrefab } from "./upgrades";
import { enablePerformanceLogging } from "@p3ntest/wolf-engine/src/Performance";
import { gameUiPrefab } from "./ui";

Engine.init();

let scene: Scene | null;

export const restartGame = () => {
  console.log("restarting game");

  if (scene) {
    scene.destroy();
  }

  scene = new Scene();
  scene.setWorldRenderer(
    new ReactPositionalRenderer(document.getElementById("game")!)
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
  dogPrefab.instantiate(scene, {});
  scene.addSystem(new ZombieSystem());

  gameUiPrefab.instantiate(scene, {});

  upgradeSystemPrefab.instantiate(scene, {});

  scene.start();
};

enablePerformanceLogging();

restartGame();
