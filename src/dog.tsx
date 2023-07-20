import {
  Component,
  ComponentUpdateProps,
  Input,
  Prefab,
  ReactRenderedComponent,
  RigidBody2D,
  Transform2D,
  Vector2,
} from "wolf-engine";
import { Bodies } from "matter-js";
import { HealthComponent } from "./util";
import { ItemComponent } from "./item";

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

    transform.setRotation(
      transform.localRotation + targetAngle * 0.01 * deltaTime
    );
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

  onUpdate(props: ComponentUpdateProps): void {
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
      return;
    }

    if (this.state === "following") {
      const player = this.entity.scene.getAllEntities().find((entity) => {
        return entity.hasTag("player");
      })!;

      const playerPos = player
        .requireComponent(Transform2D)
        .getGlobalPosition();

      const transform = this.entity.requireComponent(Transform2D);

      const radius = 200;

      const distance = playerPos
        .subtract(transform.getGlobalPosition())
        .length();

      if (distance > radius) {
        this.followLogic(playerPos, props.deltaTime);
      }
    }
    if (Input.getKeyDown("e")) {
      this.state = this.state === "following" ? "staying" : "following";
    }

    if (this.entity.requireComponent(HealthComponent).health <= 0) {
      alert("Your dog died!");
    }
  }
}
