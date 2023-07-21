import {
  Component,
  ComponentUpdateProps,
  Entity,
  ReactRenderedComponent,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";

export class HealthComponent extends Component {
  health: number;
  maxHealth: number;

  constructor(maxHealth: number) {
    super();
    this.health = maxHealth;
    this.maxHealth = maxHealth;
  }

  damage(amount: number): void {
    this.health -= amount;
  }

  heal(amount?: number): void {
    amount = amount ?? this.maxHealth;
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  onUpdate(): void {
    this.updateHealthBarPos();
  }

  onDestroy(): void {
    this.healthBar?.destroy();
  }

  healthBar: Entity | null = null;

  updateHealthBarPos(): void {
    if (this.healthBar) {
      this.healthBar
        .requireComponent(Transform2D)
        .setPosition(
          this.entity
            .requireComponent(Transform2D)
            .getGlobalPosition()
            .add(new Vector2(0, 50))
        );
    }
  }

  getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }

  onAttach(): void {
    this.healthBar = this.entity.scene.createEntity();
    this.healthBar.addComponents(
      new Transform2D(),
      new ReactRenderedComponent(() => {
        const health = this.getHealthPercentage();
        return (
          <div
            style={{
              width: "100px",
              height: "10px",
              backgroundColor: "red",
            }}
          >
            <div
              style={{
                width: `${health * 100}%`,
                height: "100%",
                backgroundColor: "green",
              }}
            />
          </div>
        );
      }, 1000)
    );

    this.updateHealthBarPos();
  }
}
