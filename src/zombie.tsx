import {
  Component,
  ComponentUpdateProps,
  Entity,
  Prefab,
  ReactRenderedComponent,
  RigidBody2D,
  System,
  SystemUpdateProps,
  Transform2D,
  Vector2,
} from "wolf-engine";
import { Bodies } from "matter-js";
import { HealthComponent } from "./util";
import { bloodSplatPrefab } from "./blood";
import { itemPrefab } from "./item";
import { showTitle } from "./ui";
import { WolfPerformance } from "wolf-engine/src/Performance";
import { spawnCoin } from "./coins";

interface ZombieProps {
  size: number;
  health: number;
  speed: number;
  damage: number;
}

export const zombiePrefab = new Prefab<
  ZombieProps & {
    healthMultiplier: number;
  }
>("Zombie", (zombie, props) => {
  const { size = 1, health = 20, speed = 1, damage = 10 } = props;
  zombie.addTag("zombie");

  const pixelSize = 60 * size + "px";

  zombie.addComponents(
    new Transform2D(),
    new RigidBody2D(
      Bodies.circle(0, 0, 30, {
        mass: 10 * size * size * size, // mass is proportional to size cubed (volume)
      })
    ),
    new HealthComponent(health * (props.healthMultiplier ?? 0)),
    new ReactRenderedComponent(
      () => (
        <div
          style={{
            width: pixelSize,
            height: pixelSize,
            borderRadius: "0px",
            backgroundImage:
              "url('https://opengameart.org/sites/default/files/export_move.gif')",
            backgroundSize: "cover",
            transform: "rotate(-90deg)",
          }}
        />
      ),
      10
    ),
    new ZombieController({
      size,
      health,
      speed,
      damage,
    })
  );
});

export class ZombieController extends Component {
  attackCoolDown: number = 0;

  target: Entity | null = null;

  props: ZombieProps;

  constructor(props: ZombieProps) {
    super();
    this.props = props;
  }

  _knockBack: Vector2 | null = null;

  targetNearestTarget(): void {
    const friendlyEntities = this.entity.scene
      .getAllEntities()
      .filter((entity) => {
        return entity.hasTag("friendly");
      });

    this.target = friendlyEntities.sort((a, b) => {
      const aPos = a.requireComponent(Transform2D).getGlobalPosition();
      const bPos = b.requireComponent(Transform2D).getGlobalPosition();

      const distanceA = aPos
        .subtract(this.entity.requireComponent(Transform2D).getGlobalPosition())
        .length();
      const distanceB = bPos
        .subtract(this.entity.requireComponent(Transform2D).getGlobalPosition())
        .length();

      return distanceA - distanceB;
    })[0];
  }

  onUpdate(props: ComponentUpdateProps): void {
    this.attackCoolDown -= props.deltaTime;

    if (!this.target) {
      this.targetNearestTarget();
    }

    if (Math.random() * props.deltaTime < 0.02) {
      this.targetNearestTarget();
    }

    const transform = this.entity.requireComponent(Transform2D);
    const rb = this.entity.requireComponent(RigidBody2D);
    const target = this.target!;

    const targetPos = target!.requireComponent(Transform2D).getGlobalPosition();

    const zombiePos = transform.getGlobalPosition();

    const direction = targetPos.subtract(zombiePos).normalize();

    transform.setRotation(direction.getAngle());

    rb.translate(
      direction.multiplyScalar(0.1 * props.deltaTime * this.props.speed)
    );

    if (this._knockBack) {
      rb.applyForce(this._knockBack.multiplyScalar(10 / props.deltaTime));
      this._knockBack = null;
    }

    if (this.entity.requireComponent(HealthComponent).health <= 0) {
      this.die();
    }

    // Attack logic
    const distance = target
      .requireComponent(Transform2D)
      .getGlobalPosition()
      .subtract(zombiePos)
      .length();
    if (distance < 100 && this.attackCoolDown <= 0) {
      this.attackCoolDown = 1000;
      target.requireComponent(HealthComponent).damage(this.props.damage);
    }
  }

  damageFromPlayer(): void {
    this.target = this.entity.scene.getAllEntities().find((entity) => {
      return entity.hasTag("player");
    })!;
  }

  isLastOfWave(): boolean {
    const controller = this.entity.scene.getSystem(ZombieSystem)!;
    const numZombies = this.entity.scene.getEntitiesByTag("zombie").length;
    return (
      controller.currentWaveSpawned ===
        getWave(controller.currentWave).maxZombies && numZombies === 1
    );
  }

