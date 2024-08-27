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

type ResourceComparatorElement = { status: Status, metadata: { updatedAt: string } };
const statusOrder: Record<Status, number> = {draft: 1, published: 2, archived: 3};

export function resourceComparator(a: ResourceComparatorElement, b: ResourceComparatorElement): number {
    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) return statusComparison;
    return parseISO(b.metadata.updatedAt) - parseISO(a.metadata.updatedAt);
}

function parseISO(date: string) {
    const [datePart, timePart] = date.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    return new Date(+year, +month - 1, +day, +hour, +minute).getTime();
}
