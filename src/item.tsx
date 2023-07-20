import {
  Component,
  ComponentUpdateProps,
  Prefab,
  ReactRenderedComponent,
  RigidBody2D,
  Transform2D,
  Vector2,
} from "wolf-engine";
import { Bodies } from "matter-js";

export const itemTypes = {
  healthPack: {
    name: "Health Pack",
    sprite: "https://img.itch.zone/aW1nLzQyNjQ0OTgucG5n/315x250%23c/qVRRFO.png",
    magnet: false,
    size: 1,
  },
  dogTreat: {
    name: "Dog Treat",
    sprite: "https://cdn-icons-png.flaticon.com/512/5793/5793514.png",
    magnet: false,
    size: 1,
  },
  coin: {
    name: "Coin",
    sprite:
      "https://static.vecteezy.com/system/resources/previews/019/046/339/original/gold-coin-money-symbol-icon-png.png",
    magnet: true,
    size: 0.3,
  },
};

export const itemPrefab = new Prefab<{
  type: keyof typeof itemTypes;
  x: number;
  y: number;
}>("Item", (item, { type = "healthPack", x = 0, y = 0 }) => {
  const size = itemTypes[type].size;
  item.addComponents(
    new Transform2D(),
    new ItemComponent(type),
    new RigidBody2D(
      Bodies.rectangle(0, 0, 50 * size, 50 * size, {
        isSensor: true,
      })
    ),
    new ReactRenderedComponent(() => {
      return (
        <img
          style={{
            width: 50 * size + "px",
            height: 50 * size + "px",
          }}
          src={itemTypes[type].sprite}
        />
      );
    }, 2)
  );
  item.requireComponent(Transform2D).setPosition(new Vector2(x, y));
  item.addTag("item");
});

export class ItemComponent extends Component {
  constructor(type: keyof typeof itemTypes) {
    super();
    this.type = type;
  }

  onAttach(): void {
    // set a slight velocity in a random direction
    const rigidBody = this.entity.requireComponent(RigidBody2D);
    rigidBody.setVelocity(
      Vector2.fromAngle(Math.random() * Math.PI * 2)
        .normalize()
        .multiplyScalar(0.5)
    );
  }

  onUpdate(props: ComponentUpdateProps): void {
    // check if is magnet
    if (itemTypes[this.type].magnet) {
      const player = this.entity.scene.getEntityByTag("player")!;
      const playerTransform = player.requireComponent(Transform2D);
      const playerPosition = playerTransform.getGlobalPosition();
      const position = this.entity
        .requireComponent(Transform2D)
        .getGlobalPosition();

      const delta = playerPosition.subtract(position);

      const distance = delta.length();

      if (distance < 100) {
        const direction = delta.normalize();
        const rigidBody = this.entity.requireComponent(RigidBody2D);
        rigidBody.applyForce(
          direction.multiplyScalar(0.00001 * distance * props.deltaTime)
        );
      }
    }
  }

  type: keyof typeof itemTypes = "healthPack";
}
