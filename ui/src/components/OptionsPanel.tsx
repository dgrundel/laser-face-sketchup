import * as React from "react";
import {ChangeEvent} from "react";
import {UserPrefs} from "../interfaces";
import {Sketchup} from "../lib/sketchup";
import {faceToSvg} from "../svg";
import {App} from "./App";

export interface OptionsPanelProps {
    app: App;
}

export interface OptionsPanelState {
    exportPath?: string;
    useMultiFile: boolean;
    overwriteFiles: boolean;
}

export class OptionsPanel extends React.Component<OptionsPanelProps, OptionsPanelState> {
    constructor(props: OptionsPanelProps) {
        super(props);

        const userPrefs: UserPrefs = props.app.state.userPrefs;

        this.state = {
            exportPath: userPrefs.lastExportPath,
            useMultiFile: userPrefs.useMultiFile === true,
            overwriteFiles: userPrefs.overwriteFiles === true
        };

        Sketchup.onReceiveExportPath(this.receiveExportPath.bind(this));

        this.reloadWindow = this.reloadWindow.bind(this);
        this.onMultiFileOptionChange = this.onMultiFileOptionChange.bind(this);
        this.onOverwriteExistingChange = this.onOverwriteExistingChange.bind(this);
        this.doExport = this.doExport.bind(this);
    }

    /**
     * This is called once the user is done selecting an output file.
     * @param exportPath
     */
    receiveExportPath(exportPath: string) {
        this.setState({
            exportPath
        });

        this.props.app.updatePreferences((userPrefs => {
            userPrefs.lastExportPath = exportPath;
            return userPrefs;
        }));
    }

    reloadWindow() {
        const app = this.props.app;
        app.showDialog({
            message: "Are you sure you want to reload?\n" +
                "Any changes you've made may be lost.",
            buttonMap: {
                "Ok": () => { window.location.reload(true); },
                "Cancel": () => {}
            }
        });
    }

    onMultiFileOptionChange(e: ChangeEvent) {
        const target = e.target as HTMLInputElement;
        const useMultiFile = target.value === 'true';

        this.setState({
            useMultiFile
        });

        this.props.app.updatePreferences((userPrefs => {
            userPrefs.useMultiFile = useMultiFile;
            return userPrefs;
        }));
    }

    onOverwriteExistingChange(e: ChangeEvent) {
        const target = e.target as HTMLInputElement;
        const overwriteFiles = target.checked;

        this.setState({
            overwriteFiles
        });

        this.props.app.updatePreferences((userPrefs => {
            userPrefs.overwriteFiles = overwriteFiles;
            return userPrefs;
        }));
    }

    doExport() {
        const app = this.props.app;
        const exportPath = this.state.exportPath;
        if (!exportPath) {
            app.showError("No export file selected.");
            return;
        }

        const overwrite = this.state.overwriteFiles;
        const faces2d = app.state.faces2d;
        const unitHelper = app.state.unitHelper;
        const svgStr = faceToSvg(faces2d[0], unitHelper);

        Sketchup.writeFile(exportPath, svgStr, overwrite);

        app.showDialog({
            message: 'Done?'
        });
    }

    render() {
        return <div id="options">
            <button className={'block'} onClick={this.reloadWindow}>Reload</button>

            <div className="options-panel-group">
                <h3>How many files?</h3>
                <div>
                    <label>
                        <input type="radio" name="multi-file" value="false"
                               checked={!this.state.useMultiFile} onChange={this.onMultiFileOptionChange}/>
                        All faces in one file
                    </label>
                    <p className={'note' + (this.state.useMultiFile ? ' hide' : '')}>
                        All faces will be combined into a single SVG file using the
                        file name provided.
                    </p>
                </div>
                <div>
                    <label>
                        <input type="radio" name="multi-file" value="true"
                               checked={this.state.useMultiFile} onChange={this.onMultiFileOptionChange}/>
                        One file per face
                    </label>
                    <p className={'note' + (this.state.useMultiFile ? '' : ' hide')}>
                        Each face will be saved to a separate SVG file using the
                        file name provided along with a number.
                        (e.g. "file-1.svg", "file-2.svg", etc.)
                    </p>
                </div>
            </div>

            <div className="options-panel-group">
                <label>
                    <input type="checkbox" name="overwrite-existing"
                           checked={this.state.overwriteFiles} onChange={this.onOverwriteExistingChange}/>
                    Overwrite existing file(s)
                </label>
                <p className="note">
                    If files exist with the provided name, they will be overwritten.
                </p>
            </div>

            <div className="options-panel-group">
                <h3>Export Path</h3>
                <p className="break">{this.state.exportPath}</p>
                <button className="block" onClick={() => Sketchup.getExportPath()}>Choose File</button>
            </div>

            <div id="options-footer">
                <button className={'block primary'} onClick={this.doExport}>Export</button>
            </div>
        </div>;
    }
}