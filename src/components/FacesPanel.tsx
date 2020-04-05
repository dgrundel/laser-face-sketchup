import * as React from "react";
import {Face2d} from "../interfaces";
import {UnitHelper} from "../lib/sketchup";
import {FacePanelItem} from "./FacePanelItem";

export interface ThumbnailsProps {
    faces: Array<Face2d>;
    removeFace: (i: number) => void;
    unitHelper: UnitHelper;
}

export class FacesPanel extends React.Component<ThumbnailsProps, {}> {
    render() {
        const removeFace = this.props.removeFace;

        return <div id="faces">
            {this.props.faces.map((f, i) =>
                <FacePanelItem key={i} face={f} removeFace={() => removeFace(i)} unitHelper={this.props.unitHelper}/>)}
        </div>;
    }
}