import {
  Component,
  ReactRenderedComponent,
  Scene,
  Transform2D,
  Vector2,
} from "wolf-engine";
import { PlayerController } from "./player";

export function spawnCoin(scene: Scene, position: Vector2) {
  const coin = scene.createEntity();

  const direction = Vector2.fromAngle(Math.random() * Math.PI * 2).normalize();
  const target = position.add(direction.multiplyScalar(30));

  coin.addTag("coin");
  coin.addComponents(
    new Transform2D(),
    new ReactRenderedComponent(() => {
      return (
        <img
          style={{
            width: 20 + "px",
            height: 20 + "px",
          }}
          src="https://static.vecteezy.com/system/resources/previews/019/046/339/original/gold-coin-money-symbol-icon-png.png"
        />
      );
    }, 2),
    Component.fromMethods({
      onUpdate(props) {
        const transform = this.entity.requireComponent(Transform2D);
        const playerPosition = this.entity.scene
          .getEntityByTag("player")!
          .requireComponent(Transform2D)
          .getGlobalPosition();
        const position = transform.getGlobalPosition();
        const path = playerPosition.subtract(position);
        const direction = path.normalize();
        const distance = playerPosition.subtract(position).length();

        if (distance < 10) {
          this.entity.destroy();
          this.entity.scene
            .getEntityByTag("player")!
            .requireComponent(PlayerController).coins += 1;
        }

        if (distance < 100) {
          transform.translate(
            direction.multiplyScalar(0.01 * props.deltaTime * distance)
          );
        }

        const targetDelta = target.subtract(position);
        transform.translate(
          targetDelta.multiplyScalar(0.001 * props.deltaTime)
        );
      },
    })
  );

  coin.requireComponent(Transform2D).setPosition(position);
}
