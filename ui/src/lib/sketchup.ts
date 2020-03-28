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

interface SketchupRubyAPI {
    getData: () => {};
    getExportPath: () => {};
}

export interface ModelData {
    units: number;
    faces: Array<Face>;
}

type CallbackType = 'setData' | 'setExportPath';

class SketchupAPI {
    sketchup: SketchupRubyAPI;
    callbacks: Record<string, Array<Function>> = {};

    constructor(_window: any) {
        this.sketchup = _window.sketchup;
        _window.sketchupConnector = this;
    }

    getData() {
        setTimeout(this.sketchup.getData, 0);
    }

    setData(data: ModelData) {
        this.getCallbacks('setData').forEach(fn => fn(data));

    }

    onSetData(fn: (data: ModelData) => void) {
        this.addCallback('setData', fn);
    }

    getExportPath() {
        setTimeout(this.sketchup.getExportPath, 0);
    }

    setExportPath(path: string) {
        this.getCallbacks('setExportPath').forEach(fn => fn(path));
    }

    onSetExportPath(fn: (path: string) => void) {
        this.addCallback('setExportPath', fn);
    }

    private addCallback(type: CallbackType, fn: Function) {
        if (!this.callbacks.hasOwnProperty(type)) {
            this.callbacks[type] = [fn];
        } else {
            this.callbacks[type].push(fn);
        }
    }

    private getCallbacks(type: CallbackType) {
        return this.callbacks[type] || [];
    }
}

export const Sketchup = new SketchupAPI(window);