  die() {
    bloodSplatPrefab.instantiate(this.entity.scene, {
      x: this.entity.requireComponent(Transform2D).getGlobalPosition().x,
      y: this.entity.requireComponent(Transform2D).getGlobalPosition().y,
      size: 100 * this.props.size,
    });

    if (Math.random() < 0.1)
      itemPrefab.instantiate(this.entity.scene, {
        x: this.entity.requireComponent(Transform2D).getGlobalPosition().x,
        y: this.entity.requireComponent(Transform2D).getGlobalPosition().y,
        type: "healthPack",
      });

    const coinAmount = Math.floor(Math.random() * 5 * this.props.size) + 1;
    for (let i = 0; i < coinAmount; i++) {
      spawnCoin(
        this.entity.scene,
        this.entity.requireComponent(Transform2D).getGlobalPosition()
      );
    }

    if (this.isLastOfWave()) {
      itemPrefab.instantiate(this.entity.scene, {
        x: this.entity.requireComponent(Transform2D).getGlobalPosition().x,
        y: this.entity.requireComponent(Transform2D).getGlobalPosition().y,
        type: "dogTreat",
      });
    }

    this.entity.destroy();
  }

  onCollisionStart2D(other: Component): void {
    if (other.entity.hasTag("bullet")) {
      // apply knockback
      const bulletRb = other.entity.requireComponent(RigidBody2D);
      const force = bulletRb.getVelocity();
      this._knockBack = force.multiplyScalar(0.01);
    }
  }
}

export const enemySpawnPointPrefab = new Prefab<{
  x: number;
  y: number;
}>("EnemySpawnPoint", (area, { x, y }) => {
  area.addTag("enemySpawnPoint");
  area.addComponents(new Transform2D());
  area.requireComponent(Transform2D).setPosition(new Vector2(x, y));
});

export class ZombieSystem extends System {
  currentWave: number = 0;
  spawnTimer: number = 0;
  currentWaveSpawned: number = 0;

  waveRunning: boolean = false;
  waveCountdown: number = 0;

  onUpdate(props: SystemUpdateProps): void {
    WolfPerformance.start("zombie-system");
    if (!this.waveRunning) {
      this.waveCountdown -= props.deltaTime;

      if (this.waveCountdown <= 0) {
        this.waveRunning = true;
        this.currentWave += 1;
        this.currentWaveSpawned = 0;
        console.log("Wave", this.currentWave);
        showTitle(this.scene, `Wave ${this.currentWave}`);
      }
    } else {
      const wave = getWave(this.currentWave);
      this.spawnTimer += props.deltaTime;

      if (this.currentWaveSpawned < wave.maxZombies) {
        if (this.spawnTimer >= wave.zombieSpawnInterval) {
          this.spawnTimer = 0;
          this.currentWaveSpawned += 1;
          this.spawnZombie();
        }
      } else if (this.scene.getEntitiesByTag("zombie").length === 0) {
        this.waveRunning = false;
        this.waveCountdown = 5000;
        showTitle(this.scene, `Wave ${this.currentWave} Complete`);
      }
    }
    WolfPerformance.end("zombie-system");
  }

  spawnZombie(): void {
    // Get a location in a spawnable area but not in a certain radius of the player
    const player = this.scene.getAllEntities().find((entity) => {
      return entity.hasTag("player");
    })!;
    const playerPos = player.requireComponent(Transform2D).getGlobalPosition();

    let spawnPoints = this.scene.getAllEntities().filter((entity) => {
      return entity.hasTag("enemySpawnPoint");
    });

    const playerRadius = 800;

    spawnPoints = spawnPoints.filter((spawnPoint) => {
      const spawnPointPos = spawnPoint
        .requireComponent(Transform2D)
        .getGlobalPosition();

      return spawnPointPos.subtract(playerPos).length() > playerRadius;
    });

    const spawnPoint =
      spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

    if (!spawnPoint) {
      console.warn("No spawn points found");
      return;
    }

    const wave = getWave(this.currentWave);

    const healthMultiplier = 1 + Math.pow(this.currentWave - 1, 0.5) * 0.1;

    const zombie = zombiePrefab.instantiate(this.scene, {
      ...getRandomZombie(wave.zombieWeights),
      healthMultiplier,
    });
    zombie
      .requireComponent(Transform2D)
      .setPosition(
        spawnPoint.requireComponent(Transform2D).getGlobalPosition()
      );
  }
}

const zombieTypes: { [key: string]: ZombieProps } = {
  normal: {
    size: 1,
    health: 20,
    speed: 0.7,
    damage: 10,
  },
  giant: {
    size: 4,
    health: 100,
    speed: 0.2,
    damage: 100,
  },
  fast: {
    size: 0.7,
    health: 10,
    speed: 2,
    damage: 5,
  },
};

function getRandomZombie(weights: {
  [key: keyof typeof zombieTypes]: number;
}): ZombieProps {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [key, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return zombieTypes[key as keyof typeof zombieTypes];
    }
  }

  return zombieTypes.normal;
}

function getWave(wave: number): Wave {
  wave = wave - 1;
  const maxZombies = 10 + Math.pow(wave, 2) * 0.5;
  const zombieWeights = {
    normal: 1 + wave * 0.1,
    giant: 0.1 * wave,
    fast: 0.5 * wave,
  };

  const zombieSpawnInterval = Math.max(1000 - wave * 100, 10);

  return {
    maxZombies,
    zombieWeights,
    zombieSpawnInterval,
  };
}

type Wave = {
  maxZombies: number;
  zombieWeights: { [key: keyof typeof zombieTypes]: number };
  zombieSpawnInterval: number;
};
