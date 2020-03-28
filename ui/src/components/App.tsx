import * as React from "react";
import {DialogButtonMap, DialogOverlay, DialogProps} from "./DialogOverlay";
const Alfador = require("alfador");
const Quaternion = Alfador.Quaternion;


import {SpinnerOverlay} from "./SpinnerOverlay";
import {FacesPanel} from "./FacesPanel";
import {OptionsPanel} from "./OptionsPanel";
import {Face, Face2d, IQuaternion} from "../interfaces";
import {createOffsetter, rotatePointsToSmallestBox, rotatePolygon, Z_NORMAL} from "../geometry";
import {getUnitHelper, IUnitHelper, Sketchup, SketchupData} from "../lib/sketchup";

export interface AppProps {
}

export interface AppState {
    loading: boolean;
    dialog?: DialogProps;

    unitHelper?: IUnitHelper;
    faces?: Array<Face>;
    faces2d?: Array<Face2d>;
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            loading: true
        };

        ((_window: any) => _window.LaserFace = this)(window);
    }

    componentDidMount() {
        setTimeout(Sketchup.getData, 0);
    }

    setData(data: SketchupData) {
        const unitHelper = getUnitHelper(data.units);
        const faces = data.faces;

        ((_w: any) => {
            _w.LaserFace = {
                data,
                geometric: require('geometric')
            };
        })(window);

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
            unitHelper,
            faces,
            faces2d
        });
    }

    dismissDialog() {
        this.setState({
            dialog: undefined
        });
    }

    showDialog(dialog: DialogProps) {
        const dismiss = this.dismissDialog.bind(this);
        const providedMap = dialog.buttonMap;
        const map = Object.keys(providedMap).reduce((map: DialogButtonMap, text) => {
            map[text] = () => {
                dismiss();
                providedMap[text]();
            };
            return map;
        }, {});

        this.setState({
            dialog: {
                message: dialog.message,
                buttonMap: map
            }
        });
    }

    render() {
        if (this.state.loading) {
            return <SpinnerOverlay/>;
        }

        if (this.state.dialog) {
            return <DialogOverlay {...this.state.dialog} />
        }

        return <div>
            <FacesPanel faces={this.state.faces2d} unitHelper={this.state.unitHelper}/>
            <OptionsPanel app={this}/>
        </div>;
    }
}