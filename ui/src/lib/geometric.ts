import {IPoint2d} from "../interfaces";

const geometric = require("geometric");

/**
 * This file contains TypeScript bindings for geometric.js
 *
 * ... along with a few converter function to transform data between
 * object-based points and array-based points.
 */

// Geometric.js uses the geometric primitives points, lines, and polygons.

// Points are represented as arrays of two numbers, such as [0, 0].
export type GPoint = [number, number];

// Lines are represented as arrays of two points, such as [[0, 0], [1, 0]].
// Because they have endpoints, these are technically line segments,
// but Geometric.js refers to them as lines for simplicity's sake.
export type GLine = [GPoint, GPoint];

// Polygons are represented as arrays of vertices, each of which is a
// point, such as [[0, 0], [1, 0], [1, 1], [0, 1]]. Polygons can be
// closed – the first and last vertex are the same – or open.
export type GPolygon = Array<GPoint>;

export type GDegrees = number;
export type GRadians = number;


export function xyToGPolygon(points: Array<IPoint2d>): GPolygon {
    return points.map(p => [p.x, p.y]);
}

export function xyFromGPolygon(geometricPolygon: GPolygon): Array<IPoint2d> {
    return geometricPolygon.map((p: Array<number>) => {
        return {x: p[0], y: p[1]};
    });
}

export function xyToGLine(a: IPoint2d, b: IPoint2d): GLine {
    return [
        [a.x, a.y],
        [b.x, b.y]
    ];
}

// Points

// Returns the coordinates resulting from rotating a point about an origin by an angle in degrees. If origin is not specified, the origin defaults to [0, 0].
export function pointRotate(point: GPoint, angle: GDegrees, origin?: GPoint): GPoint {
    return geometric.pointRotate(point, angle, origin);
}

// Returns the coordinates resulting from translating a point by an angle in degrees and a distance.
export function pointTranslate(point: GPoint, angle: GDegrees, distance: number): GPoint {
    return geometric.pointTranslate(point, angle, distance);
}

// Lines

// Returns the angle of a line, in degrees, with respect to the horizontal axis.
export function lineAngle(line: GLine): GDegrees {
    return geometric.lineAngle(line);
}

// Returns an interpolator function given a line [a, b].
// The returned interpolator function takes a single argument t,
// where t is a number ranging from 0 to 1; a value of 0 returns a,
// while a value of 1 returns b. Intermediate values interpolate
// from a to b along the line segment.
export function lineInterpolate(line: GLine): (t: number) => GPoint {
    return geometric.lineInterpolate(line);
}

// Returns the length of a line.
export function lineLength(line: GLine): number {
    return geometric.lineLength(line);
}

// Returns the midpoint of a line.
export function lineMidpoint(line: GLine): GPoint {
    return geometric.lineMidpoint(line);
}

// Polygons

// Returns the area of a polygon. You can pass a boolean indicating whether the returned area is signed, which defaults to false.
export function polygonArea(polygon: GPolygon, signed?:boolean): number {
    return geometric.polygonArea(polygon, signed);
}

// Returns the bounds of a polygon, ignoring points with invalid values (null, undefined, NaN, Infinity). The returned bounds are represented as an array of two points, where the first point is the top-left corner and the second point is the bottom-right corner. For example:
// const rectangle = [[0, 0], [0, 1], [1, 1], [1, 0]];
// const bounds = export function polygonBounds(rectangle); // [[0, 0], [1, 1]]
// Returns null if the polygon has fewer than three points.
export function polygonBounds(polygon: GPolygon): [GPoint, GPoint] {
    return geometric.polygonBounds(polygon);
}

// Returns the weighted centroid of a polygon. Not to be confused with a mean center.
export function polygonCentroid(polygon: GPolygon): GPoint {
    return geometric.polygonCentroid(polygon);
}

// Returns the convex hull, represented as a polygon, for an array of points. Returns null if the input array has fewer than three points. Uses Andrew’s monotone chain algorithm.
export function polygonHull(points: GPolygon): GPolygon {
    return geometric.polygonHull(points);
}

// Returns the length of a polygon's perimeter.
export function polygonLength(polygon: GPolygon): number {
    return geometric.polygonLength(polygon);
}

