import {getWidthHeight} from "./geometry";
import {Face2d} from "./interfaces";
import {UnitHelper} from "./lib/sketchup";

const XML_SERIALIZER = new XMLSerializer();
const DOC_IMPL = document.implementation;
const SVG_DOCTYPE = DOC_IMPL.createDocumentType(
    'svg',
    '-//W3C//DTD SVG 1.1//EN',
    'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
);

const XML_HEADER = `<?xml version="1.0" standalone="no"?>`;

const SVG_NS = "http://www.w3.org/2000/svg";

function setAttributes(element: Element, attrs: Record<string, any>) {
    Object.keys(attrs).forEach(attrName => {
        element.setAttribute(attrName, attrs[attrName]);
    });
}

export function faceToSvg (face: Face2d, unitHelper: UnitHelper): string {
    const fractionDigits = 5;
    const toS = (n: number) => n.toFixed(fractionDigits);
    const toUnitStr = (n: any) => unitHelper.toUnitStr(unitHelper.fromInches(n), fractionDigits);

    // stroke paths 0.1mm
    const strokeWidth = toS(unitHelper.toInches(0.1));
    const strokeColor = '#ff0000';

    const outerLoop = face.outerLoop;
    const otherLoops = face.otherLoops;

    const widthHeight = getWidthHeight(outerLoop);

    // width == origin to bottom right corner
    const width = toS(widthHeight[0]);
    const widthStr = toUnitStr(widthHeight[0]);
    // height == origin to top left corner
    const height = toS(widthHeight[1]);
    const heightStr = toUnitStr(widthHeight[1]);

    const doc = DOC_IMPL.createDocument(null, null, SVG_DOCTYPE);
    const svg = doc.createElementNS(SVG_NS, 'svg');
    setAttributes(svg, {
        'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
        'xmlns:inkscape': 'http://www.inkscape.org/namespaces/inkscape',
        'version': '1.1',
        'width': widthStr,
        'height': heightStr,
        'viewBox': [
            0, // min-x
            0, // min-y
            width,
            height
        ].join(' ')
    });

    doc.appendChild(svg);

    const namedView = doc.createElement('sodipodi:namedview');
    namedView.setAttribute('inkscape:document-units', 'mm');
    svg.appendChild(namedView);

    [outerLoop].concat(otherLoops).forEach(loop => {
        const path = doc.createElementNS(SVG_NS, 'path');
        setAttributes(path, {
            'd': loop.map((point, i) => {
                const x = toS(point.x);
                const y = toS(point.y);
                if (i === 0) {
                    return `M${x},${y}`;
                }
                return `L${x},${y}`;
            }).join(' ') + ' Z',
            'stroke': strokeColor,
            'stroke-width': strokeWidth,
            'fill': 'none'
        });
        svg.appendChild(path);
    });

    const xmlString = XML_SERIALIZER.serializeToString(doc);

    return `${XML_HEADER}\n${xmlString}`;
}