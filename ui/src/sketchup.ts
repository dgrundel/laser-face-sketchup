
export interface ISketchup {
    getJson: () => {};
}

export const Sketchup: ISketchup = ((_window: any) => _window.sketchup)(window);
