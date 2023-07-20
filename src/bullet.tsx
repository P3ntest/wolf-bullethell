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
import { HealthComponent } from "./util";
import { ZombieController } from "./zombie";
import { getUpgradeLevel } from "./upgrades";

type BulletProps = { direction: Vector2; position: Vector2 };
export const bulletPrefab = new Prefab<BulletProps>(
  "Bullet",
  (bullet, { direction, position }) => {
    bullet.addTag("bullet");

    bullet.addComponents(
      new Transform2D(),
      new RigidBody2D(
        Bodies.circle(0, 0, 10, {
          isSensor: true,
        })
      ),
      new ReactRenderedComponent(
        () => (
          <div
            style={{
              width: "8px",
              height: "20px",
              borderRadius: "100px",
              backgroundImage: "url('https://i.redd.it/zqzgzpriobd61.png')",
              backgroundSize: "contain",
            }}
          />
        ),
        10
      ),
      Component.fromMethods<
        BulletProps & { lifetime: number; pierced: number }
      >({
        setupContext() {
          this.context.direction = direction!.normalize();
          this.context.lifetime = 0;
          this.context.pierced = 0;
        },
        onAttach() {
          this.entity
            .requireComponent(RigidBody2D)
            .setVelocity(this.context.direction.multiplyScalar(30));
        },
        onUpdate({ deltaTime }: ComponentUpdateProps) {
          this.context.lifetime += deltaTime;
          if (this.context.lifetime > 5000) {
            this.entity.destroy();
          }
        },
        onCollisionStart2D(other) {
          if (other.entity.hasTag("wall")) {
            this.entity.destroy();
          }
          if (other.entity.hasComponent(HealthComponent)) {
            other.entity
              .requireComponent(HealthComponent)
              .damage(
                10 + getUpgradeLevel(this.entity.scene, "bulletDamage") * 5
              );
            this.context.pierced += 1;
            if (
              this.context.pierced >=
              getUpgradeLevel(this.entity.scene, "bulletPiercing") + 1
            )
              this.entity.destroy();
          }
          if (other.entity.hasComponent(ZombieController)) {
            other.entity.requireComponent(ZombieController).damageFromPlayer();
          }
        },
      })
    );

    bullet.requireComponent(Transform2D).setPosition(position!);
    bullet.requireComponent(RigidBody2D).setRotation(direction!.getAngle());
  }
);
