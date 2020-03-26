import * as React from "react";
import {Face2d} from "../interfaces";

export interface RenderedFaceProps {
    className?: string;
    face: Face2d;
}

export interface RenderedFaceState {
}

export class RenderedFace extends React.Component<RenderedFaceProps, RenderedFaceState> {

    render() {
        const face = this.props.face;
        const outerLoop = face.outerLoop;
        const otherLoops = face.otherLoops;
        const widthHeight = outerLoop.reduce((max, p) => {
            return [
                Math.max(max[0], p.x),
                Math.max(max[1], p.y)
            ];
        }, [0, 0]);

        const viewBoxStr = '0 0 ' + widthHeight.join(' ');

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

        return <div className={this.props.className}>
            <svg viewBox={viewBoxStr}>
                {[outerLoop].concat(otherLoops).map(loop => {
                    const pointStr = loop.map(p => [p.x, p.y].join(',')).join(' ');
                    return <polygon points={pointStr} vectorEffect={'non-scaling-stroke'}/>;
                })}
            </svg>
        </div>;
    }
}