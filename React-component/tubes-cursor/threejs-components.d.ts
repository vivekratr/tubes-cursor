declare module "threejs-components/build/cursors/tubes1.min.js" {
  type TubesHandle = {
    setColors: (colors: readonly string[]) => void;
    setLightsColors: (colors: readonly string[]) => void;
    setLightsIntensity: (intensity: number) => void;
  };

  export type TubesApp = {
    three: {
      renderer: {
        setClearColor: (hex: number, alpha: number) => void;
      };
    };
    tubes: TubesHandle;
    dispose: () => void;
  };

  export default function createTubesCursor(
    canvas: HTMLCanvasElement,
    options: {
      tubes: {
        colors: readonly string[];
        lights: { intensity: number; colors: readonly string[] };
      };
      bloom?: { threshold: number; strength: number; radius: number };
    },
  ): TubesApp;
}
