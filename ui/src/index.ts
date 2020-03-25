const alfador = require('alfador');
const Vec3 = alfador.Vec3;
const Quaternion = alfador.Quaternion;

import './css/style.scss';

import { Point3d, Vector3d } from "./points";
import {Face, IVec3, IQuaternion, IPoint2d, Sketchup} from "./interfaces";

const Z_NORMAL = new Vec3(0, 0, -1);

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
const getDistance = (a: IPoint2d, b: IPoint2d) => {
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

function createPolygon(loop: IPoint2d[], svg: HTMLElement) {
    const pointStr = loop.map(p => [p.x, p.y].join(',')).join(' ');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', pointStr);
    polygon.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(polygon);

    // add text labels with dimensions
    // loop.forEach((p, i, all) => {
    //     const next = i === all.length - 1 ? all[0] : all[i + 1];
    //     const mid = getMidPoint(p, next);
    //     const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //     text.setAttribute('x', mid.x.toString());
    //     text.setAttribute('y', mid.y.toString());
    //     text.textContent = getDistance(p, next).toFixed(3);
    //     svg.appendChild(text);
    // });
}


/**
 * https://svgpocketguide.com/book/
 * https://stackoverflow.com/questions/1034712/creating-svg-graphics-using-javascript
 *
 * <svg>
 *    <polygon points="50,5 100,5 125,30 125,80 100,105 50,105 25,80 25,30" fill="#ED6E46" />
 * </svg>
 *
 * @param outerLoop
 * @param otherLoops
 */
const makeSvg = (outerLoop: Array<IPoint2d>, otherLoops: Array<Array<IPoint2d>>) => {
    const widthHeight = outerLoop.reduce((max, p) => {
        return [
            Math.max(max[0], p.x),
            Math.max(max[1], p.y)
        ];
    }, [0, 0]);

    const viewBoxStr = '0 0 ' + widthHeight.join(' ');
    const svg = document.createElement('svg');
    svg.setAttribute('viewBox', viewBoxStr);

    // create polygon element

    createPolygon(outerLoop, svg);

    otherLoops.forEach(loop => createPolygon(loop, svg));

    const div = document.createElement('div');
    div.innerHTML = svg.outerHTML;
    div.className = 'thumbnail';

    div.addEventListener('click', (e) => {
        const preview = document.getElementById('preview');
        preview.innerHTML = '';

        preview.appendChild(div.firstChild.cloneNode(true));

    }, false);

    return div;
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
}

const createOffsetter = (outerLoop: Array<IVec3>) => {
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
}

// const shiftToOrigin = (vertices: Array<IVec3>) => {
//     const verts = vertices.slice();
//     let minX = 0;
//     let minY = 0;
//     let i = verts.length;
//     while(i--) {
//         const v = verts[i] = verts[i].sub(verts[0]);
//         v.z = 0;

//         minX = Math.min(minX, v.x);
//         minY = Math.min(minY, v.y);
//     }

//     const shiftX = minX * -1;
//     const shiftY = minY * -1;
//     i = verts.length;
//     while(i--) {
//         const v = verts[i];
//         v.x += shiftX;
//         v.y += shiftY;
//     }

//     return verts;
// }

// const face: Face = {
//     normal: Vector3d(0.0366194, -0.251705, 0.967111),
//     vertices: [Point3d(5.46162, -2.06455, 55.382), Point3d(-1.14275, 0, 56.1694), Point3d(-1.99656, -3.14961, 55.382)]
// };

const thumbs = document.getElementById('thumbs');

// faces.forEach(f => {
//     const rotation: IQuaternion = Quaternion.rotationFromTo(f.normal, Z_NORMAL);
//     const outerLoop = f.outer_loop.map(v => rotation.rotate(v));
//
//     const offsetter = createOffsetter(outerLoop);
//
//     const outerLoop2d = outerLoop.map(offsetter);
//     const otherLoops = f.other_loops.map(loop => loop.map(v => rotation.rotate(v)).map(offsetter));
//
//     const elem  = makeSvg(outerLoop2d, otherLoops);
//     thumbs.appendChild(elem);
// });

const w:any = window;
const sketchup: Sketchup = w.sketchup;

// setTimeout(sketchup.getJson, 1500);
sketchup.getJson();

w.LaserFace = {
    setJson: (faces: Array<Face>) => {
        faces.forEach(f => {
            const rotation: IQuaternion = Quaternion.rotationFromTo(f.normal, Z_NORMAL);
            const outerLoop = f.outer_loop.map(v => rotation.rotate(v));

            const offsetter = createOffsetter(outerLoop);

            const outerLoop2d = outerLoop.map(offsetter);
            const otherLoops = f.other_loops.map(loop => loop.map(v => rotation.rotate(v)).map(offsetter));

            const elem  = makeSvg(outerLoop2d, otherLoops);
            thumbs.appendChild(elem);
        });

        document.getElementById('spinner-overlay').classList.add('hide');
    }
};