import * as React from "react";
import {Face2d} from "../interfaces";
import {FacePanelItem} from "./FacePanelItem";
import {IUnitHelper} from "../lib/sketchup";

export interface ThumbnailsProps {
    faces: Array<Face2d>;
    unitHelper: IUnitHelper;
}

export class FacesPanel extends React.Component<ThumbnailsProps, {}> {
    render() {
        return <div id="faces">
            {this.props.faces.map((f, i) => <FacePanelItem key={i} face={f} unitHelper={this.props.unitHelper}/>)}
        </div>;
    }
}