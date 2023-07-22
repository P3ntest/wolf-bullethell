import {
  Component,
  ComponentUpdateProps,
  Prefab,
  ReactRenderedComponent,
  RigidBody2D,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";
import { Bodies } from "matter-js";
import { HealthComponent } from "./util";
import { ZombieController } from "./zombie";
import { getUpgradeLevel } from "./upgrades";
import { playSound } from "./sound";
import { getDifficultyMultiplier } from "./main";

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
            // if (other.entity.hasTag("friendly")) return;wd

            const damage =
              (10 +
                Math.pow(
                  getUpgradeLevel(this.entity.scene, "bulletDamage"),
                  1.5
                ) *
                  3) *
              getDifficultyMultiplier(other.entity.hasTag("dog") ? 0.7 : -0.7);

            const multiplier = Math.max(
              0,
              other.entity.hasTag("dog")
                ? 1 - getUpgradeLevel(this.entity.scene, "friendlyFire") * 0.1
                : 1
            );

            other.entity
              .requireComponent(HealthComponent)
              .damage(damage * multiplier);
            this.context.pierced += 1;

            if (other.entity.hasTag("dog")) {
              playSound("Bark");
            }

            playSound("Impact");

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
    bullet.requireComponent(Transform2D).setRotation(direction!.getAngle());
  }
);
