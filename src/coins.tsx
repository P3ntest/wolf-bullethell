import {
  Component,
  ComponentUpdateProps,
  ReactRenderedComponent,
  Scene,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";
import { PlayerController } from "./player";
import { playCoinSound } from "./sound";

export function spawnCoin(scene: Scene, position: Vector2, value: number) {
  const coin = scene.createEntity();

  const direction = Vector2.fromAngle(Math.random() * Math.PI * 2).normalize();
  const target = position.add(direction.multiplyScalar(80));

  coin.addTag("coin");
  coin.addComponents(
    new Transform2D(),
    new ReactRenderedComponent(() => {
      const amount = coin.requireComponent(CoinComponent).value;
      const scale = 1 + Math.pow(amount - 1, 0.3) * 0.5;
      return (
        <img
          style={{
            width: 20 * scale + "px",
            height: 20 * scale + "px",
          }}
          src="https://static.vecteezy.com/system/resources/previews/019/046/339/original/gold-coin-money-symbol-icon-png.png"
        />
      );
    }, 2),
    new CoinComponent(target, value)
  );

  coin.requireComponent(Transform2D).setPosition(position);
}

export class CoinComponent extends Component {
  initialTarget: Vector2;

  lifetime = 0;

  value = 1;

  constructor(initialTarget: Vector2, value: number) {
    super();
    this.initialTarget = initialTarget;
    this.value = value;
  }

  goto(target: Vector2, deltaTime: number, speed = 0.003) {
    const transform = this.entity.requireComponent(Transform2D);
    const position = transform.getGlobalPosition();
    const path = target.subtract(position);
    const direction = path.normalize();

    transform.translate(path.normalize().multiplyScalar(speed * deltaTime));
  }

  distanceTo(other: Vector2) {
    const transform = this.entity.requireComponent(Transform2D);
    const position = transform.getGlobalPosition();
    const path = other.subtract(position);

    return path.length();
  }

  isGoingToNearestCoin: boolean = false;

  onUpdate(props: ComponentUpdateProps): void {
    this.lifetime += props.deltaTime;

    const playerPosition = this.entity.scene
      .getEntityByTag("player")!
      .requireComponent(Transform2D)
      .getGlobalPosition();

    const distanceToPlayer = this.distanceTo(playerPosition);

    const scale = 1 + Math.pow(this.value - 1, 0.3) * 0.5;
    if (distanceToPlayer < 30 * scale) {
      playCoinSound();
      this.entity.destroy();
      this.entity.scene
        .getEntityByTag("player")!
        .requireComponent(PlayerController).coins += this.value;
    }

    if (distanceToPlayer < 100) {
      this.goto(playerPosition, props.deltaTime, 0.03 * distanceToPlayer);
    }

    if (this.lifetime > 5000) {
      const nearestOtherCoin = this.entity.scene
        .getEntitiesByTag("coin")
        .filter((coin) => coin !== this.entity)
        .sort((a, b) => {
          const aDist = this.distanceTo(
            a.requireComponent(Transform2D).getGlobalPosition()
          );

          const bDist = this.distanceTo(
            b.requireComponent(Transform2D).getGlobalPosition()
          );
          return aDist - bDist;
        })[0];

      if (nearestOtherCoin) {
        // const distanceToNearestCoin = this.distanceTo(
        //   nearestOtherCoin.requireComponent(Transform2D).getGlobalPosition()
        // );
        // if (distanceToNearestCoin > 500) return;
        this.entity.destroy();
        nearestOtherCoin.requireComponent(CoinComponent).value += this.value;
      }
    }

    // if (this.lifetime > 5000 && !this.isGoingToNearestCoin) {
    //   const nearestOtherCoin = this.entity.scene
    //     .getEntitiesByTag("coin")
    //     .filter((coin) => coin !== this.entity)
    //     .sort((a, b) => {
    //       const aDist = this.distanceTo(
    //         a.requireComponent(Transform2D).getGlobalPosition()
    //       );

    //       const bDist = this.distanceTo(
    //         b.requireComponent(Transform2D).getGlobalPosition()
    //       );
    //       return aDist - bDist;
    //     })[0];

    //   if (nearestOtherCoin) {
    //     this.isGoingToNearestCoin = true;
    //     this.initialTarget = nearestOtherCoin
    //       .requireComponent(Transform2D)
    //       .getGlobalPosition();
    //   }
    // }

    this.goto(this.initialTarget, props.deltaTime);
  }
}
