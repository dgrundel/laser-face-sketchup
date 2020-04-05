import * as React from "react";

export type DialogButtonMap = Record<string, () => void>;

export enum DialogClassName {
    Error = 'error',
    Success = 'success',
}

export interface DialogProps {
    message: string;
    buttonMap?: DialogButtonMap;
    className?: DialogClassName;
    dismiss?: () => void;
}

const DEFAULT_BUTTON_MAP: DialogButtonMap = { "Ok": () => {} };

export class DialogOverlay extends React.Component<DialogProps, {}> {

    render() {
        const buttonMap = this.getButtonMap();

        return <div id="overlay" className={this.props.className}>
            <div className="overlay-dialog">
                <div className="overlay-dialog-message">{this.props.message.split(/\n/).map(s => {
                    return <p key={s}>{s}</p>;
                })}</div>
                <div className="overlay-dialog-buttons">
                    {Object.keys(buttonMap).map((buttonText) => {
                        const callback = () => {
                            buttonMap[buttonText]();
                            this.props.dismiss();
                        };
                        return <button key={buttonText} onClick={callback}>{buttonText}</button>;
                    })}
                </div>
            </div>
        </div>;
    }

    private getButtonMap() {
        const buttonMap = this.props.buttonMap;
        if (buttonMap && Object.keys(buttonMap).length > 0) {
            return buttonMap;
        }

        return DEFAULT_BUTTON_MAP;
    }
}