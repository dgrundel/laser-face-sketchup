// @ts-ignore
import {throttle} from 'throttle-debounce';
import {Face, UserPrefs} from "../interfaces";

const SAVE_USER_PREFS_THROTTLE = 500;
const UNIT_NAMES = ['in', 'ft', 'mm', 'cm', 'm', 'yd'];

// convert from inches, which Sketchup uses internally
const CONVERT_FROM_INCHES: Array<(n: number) => number> = [
    n => n, // 'in'
    n => n/12.0, // 'ft',
    n => n*25.4, // 'mm',
    n => n*2.54, // 'cm',
    n => n*0.0254, // 'm',
    n => n/36.0 // 'yd'
];

const CONVERT_TO_INCHES: Array<(n: number) => number> = [
    n => n, // 'in'
    n => n*12.0, // 'ft',
    n => n/25.4, // 'mm',
    n => n/2.54, // 'cm',
    n => n/0.0254, // 'm',
    n => n*36.0 // 'yd'
];

export function getUnitHelper(i: number): UnitHelper {
    return new UnitHelper(
        UNIT_NAMES[i],
        CONVERT_FROM_INCHES[i],
        CONVERT_TO_INCHES[i]
    );
}

export class UnitHelper {
    name: string;
    from_in: (n: number) => number;
    to_in: (n: number) => number;

    constructor(name: string, from_in: (n: number) => number, to_in: (n: number) => number) {
        this.name = name;
        this.from_in = from_in;
        this.to_in = to_in;
    }

    fromInches(n: number) {
        return this.from_in(n);
    }

    toUnitStr(n: number, fractionDigits = 3) {
        return n.toFixed(fractionDigits) + this.name;
    }

    toInches(n: number) {
        return this.to_in(n);
    }
}

interface SketchupRubyAPI {
    getData: () => void;
    getExportPath: () => void;
    getUserPrefs: () => void;
    saveUserPrefs: (jsonStr: string) => void;
    writeFile: (path: string, contents: string, overwrite: boolean) => void;
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

        this.saveUserPrefs = throttle(
            SAVE_USER_PREFS_THROTTLE, false, this.saveUserPrefs.bind(this)
        ) as (userPrefs: UserPrefs) => void;
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

    saveUserPrefs(userPrefs: UserPrefs): void {
        const jsonStr = JSON.stringify(userPrefs, null, 4);
        setTimeout(() => this.sketchup.saveUserPrefs(jsonStr), 0);
    }

    writeFile(path: string, contents: string, overwrite = false) {
        setTimeout(() => this.sketchup.writeFile(path, contents, overwrite), 0);
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