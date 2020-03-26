import * as React from "react";
import {Face2d} from "../interfaces";
import {FacePanelItem} from "./FacePanelItem";

export interface ThumbnailsProps {
    faces: Array<Face2d>;
}

export interface ThumbnailsState {
}

export class FacesPanel extends React.Component<ThumbnailsProps, ThumbnailsState> {
    render() {
        return <div id="faces">
            {this.props.faces.map(f => <FacePanelItem face={f}/>)}
        </div>;
    }
}