import {Face, UserPrefs} from "../interfaces";

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
    getUserPrefs: () => {};
    saveUserPrefs: (jsonStr: string) => {};
}

export interface ModelData {
    userPrefsJson: string;
    units: number;
    faces: Array<Face>;
}

type CallbackType = 'error' | 'receiveModelData' | 'receiveExportPath';

class SketchupAPI {
    sketchup: SketchupRubyAPI;
    callbacks: Record<string, Array<Function>> = {};

    constructor(_window: any) {
        this.sketchup = _window.sketchup;
        _window.sketchupConnector = this;
    }

    receiveError(message: string) {
        this.getCallbacks('error').forEach(fn => fn(message));
    }

    onError(fn: (message: string) => void) {
        this.addCallback('error', fn);
    }

    getModelData() {
        setTimeout(this.sketchup.getData, 0);
    }

    receiveModelData(data: ModelData) {
        this.getCallbacks('receiveModelData').forEach(fn => fn(data));
    }

    onReceiveModelData(fn: (data: ModelData) => void) {
        this.addCallback('receiveModelData', fn);
    }

    getExportPath() {
        setTimeout(this.sketchup.getExportPath, 0);
    }

    receiveExportPath(path: string) {
        this.getCallbacks('receiveExportPath').forEach(fn => fn(path));
    }

    onReceiveExportPath(fn: (path: string) => void) {
        this.addCallback('receiveExportPath', fn);
    }

    saveUserPrefs(userPrefs: UserPrefs) {
        const jsonStr = JSON.stringify(userPrefs, null, 4);
        setTimeout(() => this.sketchup.saveUserPrefs(jsonStr), 0);
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