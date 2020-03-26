import {Face} from "./interfaces";

export interface ISketchup {
    getData: () => {};
}

export interface SketchupData {
    units: number;
    faces: Array<Face>;
}

export const Sketchup: ISketchup = ((_window: any) => _window.sketchup)(window);
