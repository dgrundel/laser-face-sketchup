import * as React from "react";
import {ChangeEvent} from "react";
import {Sketchup} from "../lib/sketchup";
import {App} from "./App";

export interface OptionsPanelProps {
    app: App;
}

export interface OptionsPanelState {
    exportPath?: string;
    useMultiFile: boolean;
}

export class OptionsPanel extends React.Component<OptionsPanelProps, OptionsPanelState> {
    constructor(props: OptionsPanelProps) {
        super(props);

        const userPrefs = props.app.state.userPrefs;

        this.state = {
            exportPath: userPrefs.lastExportPath,
            useMultiFile: userPrefs.useMultiFile === true
        };

        Sketchup.onReceiveExportPath(this.receiveExportPath.bind(this));
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
        const onMultiFileChange = (e: ChangeEvent) => {
            const target = e.target as HTMLInputElement;
            const useMultiFile = target.value === 'true';

            this.setState({
                useMultiFile
            });

            this.props.app.updatePreferences((userPrefs => {
                userPrefs.useMultiFile = useMultiFile;
                return userPrefs;
            }));
        };

        return <div id="options">
            <button className={'block'} onClick={onReloadButtonClick}>Reload</button>

            <div className="options-panel-group">
                <h3>How many files?</h3>
                <div>
                    <label>
                        <input type="radio" name="multi-file" value="false"
                               checked={!this.state.useMultiFile} onChange={onMultiFileChange}/>
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
                               checked={this.state.useMultiFile} onChange={onMultiFileChange}/>
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
                <h3>Export Path</h3>
                <p className="break">{this.state.exportPath}</p>
                <button className="block" onClick={() => Sketchup.getExportPath()}>Choose File</button>
            </div>

            <div className="options-panel-group">
                <label>
                    <input type="checkbox" name="overwrite-existing"/>
                    Overwrite existing file(s)
                </label>
                <p className="note">
                    If files exist with the provided name, they will be overwritten.
                </p>
            </div>

            <div id="options-footer">
                <button className={'block primary'}>Export</button>
            </div>
        </div>;
    }
}