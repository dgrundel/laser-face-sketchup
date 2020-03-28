import {Face} from "../interfaces";

const unitNames = ['in', 'ft', 'mm', 'cm', 'm', 'yd'];

// convert from inches, which Sketchup uses internally
const unitConverters: Array<(n: number) => number> = [
    // 'in'
    n => n,
    // 'ft',
    n => n/12.0,
    // 'mm',
    n => n*25.4,
    // 'cm',
    n => n*2.54,
    // 'm',
    n => n*0.0254,
    // 'yd'
    n => n/36.0
];

export interface IUnitHelper {
    name: string,
    fromInches: (n: number) => number;
}

export function getUnitHelper(i: number): IUnitHelper {
    return {
        name: unitNames[i],
        fromInches: unitConverters[i]
    };
}

export interface ISketchup {
    getData: () => {};
}

export interface SketchupData {
    units: number;
    faces: Array<Face>;
}

export const Sketchup: ISketchup = ((_window: any) => _window.sketchup)(window);
