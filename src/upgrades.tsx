import {
  Component,
  Prefab,
  ReactUIComponent,
  Scene,
  System,
  Vector2,
} from "wolf-engine";
import { PlayerController } from "./player";

export const Upgrade = [
  {
    key: "fireRate",
    name: "Fire Rate",
    description: "Increases the speed at which you can shoot",
  },
  {
    key: "moveSpeed",
    name: "Max Health",
    description: "Increases your health",
  },
  {
    key: "doggyHealth",
    name: "Max Doggy Health",
    description: "Increases your doggy's health",
  },
  {
    key: "bulletPiercing",
    name: "Bullet Piercing",
    description: "Increases the piercing ability",
  },
  {
    key: "bulletDamage",
    name: "Bullet Damage",
    description: "Increases the damage of your bullets",
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

function getUpgradeCostAtLevel(currentLevel: number) {
  return Math.floor(10 * Math.pow(1.5, currentLevel));
}

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
            <div className="text-white flex flex-col items-stretch">
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
                  const cost = getUpgradeCostAtLevel(level);
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
