import * as React from "react";
import {Face2d} from "../interfaces";
import {RenderedFace} from "./RenderedFace";

export interface FaceProps {
    face: Face2d;
}

export interface FaceState {
}

export class FacePanelItem extends React.Component<FaceProps, FaceState> {

    render() {
        return <div className={'face-panel-item'}>
            <RenderedFace face={this.props.face} className={'thumbnail'}/>
        </div>;
    }
}