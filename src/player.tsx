import {
  Component,
  ComponentUpdateProps,
  Input,
  Prefab,
  ReactPositionalCamera,
  ReactPositionalRenderer,
  ReactRenderedComponent,
  RigidBody2D,
  Transform2D,
  Vector2,
} from "wolf-engine";
import { Bodies } from "matter-js";
import { HealthComponent } from "./util";
import { ItemComponent } from "./item";
import { ZombieController } from "./zombie";
import { bulletPrefab } from "./bullet";
import { getUpgradeLevel } from "./upgrades";

export const playerPrefab = new Prefab<{}>("Player", (player, {}) => {
  player.addTag("player");
  player.addTag("friendly");

  player.addComponents(
    new Transform2D(),
    new RigidBody2D(Bodies.circle(0, 0, 30)),
    new ReactRenderedComponent(
      () => (
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "0px",
            backgroundImage:
              "url('https://opengameart.org/sites/default/files/preview_idle.gif')",
            backgroundSize: "cover",
            transform: "rotate(-90deg)",
          }}
        />
      ),
      10
    ),
    new HealthComponent(100),
    new PlayerController()
  );

  const bulletSpawner = player
    .createEntity()
    .addComponents(new Transform2D())
    .addTag("bulletSpawner");
  bulletSpawner.requireComponent(Transform2D).translate(new Vector2(10, -45));

  player.scene.createEntity().addComponents(
    new Transform2D(),
    new ReactPositionalCamera(),
    Component.fromMethods({
      onUpdate({}: ComponentUpdateProps) {
        const player = this.entity.scene.getAllEntities().find((entity) => {
          return entity.hasTag("player");
        })!;

        const playerPos = player
          .requireComponent(Transform2D)
          .getGlobalPosition();

        const cameraPos = this.entity
          .requireComponent(Transform2D)
          .getGlobalPosition();

        const path = playerPos.subtract(cameraPos);

        const distance = path.length();
        const force = distance;

        this.entity
          .requireComponent(Transform2D)
          .translate(path.multiplyScalar(0.001 * force));

        // Make camera follow player with a delay
      },
    })
  );
});

export class PlayerController extends Component {
  get shootingDelay() {
    const shotsPerSecond =
      1 + getUpgradeLevel(this.entity.scene, "fireRate") * 0.5;
    return (1 / shotsPerSecond) * 1000;
  }
  shootingTimer = 0;

  onUpdate(props: ComponentUpdateProps): void {
    const rb = this.entity.requireComponent(RigidBody2D);

    const direction = new Vector2(
      Input.getAxis("Horizontal"),
      Input.getAxis("Vertical")
    );

    const movement = direction
      .normalize()
      .multiplyScalar(0.4 * props.deltaTime);

    rb.translate(movement);

    // Rotation
    const mousePos = Input.getMousePosition();
    const worldMousePos =
      this.entity.scene.worldRenderer.transformScreenToWorld(
        Vector2.fromObject(mousePos)
      );

    const currentVector = worldMousePos.subtract(
      this.entity.requireComponent(Transform2D).getGlobalPosition()
    );

    this.entity
      .requireComponent(RigidBody2D)
      .setRotation(currentVector.getAngle());

    // Shooting
    this.shootingTimer += props.deltaTime;
    const canShoot = this.shootingTimer > this.shootingDelay;

    if (Input.getKey("mouse0") && canShoot) {
      this.shootingTimer = 0;
      this.shoot(worldMousePos);
    }

    if (this.entity.requireComponent(HealthComponent).health <= 0) {
      alert("You died!");
    }
  }

  shoot(target: Vector2) {
    const bulletSpawner = this.entity.children.find((entity) => {
      return entity.hasTag("bulletSpawner");
    })!;

    const currentVector = target.subtract(
      bulletSpawner.requireComponent(Transform2D).getGlobalPosition()
    );

    bulletPrefab.instantiate(this.entity.scene, {
      direction: currentVector,
      position: bulletSpawner.requireComponent(Transform2D).getGlobalPosition(),
    });
  }

  coins: number = 0;

  onCollisionStart2D(other: Component): void {
    if (other.entity.hasTag("item")) {
      const item = other.entity.requireComponent(ItemComponent);
      if (item.type === "healthPack") {
        this.entity.requireComponent(HealthComponent).heal();
        other.entity.destroy();
      } else if (item.type === "coin") {
        this.coins++;
        other.entity.destroy();
      }
    }
  }
}
