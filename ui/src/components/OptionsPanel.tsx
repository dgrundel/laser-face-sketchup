import * as React from "react";
import {App} from "./App";

export interface OptionsPanelProps {
    app: App
}

export class OptionsPanel extends React.Component<OptionsPanelProps, {}> {
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

            <div id="options-footer">
                <button className={'block primary'}>Export</button>
            </div>
        </div>;
    }
}