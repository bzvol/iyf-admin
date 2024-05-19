import {Status} from "../../api";
import {Archive, Edit, Public, Publish} from "@mui/icons-material";

export const defaultProfilePhoto = "/assets/images/default-profile.png";

export function StatusIcon({status}: { status: Status }) {
    switch (status) {
        case "draft":
            return <Edit/>;
        case "published":
            return <Public/>;
        case "archived":
            return <Archive/>;
    }
}

export function StatusAction({status}: { status: Status }) {
    return status === "draft" || status === "archived"
        ? <><Publish/> Publish</>
        : <><Archive/> Archive</>;
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getFirstName(name: string): string {
    if (!name) return "";
    return name.split(" ")[0];
}
