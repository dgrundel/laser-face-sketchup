import * as React from "react";

export type DialogButtonMap = Record<string, () => void>;

export interface DialogProps {
    message: string;
    buttonMap: DialogButtonMap
}

export class DialogOverlay extends React.Component<DialogProps, {}> {
    render() {
        return <div id="overlay">
            <div className="overlay-dialog">
                <div className="overlay-dialog-message">{this.props.message}</div>
                <div className="overlay-dialog-buttons">
                    {Object.keys(this.props.buttonMap).map((buttonText) => {
                        const callback = this.props.buttonMap[buttonText];
                        return <button key={buttonText} onClick={callback}>{buttonText}</button>;
                    })}
                </div>
            </div>
        </div>;
    }
}