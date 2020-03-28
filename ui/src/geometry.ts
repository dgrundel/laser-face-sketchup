import {IPoint2d, IVec3} from "./interfaces";

const Alfador = require("alfador");
const Vec3 = Alfador.Vec3;

export const Z_NORMAL = new Vec3(0, 0, -1);

/**
 * Given an _outer loop_ (an array of points that
 * describe the outer boundaries of a face) this
 * determines how to shift the points in the loop
 * such that all points have positive X and
 * Y coordinate values.
 *
 * This function returns a function that can be
 * applied to all points on the face to shift them
 * into the positive XY space.
 *
 * The loop should already be rotated normal to
 * the Z axis, as points will have their Z-axes dropped
 * by the offsetter function.
 *
 * @param outerLoop
 */
export const createOffsetter = (outerLoop: Array<IVec3>) => {
    const first = new Vec3(outerLoop[0]);
    let minX = 0;
    let minY = 0;

    outerLoop.forEach(vec => {
        const v = vec.sub(first);
        minX = Math.min(minX, v.x);
        minY = Math.min(minY, v.y);
    });

    const xOffset = minX * -1;
    const yOffset = minY * -1;
    return (vec: IVec3): IPoint2d => {
        const v = vec.sub(first);

        return {
            x: v.x + xOffset,
            y: v.y + yOffset
        };
    };
};

export function getWidthHeight(outerLoop: Array<IPoint2d>) {
    return outerLoop.reduce((max, p) => {
        return [
            Math.max(max[0], p.x),
            Math.max(max[1], p.y)
        ];
    }, [0, 0]);
}

/**
 * Logic from:
 * https://stackoverflow.com/questions/19729831/angle-between-3-points-in-3d-space
 *
 * @param prev - first
 * @param curr - middle
 * @param next - last
 */
const computeAngleBetweenPoints = (prev: IVec3, curr: IVec3, next: IVec3): number => {

    // In pseudo-code, the vector BA (call it v1) is:
    // v1 = {A.x - B.x, A.y - B.y, A.z - B.z}

    // Similarly the vector BC (call it v2) is:
    // v2 = {C.x - B.x, C.y - B.y, C.z - B.z}

    const v1 = prev.sub(curr);
    const v2 = next.sub(curr);

    // The dot product of v1 and v2 is a function of the cosine of the angle between them (it's scaled by the product of their magnitudes). So first normalize v1 and v2:
    // v1mag = sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z)
    // v1norm = {v1.x / v1mag, v1.y / v1mag, v1.z / v1mag}

    // v2mag = sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z)
    // v2norm = {v2.x / v2mag, v2.y / v2mag, v2.z / v2mag}

    const v1norm = v1.normalize();
    const v2norm = v2.normalize();

    // Then calculate the dot product:
    // res = v1norm.x * v2norm.x + v1norm.y * v2norm.y + v1norm.z * v2norm.z

    const res = v1norm.dot(v2norm);

    // And finally, recover the angle:
    // angle = acos(res)

    const angleInRadians = Math.acos(res);
    const angleInDegrees = angleInRadians / Math.PI * 180.0;

    return angleInDegrees;
};

/**
 * Calculate distance between two points on a 2d plane
 * using pythagorean theorem.
 *
 * @param a a point
 * @param b another point
 */
export const getDistance = (a: IPoint2d, b: IPoint2d) => {
    const aSq = Math.pow(Math.abs(a.x - b.x), 2);
    const bSq = Math.pow(Math.abs(a.y - b.y), 2);
    const cSq = aSq + bSq;
    return Math.sqrt(cSq);
};

const getMidPoint = (a: IPoint2d, b: IPoint2d): IPoint2d => {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    };
};

const calcAndDisplayAngles = (polygon: Array<IVec3>) => {
    console.log(`polygon:`, polygon);

    let sum = 0;
    for (let i = 0, len = polygon.length, last = len - 1; i < polygon.length; i++) {
        const curr = polygon[i];
        const prev = i === 0 ? polygon[last] : polygon[i - 1];
        const next = i === last ? polygon[0] : polygon[i + 1];
        const angle = computeAngleBetweenPoints(prev, curr, next);
        console.log(`angle at point ${i}: ${angle}`);
        sum += angle;
    }
    console.log(`sum of angles: ${sum}`);
};

function pointsEqual(a: IPoint2d, b: IPoint2d) {
    return a.x === b.x && a.y === b.y;
}

function getOrientation(p1: IPoint2d, p2: IPoint2d, p: IPoint2d) {
    // // Determinant
    // int Orin = (p2.X - p1.X) * (p.Y - p1.Y) - (p.X - p1.X) * (p2.Y - p1.Y);
    // if (Orin > 0)
    //     return -1; //          (* Orientation is to the left-hand side  *)
    // if (Orin < 0)
    //     return 1; // (* Orientation is to the right-hand side *)
    // return 0; //  (* Orientation is neutral aka collinear  *)

    const orientation = (p2.x - p1.x) * (p.y - p1.y) - (p.x - p1.x) * (p2.y - p1.y);

    if (orientation === 0) {
        return 0;
    }
    return (orientation > 0) ? -1 : 1;
}

/**
 * Find convex hull for a set of points using
 * the gift wrapping algorithm.
 *
 * https://stackoverflow.com/questions/10020949/gift-wrapping-algorithm
 *
 * @param points
 */
export function convexHull(points: Array<IPoint2d>): Array<IPoint2d> {
    if (points.length < 3) {
        return points;
    }

    const hull: Array<IPoint2d> = [];

    // get leftmost point
    let pointOnHull: IPoint2d = points.reduce((left, p) => {
        return p.x < left.x ? p : left;
    }, points[0]);
    let endpoint: IPoint2d;

    do {
        hull.push(pointOnHull);
        endpoint = points[0];
        for (let i = 0, len = points.length; i < len; i++) {
            if (pointsEqual(pointOnHull, endpoint) || getOrientation(pointOnHull, endpoint, points[i]) === -1) {
                endpoint = points[i];
            }
        }
        pointOnHull = endpoint;
    } while (endpoint != hull[0]);

    return hull;
}

/**
 * Rotate a single point around the origin
 * See: https://en.wikipedia.org/wiki/Cartesian_coordinate_system#Rotation

 * @param point
 * @param radians
 */
function rotatePointDegrees(point: IPoint2d, radians: number): IPoint2d {
    const x = point.x;
    const y = point.y;
    return {
        x: (x * Math.cos(radians)) - y * Math.sin(radians),
        y: (x * Math.sin(radians)) + y * Math.cos(radians)
    };
}

/**
 * Rotate a set of points around the origin
 *
 * @param points
 * @param degrees
 */
export function rotatePolygonDegrees(points: Array<IPoint2d>, degrees: number): Array<IPoint2d> {
    const radians = degrees / 180 * Math.PI;
    return points.map(point => {
        return rotatePointDegrees(point, radians);
    });
}

/**
 * Use the rotating calipers algorithm to find the
 * rotation of the smallest bounding box.
 *
 * https://stackoverflow.com/questions/13765200/can-someone-explain-the-rotating-calipers-to-me
 * > You just go through each edge of the convex hull and
 * > rotate your points so that edge is along a major axis,
 * > let's say the X-axis.
 * > Then you find an axis-aligned bounding box of those points.
 * > Choose whichever bounding box is smallest.
 *
 * > An axis-aligned bounding box can be found by getting
 * > the minimum and maximum in each dimension.
 *
 * @param points
 */
function optimalBoxRotation(points: Array<IPoint2d>): number {
    const hull = convexHull(points);



    return 0;
}