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

    fileSeparators?: Array<string>;
    userPrefs?: UserPrefs;
    unitHelper?: UnitHelper;
    faces2d?: Array<Face2d>;
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            loading: true
        };

        this.dismissDialog = this.dismissDialog.bind(this);
        this.addFaces = this.addFaces.bind(this);
        this.removeFace = this.removeFace.bind(this);
        this.removeAllFaces = this.removeAllFaces.bind(this);

        Sketchup.onReceiveModelData(this.receiveModelData.bind(this));
        Sketchup.onMessage(this.showMessage.bind(this));

        window.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
            let messages = ['A JavaScript error occurred in the plugin.'];
            if (error) {
                messages.push(error.message);
            } else if (typeof event === 'string') {
                messages.push(event);
            }
            this.showMessage(messages.join('\n'), DialogClassName.Error);
        }
    }

    componentDidMount() {
        Sketchup.getModelData();
    }

    transformFaceData(f: Face) {
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
    }

    receiveModelData(data: ModelData) {
        const fileSeparators = data.fileSeparators;
        const userPrefs = JSON.parse(data.userPrefsJson) as UserPrefs;
        const unitHelper = getUnitHelper(data.units);
        const faces = data.faces;
        const faces2d: Array<Face2d> = faces.map(f => this.transformFaceData(f));

        this.setState({
            loading: false,
            fileSeparators,
            userPrefs,
            unitHelper,
            faces2d
        });
    }

    setLoading(isLoading: boolean) {
        this.setState({
            loading: isLoading
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
            loading: false,
            dialog: dialog
        });
    }

    showMessage(message: string, className?: DialogClassName) {
        this.showDialog({
            message,
            className
        });
    }

    addFaces() {
        Sketchup.getFaces((ok: boolean, response: Array<Face> | string) => {
            if (!ok) {
                this.showMessage(response as string, DialogClassName.Error);
                return;
            }

            const faces = response as Array<Face>;
            const faces2d: Array<Face2d> = faces.map(f => this.transformFaceData(f));
            this.setState(prev => ({
                faces2d: prev.faces2d.concat(faces2d)
            }));
        });
    }

    removeFace(index: number) {
        this.setState(prev => {
            const faces2d = prev.faces2d.slice();
            faces2d.splice(index, 1);

            return {
                faces2d
            }
        });
    }

    removeAllFaces() {
        this.setState({
            faces2d: []
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
            <FacesPanel faces={this.state.faces2d}
                        removeFace={this.removeFace}
                        unitHelper={this.state.unitHelper}/>
            <OptionsPanel app={this}/>
        </div>;
    }
}