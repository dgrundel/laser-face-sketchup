import * as React from "react";
import {Sketchup} from "../lib/sketchup";
import {App} from "./App";

export interface OptionsPanelProps {
    app: App
}

export interface OptionsPanelState {
    exportPath?: string
}

export class OptionsPanel extends React.Component<OptionsPanelProps, OptionsPanelState> {
    constructor(props: OptionsPanelProps) {
        super(props);
        this.state = {};

        Sketchup.onSetExportPath(this.setExportPath.bind(this));
    }

    setExportPath(exportPath: string) {
        this.setState({
            exportPath
        });
    }

    render() {
        const app = this.props.app;
        const onReloadButtonClick = (() => {
            app.showDialog({
                message: "Are you sure you want to reload?\n" +
                    "Any changes you've made may be lost.",
                buttonMap: {
                    "Ok": () => { window.location.reload(true); },
                    "Cancel": () => {}
                }
            })
        });

        return <div id="options">
            <button className={'block'} onClick={onReloadButtonClick}>Reload</button>

            <div className="options-panel-group">
                <h3>How many files?</h3>
                <div>
                    <label>
                        <input type="radio" name="multi-file" value="true"/>
                        One file per face
                    </label>
                    <p className="note">
                        Each face will be saved to a separate SVG file using the
                        file name provided along with a number.
                        (e.g. "file-1.svg", "file-2.svg", etc.)
                    </p>
                </div>
                <div>
                    <label>
                        <input type="radio" name="multi-file" value="false"/>
                        All faces in one file
                    </label>
                </div>
            </div>

            <div className="options-panel-group">
                <h3>Export Path</h3>
                <p>{this.state.exportPath}</p>
                <button className={'block'} onClick={() => Sketchup.getExportPath()}>Choose File</button>
            </div>

            <div id="options-footer">
                <button className={'block primary'}>Export</button>
            </div>
        </div>;
    }
}