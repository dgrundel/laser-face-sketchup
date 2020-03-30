export interface Face {
    normal: IVec3;
    outer_loop: Array<IVec3>;
    other_loops: Array<Array<IVec3>>;
}

export interface Face2d {
    outerLoop: Array<IPoint2d>;
    otherLoops: Array<Array<IPoint2d>>;
}

export interface IVec3 {
    x: number;
    y: number;
    z: number;

    dot: (that: IVec3) => number;
    equals: (that: IVec3, epsilon?: number) => boolean;
    normalize: () => IVec3;
    sub: (that: IVec3) => IVec3;
}

export interface IQuaternion {
    rotate: (that: IVec3) => IVec3;
}

export interface IPoint2d {
    x: number;
    y: number
}

export interface UserPrefs {
    lastExportPath?: string
    useMultiFile?: boolean
    overwriteFiles?: boolean
}