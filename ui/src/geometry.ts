import {IPoint2d} from "./interfaces";
import {
    GPoint,
    lineAngle,
    polygonBounds,
    polygonHull,
    polygonRotate,
    xyFromGPolygon,
    xyToGPolygon
} from "./lib/geometric";

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
 * @param points
 */
export const createOffsetter = (points: Array<IPoint2d>) => {
    const first = points[0];
    let minX = Infinity;
    let minY = Infinity;

    points.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
    });

    const xOffset = minX * -1;
    const yOffset = minY * -1;
    return (p: IPoint2d): IPoint2d => {
        return {
            x: p.x + xOffset,
            y: p.y + yOffset
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

export interface RotationResult {
    points: Array<IPoint2d>,
    degrees: number
    area: number,
}

function getAreaOfBounds(bounds: [GPoint, GPoint]) {
    const topLeft = bounds[0];
    const bottomRight = bounds[1];
    const xLength = bottomRight[0] - topLeft[0];
    const yLength = topLeft[1] - bottomRight[1];
    return Math.abs(xLength * yLength);
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
export function rotatePointsToSmallestBox(points: Array<IPoint2d>): RotationResult {
    const gPoints = xyToGPolygon(points);
    const hull = polygonHull(gPoints);

    return hull.map((p, i, all) => {
        // convert points in hull to angles relative to origin
        const next = i === (all.length - 1) ? all[0] : all[i + 1];
        const angle = lineAngle([p, next]);
        // invert the angle so that rotating the polygon by the
        // returned angle results in aligning the polygon to the axis
        return 360 - angle;
    }).reduce((result: RotationResult, degrees) => {
        // rotate the entire polygon by the angle and find the area
        const rotated = polygonRotate(gPoints, degrees);
        const area = getAreaOfBounds(polygonBounds(rotated));

        return area >= result.area ? result : {
            area,
            degrees,
            points: xyFromGPolygon(rotated)
        }
    }, {
        area: Infinity,
        degrees: 0,
        points: points
    });
}

export function rotatePolygon(points: Array<IPoint2d>, degrees: number): Array<IPoint2d> {
    return xyFromGPolygon(polygonRotate(xyToGPolygon(points), degrees));
}