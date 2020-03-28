import * as React from "react";
const Alfador = require("alfador");
const Quaternion = Alfador.Quaternion;


import {Spinner} from "./Spinner";
import {FacesPanel} from "./FacesPanel";
import {OptionsPanel} from "./OptionsPanel";
import {Face, Face2d, IQuaternion} from "../interfaces";
import {createOffsetter, Z_NORMAL} from "../geometry";
import {getUnitHelper, IUnitHelper, Sketchup, SketchupData} from "../sketchup";

export interface AppProps {
}

export interface AppState {
    loading: boolean;
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

        const faces2d: Array<Face2d> = faces.map(f => {
            const rotation: IQuaternion = Quaternion.rotationFromTo(f.normal, Z_NORMAL);
            const outerLoop3d = f.outer_loop.map(v => rotation.rotate(v));
            const otherLoops3d = f.other_loops.map(loop => loop.map(v => rotation.rotate(v)));

            const offsetter = createOffsetter(outerLoop3d);

            const outerLoop = outerLoop3d.map(offsetter);
            const otherLoops = otherLoops3d.map(loop => loop.map(offsetter));

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

    render() {
        if (this.state.loading) {
            return <Spinner/>;
        }

        return <div>
            <FacesPanel faces={this.state.faces2d} unitHelper={this.state.unitHelper}/>
            <OptionsPanel/>
        </div>;
    }
}