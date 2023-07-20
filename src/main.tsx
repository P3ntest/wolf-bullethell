import {
  DebugRenderer,
  Engine,
  Input,
  Physics2D,
  ReactPositionalRenderer,
  ReactUIRenderer,
  Scene,
} from "wolf-engine";
import { playerPrefab } from "./player";
import { worldPrefab } from "./world";
import { ZombieSystem } from "./zombie";
import { dogPrefab } from "./dog";
import "./index.css";
import { upgradeSystemPrefab } from "./upgrades";
import { enablePerformanceLogging } from "wolf-engine/src/Performance";

Engine.init();

const scene = new Scene();
scene.setWorldRenderer(
  new ReactPositionalRenderer(document.getElementById("game")!)
);
scene.addRenderer(new ReactUIRenderer(document.getElementById("ui")!));
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

upgradeSystemPrefab.instantiate(scene, {});

scene.ticker.start();

enablePerformanceLogging();
