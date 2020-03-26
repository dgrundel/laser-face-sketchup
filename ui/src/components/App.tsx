import * as React from "react";
const Alfador = require("alfador");
const Quaternion = Alfador.Quaternion;


import {Spinner} from "./Spinner";
import {FacesPanel} from "./FacesPanel";
import {OptionsPanel} from "./OptionsPanel";
import {Face, Face2d, IQuaternion} from "../interfaces";
import {createOffsetter, Z_NORMAL} from "../geometry";
import {Sketchup} from "../sketchup";

export interface AppProps {
}

export interface AppState {
    loading: boolean;
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
        setTimeout(Sketchup.getJson, 0);
    }

    setFaces(faces: Array<Face>) {
        const faces2d = faces.map(f => {
            const rotation: IQuaternion = Quaternion.rotationFromTo(f.normal, Z_NORMAL);
            const outerLoop = f.outer_loop.map(v => rotation.rotate(v));

            const offsetter = createOffsetter(outerLoop);

            const outerLoop2d = outerLoop.map(offsetter);
            const otherLoops = f.other_loops.map(loop => loop.map(v => rotation.rotate(v)).map(offsetter));

            return {
                outerLoop: outerLoop2d,
                otherLoops
            };
        });

        this.setState({
            faces,
            faces2d,
            loading: false
        });
    }

    render() {
        if (this.state.loading) {
            return <Spinner/>;
        }

        return <div>
            <FacesPanel faces={this.state.faces2d}/>
            <OptionsPanel/>
        </div>;
    }
}