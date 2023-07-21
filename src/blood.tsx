import {
  Component,
  ComponentUpdateProps,
  Prefab,
  ReactRenderedComponent,
  Transform2D,
  Vector2,
} from "@p3ntest/wolf-engine";

export const bloodSplatPrefab = new Prefab<{
  x: number;
  y: number;
  size?: number;
}>("BloodSplat", (blood, { x, y, size = 100 }) => {
  blood.addComponents(
    new Transform2D(),
    new ReactRenderedComponent(() => {
      const currentSize = blood.requireComponent(BloodSplatComponent).size;
      const opacity = blood.requireComponent(BloodSplatComponent).opacity;
      return (
        <div
          style={{
            width: size * currentSize + "px",
            height: size * currentSize + "px",
            opacity: opacity,
            backgroundImage:
              "url('https://www.freeiconspng.com/thumbs/blood-splatter-png/blood-splatter-png-image-0.png')",
            backgroundSize: "cover",
          }}
        />
      );
    }, 2),
    new BloodSplatComponent()
  );

  blood.requireComponent(Transform2D).setPosition(new Vector2(x, y));
  blood.requireComponent(Transform2D).setRotation(Math.random() * Math.PI * 2);
});

export class BloodSplatComponent extends Component {
  constructor() {
    super();
  }

  size: number = 0;
  opacity: number = 1;

  onUpdate({ deltaTime }: ComponentUpdateProps) {
    this.size = Math.min(this.size + deltaTime * 0.005, 1);
    this.opacity = Math.max(this.opacity - deltaTime * 0.00005, 0);
    if (this.opacity <= 0) {
      this.entity.destroy();
    }
  }
}
