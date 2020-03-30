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

export class SvgBuilder {
    unitHelper: UnitHelper;
    document: Document;
    svg: SVGElement;

    // used when calling number.toFixed
    fractionDigits = 8;

    strokeWidth: number = 0.1; // in document units
    strokeColor: string = '#ff0000';

    // width and height are in inches, which is Sketchup's native unit.
    // viewbox and coordinates are also inches.
    // only the `width` and `height` attributes need be converted to desired units.
    width = 0;
    height = 0;

    constructor(unitHelper: UnitHelper) {
        this.unitHelper = unitHelper;
        this.document = DOC_IMPL.createDocument(null, null, SVG_DOCTYPE);
        this.svg = this.document.createElementNS(SVG_NS, 'svg');
        setAttributes(this.svg, {
            'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
            'xmlns:inkscape': 'http://www.inkscape.org/namespaces/inkscape',
            'version': '1.1'
        });
        this.setDimensions(0, 0);

        const namedView = this.document.createElement('sodipodi:namedview');
        setAttributes(namedView, {
            'inkscape:document-units': this.unitHelper.name
        });
        this.svg.appendChild(namedView);

        this.document.appendChild(this.svg);
    }

    toUnitStr(n: number) {
        return this.unitHelper.toUnitStr(this.unitHelper.fromInches(n), this.fractionDigits);
    }

    setDimensions(width: number, height: number) {
        this.width = width;
        this.height = height;
        setAttributes(this.svg, {
            width: this.toUnitStr(width),
            height: this.toUnitStr(height),
            viewBox: [
                0, // min-x
                0, // min-y
                width.toFixed(this.fractionDigits),
                height.toFixed(this.fractionDigits)
            ].join(' ')
        });
    }

    addFace(face: Face2d) {
        const outerLoop = face.outerLoop;
        const otherLoops = face.otherLoops;

        // if this face is bigger than the current dimensions,
        // bump them up to match
        const widthHeight = getWidthHeight(outerLoop);
        const width = widthHeight[0];
        const height = widthHeight[1];
        if (width > this.width || height > this.height) {
            this.setDimensions(Math.max(width, this.width), Math.max(height, this.height));
        }

        // create a group to enclose this face
        const group = this.document.createElementNS(SVG_NS, 'g');

        [outerLoop].concat(otherLoops).forEach(loop => {
            const path = this.document.createElementNS(SVG_NS, 'path');
            setAttributes(path, {
                'd': loop.map((point, i) => {
                    const x = point.x.toFixed(this.fractionDigits);
                    const y = point.y.toFixed(this.fractionDigits);
                    if (i === 0) {
                        return `M${x},${y}`;
                    }
                    return `L${x},${y}`;
                }).join(' ') + ' Z',
                'stroke': this.strokeColor,
                'stroke-width': this.getStrokeWidth(),
                'fill': 'none'
            });
            group.appendChild(path);
        });

        this.svg.appendChild(group);
    }

    getStrokeWidth() {
        return this.unitHelper.toInches(this.strokeWidth).toFixed(this.fractionDigits);
    }

    toXml() {
        const xmlString = XML_SERIALIZER.serializeToString(this.document);
        return `${XML_HEADER}\n${xmlString}`;
    }
}
