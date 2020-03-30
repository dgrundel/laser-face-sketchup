import * as React from "react";
import {createOffsetter, rotatePointsToSmallestBox, rotatePolygon, Z_NORMAL} from "../geometry";
import {Face, Face2d, IQuaternion, UserPrefs} from "../interfaces";
import {getUnitHelper, ModelData, Sketchup, UnitHelper} from "../lib/sketchup";
import {DialogClassName, DialogOverlay, DialogProps} from "./DialogOverlay";
import {FacesPanel} from "./FacesPanel";
import {OptionsPanel} from "./OptionsPanel";
import {SpinnerOverlay} from "./SpinnerOverlay";

const Alfador = require("alfador");
const Quaternion = Alfador.Quaternion;


export interface AppProps {
}

export interface AppState {
    loading: boolean;
    dialog?: DialogProps;

    userPrefs?: UserPrefs;
    unitHelper?: UnitHelper;
    faces?: Array<Face>;
    faces2d?: Array<Face2d>;
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            loading: true
        };

        this.dismissDialog = this.dismissDialog.bind(this);

        Sketchup.onReceiveModelData(this.receiveModelData.bind(this));
        Sketchup.onMessage(this.showMessage.bind(this));
    }

    componentDidMount() {
        Sketchup.getModelData();
    }

    receiveModelData(data: ModelData) {
        const userPrefs = JSON.parse(data.userPrefsJson) as UserPrefs;
        const unitHelper = getUnitHelper(data.units);
        const faces = data.faces;
        const faces2d: Array<Face2d> = faces.map(f => {
            const rotation: IQuaternion = Quaternion.rotationFromTo(f.normal, Z_NORMAL);
            const outerLoop3d = f.outer_loop.map(v => rotation.rotate(v));
            const otherLoops3d = f.other_loops.map(loop => loop.map(v => rotation.rotate(v)));

            const rotationResult = rotatePointsToSmallestBox(outerLoop3d);
            const offsetter = createOffsetter(rotationResult.points);

            const outerLoop = rotationResult.points.map(offsetter);
            const otherLoops = otherLoops3d.map(loop => rotatePolygon(loop, rotationResult.degrees).map(offsetter));

            return {
                outerLoop,
                otherLoops
            };
        });

        this.setState({
            loading: false,
            userPrefs,
            unitHelper,
            faces,
            faces2d
        });
    }

    updatePreferences(updater: (prefs: UserPrefs) => UserPrefs) {
        const newPrefs = updater(this.state.userPrefs);
        Sketchup.saveUserPrefs(newPrefs);
        this.setState({
            userPrefs: newPrefs
        });
    }

    dismissDialog() {
        this.setState({
            dialog: undefined
        });
    }

    showDialog(dialog: DialogProps) {
        this.setState({
            dialog: dialog
        });
    }

    showMessage(message: string, className?: DialogClassName) {
        this.showDialog({
            message,
            className
        });
    }

    render() {
        if (this.state.loading) {
            return <SpinnerOverlay/>;
        }

        if (this.state.dialog) {
            return <DialogOverlay {...this.state.dialog} dismiss={this.dismissDialog} />
        }

        return <div>
            <FacesPanel faces={this.state.faces2d} unitHelper={this.state.unitHelper}/>
            <OptionsPanel app={this}/>
        </div>;
    }
}