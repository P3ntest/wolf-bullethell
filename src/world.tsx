import {
  Prefab,
  ReactRenderedComponent,
  RigidBody2D,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";
import { Bodies } from "matter-js";
import { enemySpawnPointPrefab } from "./zombie";

import floor_texture from "./assets/textures/floor.jpg";
import wall_texture from "./assets/textures/wall.jpg";

export const worldPrefab = new Prefab<{}>("World", (entity, {}) => {
  entity.addComponent(new Transform2D());
  const floor = entity.createEntity();

  floor.addComponents(
    new Transform2D(),
    new ReactRenderedComponent(() => (
      <div
        style={{
          width: "2000px",
          height: "2000px",
          backgroundImage: `url(${floor_texture})`,
        }}
      />
    )),
  );

  wallPrefab.instantiate(entity, {
    width: 2200,
    height: 100,
    x: 0,
    y: 1050,
  });

  wallPrefab.instantiate(entity, {
    width: 2200,
    height: 100,
    x: 0,
    y: -1050,
  });

  wallPrefab.instantiate(entity, {
    width: 100,
    height: 2000,
    x: 1050,
    y: 0,
  });

  wallPrefab.instantiate(entity, {
    width: 100,
    height: 2000,
    x: -1050,
    y: 0,
  });

  [1000, -1000, 0, -500, 500].forEach((x) => {
    [1000, -1000, 0, -500, 500].forEach((y) => {
      if (Math.abs(x) < 1000 && Math.abs(y) < 1000) return;
      enemySpawnPointPrefab.instantiate(entity, {
        x,
        y,
      });
    });
  });
});

const wallPrefab = new Prefab<{
  width: number;
  height: number;
  x: number;
  y: number;
}>("Wall", (entity, { width, height, x, y }) => {
  entity.addComponents(
    new Transform2D(),
    new RigidBody2D(
      Bodies.rectangle(0, 0, width!, height!, { isStatic: true }),
    ),
    new ReactRenderedComponent(() => (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: `url(${wall_texture})`,
          backgroundSize: "contain",
        }}
      />
    )),
  );
  entity.addTag("wall");
  entity.requireComponent(Transform2D).setPosition(new Vector2(x, y));
});
