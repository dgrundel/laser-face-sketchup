import * as React from "react";
import {Face2d} from "../interfaces";
import {UnitHelper} from "../lib/sketchup";
import {FacePanelItem} from "./FacePanelItem";

export interface ThumbnailsProps {
    faces: Array<Face2d>;
    unitHelper: UnitHelper;
}

export class FacesPanel extends React.Component<ThumbnailsProps, {}> {
    render() {
        return <div id="faces">
            {this.props.faces.map((f, i) => <FacePanelItem key={i} face={f} unitHelper={this.props.unitHelper}/>)}
        </div>;
    }
}