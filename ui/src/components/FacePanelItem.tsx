import * as React from "react";
import {Face2d} from "../interfaces";
import {RenderedFace} from "./RenderedFace";
import {getWidthHeight} from "../geometry";
import {IUnitHelper} from "../sketchup";

export interface FaceProps {
    face: Face2d;
    unitHelper: IUnitHelper;
}

export interface FaceState {
}

export class FacePanelItem extends React.Component<FaceProps, FaceState> {

    render() {
        const face = this.props.face;
        const widthHeight = getWidthHeight(face.outerLoop);
        const width = this.lengthToStr(widthHeight[0]);
        const height = this.lengthToStr(widthHeight[1]);

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
                </tbody>
            </table>
        </div>;
    }

    private lengthToStr(widthHeight: number) {
        const unitHelper = this.props.unitHelper;
        return unitHelper.fromInches(widthHeight).toFixed(3) + unitHelper.name;
    }
}