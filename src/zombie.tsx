import {
  Component,
  ComponentUpdateProps,
  Entity,
  Input,
  Prefab,
  ReactRenderedComponent,
  RigidBody2D,
  System,
  SystemUpdateProps,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";
import { Bodies } from "matter-js";
import { HealthComponent } from "./util";
import { bloodSplatPrefab } from "./blood";
import { itemPrefab } from "./item";
import { showTitle } from "./ui";
import { WolfPerformance } from "@p3ntest/wolf-engine/src/Performance";
import { spawnCoin } from "./coins";
import { Upgrade, getUpgradeLevel, upgradeStat } from "./upgrades";
import { playSound, playZombieSound } from "./sound";
import { getDifficultyMultiplier } from "./main";

interface ZombieProps {
  size: number;
  health: number;
  speed: number;
  damage: number;
  color: string;
}

export const zombiePrefab = new Prefab<
  ZombieProps & {
    healthMultiplier: number;
  }
>("Zombie", (zombie, props) => {
  const { size = 1, health = 20, speed = 1, damage = 10, color = "0" } = props;
  zombie.addTag("zombie");

  const pixelSize = 60 * size;

  zombie.addComponents(
    new Transform2D(),
    new RigidBody2D(
      Bodies.circle(0, 0, (pixelSize / 2) * 0.8, {
        mass: 10 * size * size * size, // mass is proportional to size cubed (volume)
      })
    ),
    new HealthComponent(health * (props.healthMultiplier ?? 0)),
    new ReactRenderedComponent(
      () => (
        <div
          style={{
            width: pixelSize + "px",
            height: pixelSize + "px",
            backgroundImage:
              "url('https://opengameart.org/sites/default/files/export_move.gif')",
            backgroundSize: "cover",
            transform: "rotate(-90deg)",
            filter: `hue-rotate(${color})`,
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
      color,
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
    if (
      distance < 30 * this.props.size * 0.8 + 40 &&
      this.attackCoolDown <= 0
    ) {
      this.attackCoolDown = 1000;
      const wave = getWave(
        this.entity.scene.getSystem(ZombieSystem)!.currentWave
      );
      target
        .requireComponent(HealthComponent)
        .damage(this.props.damage * wave.damageMultiplier);
      if (target.hasTag("dog")) {
        playSound("Bark");
      } else {
        playSound("Hurt");
      }
      playSound("Impact");
    }

    // Play sound at random intervals
    if (Math.random() * props.deltaTime < 0.01) {
      this.makeSound();
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
    playSound("ZombieDeath");
    playSound("Splat");

    bloodSplatPrefab.instantiate(this.entity.scene, {
      x: this.entity.requireComponent(Transform2D).getGlobalPosition().x,
      y: this.entity.requireComponent(Transform2D).getGlobalPosition().y,
      size: 100 * this.props.size,
    });

    if (Math.random() < 0.1 * getDifficultyMultiplier(-1))
      itemPrefab.instantiate(this.entity.scene, {
        x: this.entity.requireComponent(Transform2D).getGlobalPosition().x,
        y: this.entity.requireComponent(Transform2D).getGlobalPosition().y,
        type: "healthPack",
      });

    const coinUpgradeLevel = getUpgradeLevel(
      this.entity.scene,
      "coinMultiplier"
    );
    let coinAmount = Math.round(
      Math.pow(this.props.size, 2) *
        (1 + Math.random() * (1 + coinUpgradeLevel * 2))
    );

    const maxCoins = 4;
    let coinValue = 1;
    if (coinAmount > maxCoins) {
      coinValue = coinAmount / maxCoins;
      coinAmount = maxCoins;
    }

    for (let i = 0; i < coinAmount; i++) {
      spawnCoin(
        this.entity.scene,
        this.entity.requireComponent(Transform2D).getGlobalPosition(),
        coinValue
      );
    }

    if (this.isLastOfWave()) {
      itemPrefab.instantiate(this.entity.scene, {
        x: this.entity.requireComponent(Transform2D).getGlobalPosition().x,
        y: this.entity.requireComponent(Transform2D).getGlobalPosition().y,
        type: "dogTreat",
      });
    }
    const controller = this.entity.scene.getSystem(ZombieSystem)!;

    const dogExists = this.entity.scene.getEntityByTag("dog")!!;

    const scoreGained = Math.round(
      this.props.size *
        (1 + controller.currentWave * 0.2) *
        getDifficultyMultiplier(1.1) *
        (dogExists ? 1 : 0.5) *
        100
    );

    controller.currentScore += scoreGained;

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

  makeSound() {
    if (this.props.size > 2) {
      playSound("ZombieBig");
    } else {
      playZombieSound();
    }
  }

  onAttach(): void {
    this.makeSound();
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

  currentScore: number = 0;

  waveRunning: boolean = false;
  waveCountdown: number = 5000;

  onUpdate(props: SystemUpdateProps): void {
    // Performance debug
    if (Input.getKeyDown("i")) {
      this.currentWave = 20;
      for (let i = 0; i < 20; i++) {
        upgradeStat(this.scene, "coinMultiplier");
        upgradeStat(this.scene, "maxPlayerHealth");
        upgradeStat(this.scene, "bulletDamage");
        upgradeStat(this.scene, "fireRate");
        upgradeStat(this.scene, "bulletPiercing");
      }
    }

    WolfPerformance.start("zombie-system");
    if (!this.waveRunning) {
      this.waveCountdown -= props.deltaTime;

      if (this.waveCountdown <= 0) {
        this.waveRunning = true;
        this.currentWave += 1;
        this.currentWaveSpawned = 0;
        console.log("Wave", this.currentWave);
        showTitle(this.scene, `Wave ${this.currentWave}`);
        playSound("WaveStart");
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
        playSound("Positive");
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

    const healthMultiplier = wave.healthMultiplier;

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
    color: "0",
  },
  giant: {
    size: 4,
    health: 150,
    speed: 0.4,
    damage: 20,
    color: "0",
  },
  boss: {
    size: 8,
    health: 500,
    speed: 0.15,
    damage: 50,
    color: "0",
  },
  mutant: {
    size: 2,
    health: 40,
    speed: 0.75,
    damage: 13,
    color: "70deg",
  },
  fast: {
    size: 0.7,
    health: 10,
    speed: 2,
    damage: 4,
    color: "190deg",
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
  const maxZombies = Math.floor(
    10 + Math.pow(wave, 1.2) * (3 * getDifficultyMultiplier(1))
  );
  const zombieWeights = {
    normal: 3 + wave * 0.2,
    giant: 0.2 * wave,
    fast: 0.1 * wave,
    mutant: 0.2 * wave,
    boss: 0.01 * Math.pow(wave, 1.7),
  };

  // const timeInWave = maxZombies * 2000;
  const zombieSpawnInterval = 1000 * getDifficultyMultiplier(-2);

  const damageMultiplier =
    getDifficultyMultiplier(0.7) + Math.pow(wave, 1.1) * 0.1;

  const healthMultiplier =
    getDifficultyMultiplier(0.7) + Math.pow(wave, 1.4) * 0.3;

  return {
    maxZombies,
    zombieWeights,
    zombieSpawnInterval,
    damageMultiplier,
    healthMultiplier,
  };
}

type Wave = {
  maxZombies: number;
  zombieWeights: { [key: keyof typeof zombieTypes]: number };
  zombieSpawnInterval: number;
  damageMultiplier: number;
  healthMultiplier: number;
};
