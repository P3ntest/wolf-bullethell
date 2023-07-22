import {
  Component,
  Prefab,
  ReactUIComponent,
  Scene,
  Vector2,
} from "@p3ntest/wolf-engine";
import { ZombieSystem } from "./zombie";

let shownControls = false;

export const gameUiPrefab = new Prefab<{}>("GameUi", (entity, {}) => {
  entity.addTag("game-ui");
  entity.addTag("ui");

  entity.addComponents(
    new ReactUIComponent(
      () => {
        const c = entity.scene.getSystem(ZombieSystem)!;
        const wave = c.currentWave;

        let waveText = "Waiting for next wave...";

        const zombies = entity.scene.getEntitiesByTag("zombie").length;
        if (c.waveRunning) {
          waveText =
            zombies === 1
              ? "1 Zombie Remaining"
              : `${zombies} Zombies Remaining`;
        }

        return (
          <div className="flex flex-col items-center">
            <div className="text-white text-4xl font-bold drop-shadow">
              Wave {wave}
            </div>
            <div className="text-white text-2xl font-bold drop-shadow">
              {waveText}
            </div>
          </div>
        );
      },
      {
        position: {
          anchor: "top-center",
        },
      }
    )
  );

  entity.createEntity().addComponents(
    new ReactUIComponent(
      () => {
        return (
          <div className="text-white text-3xl font-bold drop-shadow p-3 bg-gray-600">
            <h1>Controls</h1>
            <p>WASD - Move</p>
            <p>Q - Throw Bone</p>
            <p>E - Retrieve Bone</p>
            <p>Left Click - Shoot</p>
          </div>
        );
      },
      {
        position: {
          anchor: "center-left",
        },
      }
    ),
    Component.fromMethods<{
      lifetime: number;
    }>({
      onAttach() {
        if (shownControls) {
          this.entity.destroy();
        }
        shownControls = true;
      },
      setupContext() {
        this.context.lifetime = 0;
      },
      onUpdate({ deltaTime }) {
        this.context.lifetime += deltaTime;
        if (this.context.lifetime > 8000) {
          this.entity.destroy();
        }
      },
    })
  );
});

export function showTitle(scene: Scene, title: string, subtitle?: string) {
  let lifetime = 0;

  const titleEntity = scene.createEntity().addComponents(
    new ReactUIComponent(
      () => (
        <div
          style={{
            opacity: 1 - Math.max(lifetime - 2000, 0) / 500,
            transform: `scale(${1 - Math.max(lifetime - 2000, 0) / 500})`,
          }}
        >
          <h1
            style={{
              fontFamily: "sans-serif",
              fontSize: "100px",
              color: "white",
            }}
            className="drop-shadow-xl font-black uppercase"
          >
            {title}
          </h1>
        </div>
      ),
      {
        position: {
          anchor: "center-center",
          offset: new Vector2(0, 0),
        },
      }
    ),
    Component.fromMethods({
      onUpdate({ deltaTime }) {
        lifetime += deltaTime;
        if (lifetime > 2500) {
          titleEntity.destroy();
        }
      },
    })
  );
}
