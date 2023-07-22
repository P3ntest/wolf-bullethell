import {
  Component,
  ComponentUpdateProps,
  Entity,
  Input,
  Prefab,
  ReactRenderedComponent,
  RigidBody2D,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";
import { Bodies } from "matter-js";
import { HealthComponent } from "./util";
import { ItemComponent } from "./item";
import { getUpgradeLevel } from "./upgrades";
import { doGameOver } from "./player";
import { getDifficultyMultiplier } from "./main";

export const dogPrefab = new Prefab<{}>("Dog", (dog, {}) => {
  dog.addTag("dog");
  dog.addTag("friendly");

  const scale = 0.5;

  dog.addComponents(
    new Transform2D(),
    new RigidBody2D(Bodies.rectangle(0, 0, 51 * scale, 130 * scale)),
    new HealthComponent(40),
    new ReactRenderedComponent(
      () => (
        <img
          style={{
            width: 51 * scale + "px",
            height: 130 * scale + "px",
          }}
          src="https://i.imgur.com/GwMoGB1.png"
        />
      ),
      10
    ),
    new DogController()
  );
});

export class DogController extends Component {
  state: "following" | "staying" = "following";
  target: Vector2 | null = null;

  followLogic(target: Vector2, deltaTime: number) {
    const transform = this.entity.requireComponent(Transform2D);
    const path = target.subtract(transform.getGlobalPosition());

    const direction = path.normalize();

    const rb = this.entity.requireComponent(RigidBody2D);

    const distance = target.subtract(transform.getGlobalPosition()).length();

    rb.translate(direction.multiplyScalar(0.001 * deltaTime * distance));

    const targetAngle = direction.getDeltaAngle(
      Vector2.fromAngle(transform.localRotation)
    );

    const newAngle = transform.localRotation + targetAngle * 0.01 * deltaTime;

    if (!isNaN(newAngle)) transform.setRotation(newAngle % (Math.PI * 2));
  }

  onCollisionStart2D(other: Component): void {
    if (other.entity.hasTag("item")) {
      console.log("dog collision with item");
      const item = other.entity.requireComponent(ItemComponent);
      if (item.type === "dogTreat") {
        this.entity.requireComponent(HealthComponent).heal();
        other.entity.destroy();
      }
    }
  }

  playerDistanceToBone(): number {
    const bone = this.targetDisplay!.requireComponent(Transform2D);
    const player = this.entity.scene
      .getEntityByTag("player")!
      .requireComponent(Transform2D);
    return bone
      .getGlobalPosition()
      .subtract(player.getGlobalPosition())
      .length();
  }

  targetDisplay: Entity | null = null;
  onAttach(): void {
    this.targetDisplay = this.entity.scene.createEntity();
    this.targetDisplay.addComponents(
      new Transform2D(),
      new ReactRenderedComponent(() => {
        const visible = this.target || this.playerDistanceToBone() > 10;
        return (
          <img
            style={{
              width: 30 + "px",
              height: 30 + "px",
              opacity: visible ? 1 : 0,
            }}
            src="https://www.pngplay.com/wp-content/uploads/2/Bone-PNG-Pic-Background.png"
            alt=""
          />
        );
      }, 1)
    );

    const maxHealth =
      (75 + 25 * getUpgradeLevel(this.entity.scene, "doggyHealth")) *
      getDifficultyMultiplier(-1);

    this.entity.requireComponent(HealthComponent).health = maxHealth;
  }

  onUpdate(props: ComponentUpdateProps): void {
    const maxHealth =
      (75 + 25 * getUpgradeLevel(this.entity.scene, "doggyHealth")) *
      getDifficultyMultiplier(-1);
    this.entity.requireComponent(HealthComponent).maxHealth = maxHealth;

    if (this.entity.requireComponent(HealthComponent).health <= 0) {
      doGameOver(this.entity);
      this.entity.destroy();
    }

    const dogTreat = this.entity.scene
      .getAllEntities()
      .find(
        (entity) => entity.getComponent(ItemComponent)?.type === "dogTreat"
      );

    if (dogTreat) {
      this.followLogic(
        dogTreat.requireComponent(Transform2D).getGlobalPosition(),
        props.deltaTime
      );
    } else if (this.target) {
      this.followLogic(this.target, props.deltaTime);
    } else {
      const playerPos = this.entity.scene
        .getEntityByTag("player")!
        .requireComponent(Transform2D)
        .getGlobalPosition();

      const distance = playerPos
        .subtract(this.entity.requireComponent(Transform2D).getGlobalPosition())
        .length();

      if (distance > 100) {
        this.followLogic(playerPos, props.deltaTime);
      }
    }

    if (Input.getKeyDown("e")) {
      this.target = null;
    }

    if (Input.getKeyDown("q")) {
      const pos = this.entity.scene.worldRenderer.transformScreenToWorld(
        Vector2.fromObject(Input.getMousePosition())
      );
      this.target = pos;
    }

    const targetTransform = this.targetDisplay!.requireComponent(Transform2D);
    const targetPos =
      this.target ??
      this.entity.scene
        .getEntityByTag("player")!
        .requireComponent(Transform2D)
        .getGlobalPosition();
    const currentPos = targetTransform.getGlobalPosition();
    const path = targetPos.subtract(currentPos);
    if (path.length() > 10) {
      targetTransform.translate(path.normalize().multiplyScalar(10));
    }
  }
}
