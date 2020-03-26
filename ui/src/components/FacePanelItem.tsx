import * as React from "react";
import {Face2d} from "../interfaces";
import {RenderedFace} from "./RenderedFace";
import {getWidthHeight} from "../geometry";

export interface FaceProps {
    face: Face2d;
}

export interface FaceState {
}

export class FacePanelItem extends React.Component<FaceProps, FaceState> {

    render() {
        const face = this.props.face;
        const widthHeight = getWidthHeight(face.outerLoop);

        return <div className={'face-panel-item'}>
            <RenderedFace face={face} className={'thumbnail'}/>
            <table>
                <tbody>
                    <tr>
                        <th>Width</th>
                        <td>{widthHeight[0].toFixed(3)}</td>
                    </tr>
                    <tr>
                        <th>Height</th>
                        <td>{widthHeight[1].toFixed(3)}</td>
                    </tr>
                </tbody>
            </table>
        </div>;
    }
}