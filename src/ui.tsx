import {
  Component,
  Prefab,
  ReactUIComponent,
  Scene,
  Vector2,
} from "@p3ntest/wolf-engine";
import { ZombieSystem } from "./zombie";

export const gameUiPrefab = new Prefab<{}>("GameUi", (entity, {}) => {
  entity.addTag("game-ui");
  entity.addTag("ui");

  entity.addComponents(
    new ReactUIComponent(
      () => {
        const wave = entity.scene.getSystem(ZombieSystem)!.currentWave;
        return (
          <div className="text-white text-3xl font-bold drop-shadow">
            Wave {wave}
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
            className="drop-shadow"
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
