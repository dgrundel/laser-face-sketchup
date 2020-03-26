import * as React from "react";
import {Face2d} from "../interfaces";
import {FacePanelItem} from "./FacePanelItem";
import {IUnitHelper} from "../sketchup";

export interface ThumbnailsProps {
    faces: Array<Face2d>;
    unitHelper: IUnitHelper;
}

export interface ThumbnailsState {
}

export class FacesPanel extends React.Component<ThumbnailsProps, ThumbnailsState> {
    render() {
        return <div id="faces">
            {this.props.faces.map(f => <FacePanelItem face={f} unitHelper={this.props.unitHelper}/>)}
        </div>;
    }
}