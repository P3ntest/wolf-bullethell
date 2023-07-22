import {
  Component,
  Prefab,
  ReactUIComponent,
  Scene,
  System,
  Vector2,
} from "@p3ntest/wolf-engine";
import { PlayerController } from "./player";
import { gameDifficulty, getDifficultyMultiplier } from "./main";

export const Upgrade = [
  {
    key: "fireRate",
    name: "Fire Rate",
    description: "Increases the speed at which you can shoot",
    costMultiplier: 1.5,
  },
  {
    key: "maxPlayerHealth",
    name: "Max Health",
    description: "Increases your health",
    costMultiplier: 0,
  },
  {
    key: "doggyHealth",
    name: "Max Doggy Health",
    description: "Increases your doggy's health",
    costMultiplier: 0.8,
    selfMultiplier: 0,
  },
  {
    key: "bulletPiercing",
    name: "Bullet Piercing",
    description:
      "Increases the ability for your bullets to go through multiple enemies",
    costMultiplier: 2,
    selfMultiplier: 1.8,
  },
  {
    key: "bulletDamage",
    name: "Bullet Damage",
    description: "Increases the damage of your bullets",
    costMultiplier: 1.1,
  },
  {
    key: "friendlyFire",
    name: "Lesser Friendly Fire",
    description: "Reduces the damage your dog takes from your own bullets",
    costMultiplier: 0.6,
  },
  {
    key: "coinMultiplier",
    name: "Coin Multiplier",
    description: "Increases the amount of coins you get from killing enemies",
    costMultiplier: 1,
    selfMultiplier: 2,
  },
  {
    key: "burst",
    name: "Burst Shots",
    description: "Shoot multiple shots at once",
    costMultiplier: 4,
    selfMultiplier: 3,
  },
];

export const upgradeSystemPrefab = new Prefab(
  "UpgradeSystem",
  (upgradeSystem, props) => {
    upgradeSystem.addTag("upgradeSystem");

    upgradeSystem.addComponent(new UpgradeSystem());
  }
);

export function upgradeStat(
  scene: Scene,
  upgrade: keyof typeof Upgrade | string
) {
  const upgradeSystem = scene.getEntityByTag("upgradeSystem")!;
  upgradeSystem
    .requireComponent(UpgradeSystem)
    .upgrade(upgrade as keyof typeof Upgrade);
}

export function getUpgradeLevel(
  scene: Scene,
  upgrade: keyof typeof Upgrade | string
) {
  const upgradeSystem = scene.getEntityByTag("upgradeSystem")!;
  return upgradeSystem
    .requireComponent(UpgradeSystem)
    .getUpgradeLevel(upgrade as keyof typeof Upgrade);
}

function getUpgradeCostAtLevel(scene: Scene, upgrade: keyof typeof Upgrade) {
  const currentLevel = getUpgradeLevel(scene, upgrade);
  const totalUpgrades = Object.values(
    scene.getEntityByTag("upgradeSystem")!.requireComponent(UpgradeSystem)
      .upgradeLevels
  ).reduce((a, b) => a + b, 0);

  const upgradeData = Upgrade.find((u) => u.key === upgrade)!;

  let selfMultiplier = upgradeData.selfMultiplier ?? 1;

  // Starts at 10. Increases by totalUpgrades and currentLevel. It should not go linear.
  return Math.floor(
    (10 +
      totalUpgrades * 2 * getDifficultyMultiplier(1) +
      currentLevel * 5 * selfMultiplier) *
      upgradeData.costMultiplier *
      getDifficultyMultiplier(0.5)
  );
}

export let mouseOnUi = false;
export class UpgradeSystem extends Component {
  upgradeLevels: Record<string, number> = {
    // fireRate: 10,
    // moveSpeed: 0,
    // doggyHealth: 0,
    // bulletPiercing: 100,
    // bulletDamage: 100,
  };

  getUpgradeLevel(upgrade: keyof typeof Upgrade): number {
    return this.upgradeLevels[upgrade as string] || 0;
  }

  upgrade(upgrade: keyof typeof Upgrade): void {
    this.upgradeLevels[upgrade as string] =
      (this.upgradeLevels[upgrade as string] || 0) + 1;
  }

  onAttach(): void {
    const ui = this.entity.createEntity();

    ui.addComponent(
      new ReactUIComponent(
        () => {
          const coins = this.entity.scene
            .getEntityByTag("player")!
            .requireComponent(PlayerController).coins;

          return (
            <div
              className="text-white flex flex-col items-stretch"
              onMouseEnter={() => {
                mouseOnUi = true;
                console.log("mouse on ui");
              }}
              onMouseLeave={() => {
                mouseOnUi = false;
                console.log("mouse off ui");
              }}
            >
              <h1 className="font-xl flex flex-row justify-between items-center p-4 bg-gray-400">
                <span className="text-xl uppercase font-bold">Upgrades</span>
                <span className="flex flex-row gap-2 items-center font-bold">
                  {coins}
                  <CoinIcon />
                </span>
              </h1>
              <div className="flex flex-col">
                {Upgrade.map((upgrade) => {
                  const level = getUpgradeLevel(this.entity.scene, upgrade.key);
                  const cost = getUpgradeCostAtLevel(
                    this.entity.scene,
                    upgrade.key as keyof typeof Upgrade
                  );
                  return (
                    <button
                      key={upgrade.key}
                      className="p-2 bg-gray-500 hover:bg-gray-900 transition-all flex flex-row justify-between gap-5"
                      onClick={() => {
                        if (coins < cost) return;
                        this.entity.scene
                          .getEntityByTag("player")!
                          .requireComponent(PlayerController).coins -= cost;
                        upgradeStat(this.entity.scene, upgrade.key);
                      }}
                    >
                      <span
                        className={`w-10 flex flex-row items-center gap-2 font-bold ${
                          coins < cost ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {cost}
                        <CoinIcon />
                      </span>
                      <span>{upgrade.name} </span>
                      <span>{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        },
        {
          position: {
            anchor: "center-right",
          },
        }
      )
    );
  }
}

function CoinIcon() {
  return (
    <img
      className="w-5 h-5"
      src="https://static.vecteezy.com/system/resources/previews/019/046/339/original/gold-coin-money-symbol-icon-png.png"
      alt=""
    />
  );
}
