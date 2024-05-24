import {Status} from "../../api";
import {Archive, Edit, Public, Publish} from "@mui/icons-material";
import {User} from "firebase/auth";

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

export function getFirstName(name: string | null): string {
    if (!name) return "";
    return name.split(" ")[0];
}

export function getMetadataTitle(createdBy: User, updatedBy: User): string {
    return createdBy.uid !== updatedBy.uid
        ? `Created by ${createdBy.displayName}, updated by ${updatedBy.displayName}`
        : `Created by ${createdBy.displayName}`;
}
