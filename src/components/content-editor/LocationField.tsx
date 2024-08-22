import './styles/LocationField.scss';
import React, {forwardRef} from "react";
import {LocationOn} from "@mui/icons-material";

const LocationField = forwardRef<HTMLInputElement>((_, ref) => {
    return (
        <div className="ContentEditor__location-wrapper icon-n-field">
            <LocationOn/>
            <input type="text" ref={ref} placeholder="Location..."/>
        </div>
    );
});

export default LocationField;