// Returns the arithmetic mean of the vertices of a polygon. Keeps duplicate vertices, resulting in different values for open and closed polygons. Not to be confused with a centroid.
export function polygonMean(polygon: GPolygon): GPoint {
    return geometric.polygonMean(polygon);
}

// Returns the vertices of a regular polygon of the specified number of sides, area, and center coordinates. If sides is not specified, deafults to 3. If area is not specified, defaults to 100. If center is not specified, defaults to [0, 0].
export function polygonRegular(sides?: number, area?: number, center?: GPoint): GPolygon {
    return geometric.polygonRegular(sides, area, center);
}

// Returns the vertices resulting from rotating a polygon about an origin by an angle in degrees. If origin is not specified, the origin defaults to [0, 0].
export function polygonRotate(polygon: GPolygon, angle: GDegrees, origin?: GPoint): GPolygon {
    return geometric.polygonRotate(polygon, angle, origin);
}

// Returns the vertices resulting from scaling a polygon by a scaleFactor (where 1 is the polygon's current size) from an origin point. If origin is not specified, the origin defaults to the polygon's centroid.
export function polygonScale(polygon: GPolygon, scaleFactor: number, origin?: GPoint): GPolygon {
    return geometric.polygonScale(polygon, scaleFactor, origin);
}

// Returns the vertices resulting from translating a polygon by an angle in degrees and a distance.
export function polygonTranslate(polygon: GPolygon, angle: GDegrees, distance: number): GPolygon {
    return geometric.polygonTranslate(polygon, angle, distance);
}

// Relationships

// Returns a boolean representing whether lineA intersects lineB.
export function lineIntersectsLine(lineA: GLine, lineB: GLine): boolean {
    return geometric.lineIntersectsLine(lineA, lineB);
}

// Returns a boolean representing whether a line intersects a polygon.
export function lineIntersectsPolygon(line: GLine, polygon: GPolygon): boolean {
    return geometric.lineIntersectsPolygon(line, polygon);
}

// Returns a boolean representing whether a point is inside of a polygon. Uses ray casting.
export function pointInPolygon(point: GPoint, polygon: GPolygon): boolean {
    return geometric.pointInPolygon(point, polygon);
}

// Returns a boolean representing whether a point is located on one of the edges of a polygon.
export function pointOnPolygon(point: GPoint, polygon: GPolygon): boolean {
    return geometric.pointOnPolygon(point, polygon);
}

// Returns a boolean representing whether a point is collinear with a line and is also located on the line segment. See also pointWithLine.
export function pointOnLine(point: GPoint, line: GLine): boolean {
    return geometric.pointOnLine(point, line);
}

// Returns a boolean representing whether a point is collinear with a line. See also pointOnLine.
export function pointWithLine(point: GPoint, line: GLine): boolean {
    return geometric.pointWithLine(point, line);
}

// Returns a boolean representing whether a point is to the left of a line.
export function pointLeftofLine(point: GPoint, line: GLine): boolean {
    return geometric.pointLeftofLine(point, line);
}

// Returns a boolean representing whether a point is to the right of a line.
export function pointRightofLine(point: GPoint, line: GLine): boolean {
    return geometric.pointRightofLine(point, line);
}

// Returns a boolean representing whether polygonA is contained by polygonB.
export function polygonInPolygon(polygonA: GPolygon, polygonB: GPolygon): boolean {
    return geometric.polygonInPolygon(polygonA, polygonB);
}

// Returns a boolean representing whether polygonA intersects but is not contained by polygonB.
export function polygonIntersectsPolygon(polygonA: GPolygon, polygonB: GPolygon): boolean {
    return geometric.polygonIntersectsPolygon(polygonA, polygonB);
}

// Angles

// Returns the angle of reflection given a starting angle, also known as the angle of incidence, and the angle of the surface off of which it is reflected.
export function angleReflect(incidence: GDegrees, surface: GDegrees): GDegrees {
    return geometric.angleReflect(incidence, surface);
}

// Returns the result of a converting an angle in radians to the same angle in degrees.
export function angleToDegrees(angle: GRadians): GDegrees {
    return geometric.angleToDegrees(angle);
}

// Returns the result of a converting an angle in degrees to the same angle in radians.
export function angleToRadians(angle: GDegrees): GRadians {
    return geometric.angleToRadians(angle);
}
