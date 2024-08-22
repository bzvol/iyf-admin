import './styles/StartEndTimeFields.scss';
import React, {forwardRef, useImperativeHandle, useRef} from "react";
import {AccessTimeFilled as StartTime, Update as EndTime} from "@mui/icons-material";

export interface StartEndTimeRefs {
    get start(): HTMLInputElement;
    get end(): HTMLInputElement;
}

const StartEndTimeFields = forwardRef<StartEndTimeRefs>((_, ref) => {
    const startRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        get start() {
            return startRef.current!;
        },
        get end() {
            return endRef.current!;
        }
    }));

    return (
        <>
            <div className="ContentEditor__time-wrapper icon-n-field">
                <div className="ContentEditor__time-icon-wrapper">
                    <StartTime/>
                    <span>START</span>
                </div>
                <input type="datetime-local" ref={startRef}/>
            </div>
            <div className="ContentEditor__time-wrapper icon-n-field">
                <div className="ContentEditor__time-icon-wrapper">
                    <EndTime/>
                    <span>END</span>
                </div>
                <input type="datetime-local" ref={endRef}/>
            </div>
        </>
    )
});

export default StartEndTimeFields;
