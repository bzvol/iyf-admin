import './styles/Alert.scss';
import React, {useEffect} from "react";
import {CheckCircle, Error, Info, Warning} from "@mui/icons-material";
import {CircularProgress} from "@mui/material";

type AlertType = "warning" | "error" | "info" | "success" | "loading";

export default function Alert({type = "warning", children}: { type?: AlertType, children: React.ReactNode }) {
    useEffect(() => {
        // Match icon's size to the alert's height
        const alert = document.querySelector(".Alert__content") as HTMLDivElement;
        const icon = document.querySelector(".Alert__icon") as SVGSVGElement | HTMLSpanElement;

        if (!alert || !icon) return;

        if (type !== "loading") icon.style.fontSize = `min(${alert.clientHeight}px, 2.5rem)`;
        else icon.style.width = icon.style.height = `min(${alert.clientHeight}px, 2.5rem)`;
    }, [type]);

    return (
        <div className={`Alert Alert-${type}`} role="alert">
            <AlertIcon type={type}/>
            <div className="Alert__content">{children}</div>
        </div>
    );
}

function AlertIcon({type}: { type: AlertType }) {
    switch (type) {
        case "warning":
            return <Warning className="Alert__icon"/>;
        case "error":
            return <Error className="Alert__icon"/>;
        case "info":
            return <Info className="Alert__icon"/>;
        case "success":
            return <CheckCircle className="Alert__icon"/>;
        case "loading":
            return <CircularProgress thickness={5} color="inherit" className="Alert__icon"/>;
    }
}
