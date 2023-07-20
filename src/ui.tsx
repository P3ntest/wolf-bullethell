import {
  Component,
  Prefab,
  ReactUIComponent,
  Scene,
  Vector2,
} from "wolf-engine";

export const gameUiPrefab = new Prefab<{}>("GameUi", (entity, {}) => {
  entity.addTag("game-ui");
  entity.addTag("ui");

  entity.addComponents();
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
