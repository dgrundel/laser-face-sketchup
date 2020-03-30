import * as React from "react";
import {ChangeEvent} from "react";
import {UserPrefs} from "../interfaces";
import {Sketchup} from "../lib/sketchup";
import {SvgBuilder} from "../svg";
import {App} from "./App";
import {DialogClassName} from "./DialogOverlay";

const FILE_EXT_SEPARATOR = '.';

export interface OptionsPanelProps {
    app: App;
}

export interface OptionsPanelState {
    exportPath?: string;
    useMultiFile: boolean;
    overwriteFiles: boolean;
}

/**
 * For each outcome object, a status string is present.
 * If the status is fulfilled, then a value is present.
 * If the status is rejected, then a reason is present.
 */
interface PromiseOutcome {
    status: 'fulfilled' | 'rejected';
    value?: any;
    reason?: any;
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
        this.onExportComplete = this.onExportComplete.bind(this);
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

    onExportComplete (successes: Array<string>, failures: Array<string>) {
        const app = this.props.app;
        if (failures.length === 0) {
            const message = `Saved ${successes.length} files successfully: \n`
                + successes.join(', \n');
            app.showMessage(message, DialogClassName.Success);
        } else {
            const message = `Saved ${successes.length} files successfully, 
                        failed to save ${failures.length} files: \n`
                + failures.join(', \n');
            app.showMessage(message, DialogClassName.Error);
        }
    }

    doExport() {
        const app = this.props.app;
        const exportPath = this.state.exportPath;
        if (!exportPath) {
            app.showMessage("No export file selected.", DialogClassName.Error);
            return;
        }

        const overwrite = this.state.overwriteFiles;
        const faces2d = app.state.faces2d;
        const unitHelper = app.state.unitHelper;
        const useMultiFile = this.state.useMultiFile;

        app.setLoading(true);

        // do all this work after we've had a chance to show the spinner
        setTimeout(() => {
            if (useMultiFile) {
                const fileSeparators = app.state.fileSeparators;
                const splitPath = this.splitFilePath(exportPath, fileSeparators);
                // after the splice operation, splitPath contains only the folder path
                const fullFileName = splitPath.splice(splitPath.length - 1, 1)[0];
                const extIndex = fullFileName.lastIndexOf(FILE_EXT_SEPARATOR);
                const fileName = fullFileName.substring(0, extIndex);
                const ext = fullFileName.substring(extIndex);

                // would love to use Promise.allSettled here, but not available
                // in the old version of Chrome that Sketchup 2017 is using.
                let remainingFiles = faces2d.length;
                const successes: Array<string> = [];
                const failures: Array<string> = [];

                faces2d.forEach((face, i) => {
                    const fileNum = i + 1;

                    const faceFileName = `${fileName}-${fileNum}${ext}`;
                    const faceFilePath = splitPath.concat(faceFileName).join(fileSeparators[0]);

                    const builder = new SvgBuilder(unitHelper);
                    builder.addFace(face);
                    const xml = builder.toXml();
                    Sketchup.writeFile(faceFilePath, xml, overwrite, ((ok, message?) => {
                        remainingFiles--;
                        if (ok) {
                            successes.push(faceFilePath);
                        } else {
                            failures.push(`Failed to save ${faceFilePath}: ${message}`);
                        }

                        if (remainingFiles === 0) {
                            this.onExportComplete(successes, failures);
                        }
                    }));
                });

            } else {
                // all in a single file
                const builder = new SvgBuilder(unitHelper);
                faces2d.forEach(f => builder.addFace(f));
                Sketchup.writeFile(exportPath, builder.toXml(), overwrite, ((ok) => {
                    const successes = ok ? [exportPath] : [];
                    const failures = ok ? [] : [exportPath];
                    this.onExportComplete(successes, failures);
                }));
            }
        }, 0);
    }

    private splitFilePath(path: string, fileSeparators: Array<string>) {
        return fileSeparators.reduce((pathParts, sep) => {
            return pathParts.reduce((parts, part) => {
                return parts.concat(part.split(sep));
            }, []);
        }, [path]);
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