import './styles/TimeField.scss';
import React, {forwardRef} from "react";
import {AccessTimeFilled as Time} from "@mui/icons-material";

const TimeField = forwardRef<HTMLInputElement>((_, ref) => {
    return (
        <div className="ContentEditor__time-wrapper icon-n-field">
            <Time/>
            <input type="text" ref={ref} placeholder="Time / schedule..."/>
        </div>
    );
});

export default TimeField;
