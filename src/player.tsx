import {
  Component,
  ComponentUpdateProps,
  Entity,
  Input,
  Prefab,
  ReactPositionalCamera,
  ReactPositionalRenderer,
  ReactRenderedComponent,
  RigidBody2D,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";
import { Bodies } from "matter-js";
import { HealthComponent } from "./util";
import { ItemComponent } from "./item";
import { ZombieController } from "./zombie";
import { bulletPrefab } from "./bullet";
import { getUpgradeLevel, mouseOnUi } from "./upgrades";
import { gameOverScreen } from "./screens";
import { bloodSplatPrefab } from "./blood";
import { playSound } from "./sound";
import { getDifficultyMultiplier } from "./main";

export const playerPrefab = new Prefab<{}>("Player", (player, {}) => {
  player.addTag("player");
  player.addTag("friendly");

  player.addComponents(
    new Transform2D(),
    new RigidBody2D(Bodies.circle(0, 0, 30)),
    new ReactRenderedComponent(() => {
      if (player.requireComponent(PlayerController).dead) return <div></div>;
      return (
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
      );
    }, 10),
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

export function doGameOver(entity: Entity) {
  if (!entity.scene.getEntityByTag("gameOverScreen")) {
    gameOverScreen.instantiate(entity.scene, {});
    bloodSplatPrefab.instantiate(entity.scene, {
      x: entity.requireComponent(Transform2D).getGlobalPosition().x,
      y: entity.requireComponent(Transform2D).getGlobalPosition().y,
      size: 100 * 20,
    });
  }
}

export class PlayerController extends Component {
  get shootingDelay() {
    const shotsPerSecond =
      1 + getUpgradeLevel(this.entity.scene, "fireRate") * 0.5;
    return (1 / shotsPerSecond) * 1000;
  }
  shootingTimer = 0;

  dead: boolean = false;

  onAttach(): void {
    const maxHealth =
      (100 + getUpgradeLevel(this.entity.scene, "maxPlayerHealth") * 25) *
      getDifficultyMultiplier(-0.7);

    this.entity.requireComponent(HealthComponent).health = maxHealth;
  }

  onUpdate(props: ComponentUpdateProps): void {
    if (Input.getKeyDown("k"))
      this.entity.requireComponent(HealthComponent).damage(10000);

    if (this.entity.requireComponent(HealthComponent).health <= 0) {
      this.dead = true;
      doGameOver(this.entity);
    }

    if (this.dead) return;

    const maxHealth =
      (100 + getUpgradeLevel(this.entity.scene, "maxPlayerHealth") * 25) *
      getDifficultyMultiplier(-0.7);
    this.entity.requireComponent(HealthComponent).maxHealth = maxHealth;

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

    if (
      (Input.getKey("mouse0") || Input.getKey(" ")) &&
      canShoot &&
      !mouseOnUi
    ) {
      this.shootingTimer = 0;
      const burst = 1 + getUpgradeLevel(this.entity.scene, "burst");
      this.shoot(worldMousePos, burst);
    }

    this.lifeTime += props.deltaTime;

    // planned shots logic
    const dueShots = this.plannedShots.filter((shot) => {
      return shot.dueTime < this.lifeTime;
    });
    if (dueShots.length > 0) console.log(dueShots);

    dueShots.forEach((shot) => {
      this.shoot(shot.target, 1);
    });

    this.plannedShots = this.plannedShots.filter((shot) => {
      return !dueShots.includes(shot);
    });
  }

  lifeTime = 0;

  plannedShots: {
    dueTime: number;
    target: Vector2;
  }[] = [];

  shoot(target: Vector2, burst: number) {
    playSound("Shot");
    const burstAmount = burst;
    const delayedShots = burstAmount - 1;
    const burstDuration = 200;
    const intervals = burstDuration / delayedShots;

    if (delayedShots > 0)
      for (let i = 0; i < delayedShots; i++) {
        this.plannedShots.push({
          dueTime: this.lifeTime + intervals * (i + 1),
          target: target,
        });
      }

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

  coins: number = 20;

  onCollisionStart2D(other: Component): void {
    if (other.entity.hasTag("item")) {
      const item = other.entity.requireComponent(ItemComponent);
      if (item.type === "healthPack") {
        this.entity
          .requireComponent(HealthComponent)
          .heal(70 * getDifficultyMultiplier(-0.5));
        other.entity.destroy();
      } else if (item.type === "coin") {
        this.coins++;
        other.entity.destroy();
      }
    }
  }
}
