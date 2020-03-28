import * as React from "react";
import {getWidthHeight} from "../geometry";
import {Face2d} from "../interfaces";
import {lineLength, xyToGLine} from "../lib/geometric";
import {IUnitHelper} from "../lib/sketchup";
import {RenderedFace} from "./RenderedFace";

export interface FaceProps {
    face: Face2d;
    unitHelper: IUnitHelper;
}

export class FacePanelItem extends React.Component<FaceProps, {}> {

    render() {
        const face = this.props.face;
        const widthHeight = getWidthHeight(face.outerLoop);
        const width = this.lengthToStr(widthHeight[0]);
        const height = this.lengthToStr(widthHeight[1]);
        // const longestSide = .map()

        const longestSide = this.lengthToStr(face.outerLoop.map((p, i, all) => {
            const next = i === all.length - 1 ? all[0] : all[i + 1];
            return lineLength(xyToGLine(p, next));
        }).reduce((max, n) => Math.max(max, n), 0));

        return <div className={'face-panel-item'}>
            <RenderedFace face={face} className={'thumbnail'}/>
            <table>
                <tbody>
                    <tr>
                        <th>Width</th>
                        <td>{width}</td>
                    </tr>
                    <tr>
                        <th>Height</th>
                        <td>{height}</td>
                    </tr>
                    <tr>
                        <th>Longest Side</th>
                        <td>{longestSide}</td>
                    </tr>
                </tbody>
            </table>
        </div>;
    }

    private lengthToStr(widthHeight: number) {
        const unitHelper = this.props.unitHelper;
        return unitHelper.fromInches(widthHeight).toFixed(3) + unitHelper.name;
    }
}