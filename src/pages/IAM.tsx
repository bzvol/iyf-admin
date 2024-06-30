import './styles/IAM.scss';
import {useAuth} from "../firebase";
import UserPhoto from "../components/UserPhoto";
import ViewOnlyAlert from "../components/ViewOnlyAlert";
import {User} from "firebase/auth";
import {useContext, useEffect, useMemo, useState} from "react";
import apiUrls, {apiClient} from "../api";
import Alert from "../components/Alert";
import {NotificationsContext} from "../components/sidebar/Notifications";
import ConfirmationModal from "../components/ConfirmationModal";

type UserWithClaims = User & { customClaims: UserClaims };
type UserClaims = {
    accessRequested: boolean,
    accessDenied: boolean,
    admin: boolean,
} & UserRoles;
type UserRoles = {
    contentManager: boolean,
    guestManager: boolean,
    accessManager: boolean
};

export default function IAM() {
    const [users, setUsers] = useState<UserWithClaims[]>([]);
    const [loaded, setLoaded] = useState(false);

    const {roles} = useAuth();

    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient.get<UserWithClaims[]>(apiUrls.users.list);
                setUsers(res.data);
                setLoaded(true);
            } catch (e) {
                // TODO: send error noti/alert
                console.error(e);
            }
        })();
    }, []);

    return (
        <section className="IAM flex-vert-gap1">
            <h1>Users / IAM</h1>
            {!roles.accessManager && <ViewOnlyAlert/>}
            {!loaded && <Alert type="loading">Loading users...</Alert>}
            {users.map(user => <UserItem key={"user-" + user.uid} user={user} isManager={roles.accessManager}/>)}
        </section>
    )
}

function UserItem({user, isManager}: { user: UserWithClaims, isManager: boolean }) {
    const {addNotification} = useContext(NotificationsContext);

    const statusProps = getStatusProps(user.customClaims);

    const originalRoles = useMemo(() => ({
        contentManager: user.customClaims.contentManager,
        guestManager: user.customClaims.guestManager,
        accessManager: user.customClaims.accessManager
    }), [user.customClaims]);

    const [roles, setRoles] = useState<UserRoles>(originalRoles);
    const [changedRoles, setChangedRoles] = useState<Partial<UserRoles>>({});

    useEffect(() => {
        // Sets for the difference between the original roles and the current roles (before the update)
        setChangedRoles(Object.fromEntries(
            Object.entries(roles).filter(([role, value]) =>
                originalRoles[role as keyof UserRoles] !== value)));
    }, [originalRoles, roles]);

    const updateRole = (role: keyof UserRoles, value: boolean) =>
        setRoles(prev => ({...prev, [role]: value}));

    const [statusActionConfOpen, setStatusActionConfOpen] = useState(false);
    const [rolesUpdateConfOpen, setRolesUpdateConfOpen] = useState(false);

    return (
        <article className="UserItem">
            <div className="UserItem__data">
                <UserPhoto user={user}/>
                <div>
                    <h2>{user.displayName ?? "<unknown name>"}</h2>
                    <h4>{user.email ?? "<unknown email>"}</h4>
                </div>
            </div>

            {statusProps && (
                <div className="UserItem__status">
                    <b className={"UserItem__status-" + statusProps.clazz!}>{statusProps.text}</b>
                    {isManager && <div className="UserItem__status__actions">
                        {statusProps.actions.map(action => <button
                            key={`user-${user.uid}_action-${action}`}
                            onClick={() => handleStatusAction(user, action)}
                        >{buttonLabels[action]}</button>)}
                    </div>}
                </div>
            )}

            <div className="UserItem__roles">
                <ul>
                    {Object.entries(roles).map(([role, value]) => {
                        const key = `user-${user.uid}_role-${role}`;
                        return (
                            <li key={key}>
                                <input type="checkbox" className="switch" id={key}
                                       checked={value} disabled={!isManager}
                                       onChange={e =>
                                           updateRole(role as keyof UserRoles, e.target.checked)}/>
                                <label htmlFor={key}/>
                                <span>{rolesLabels[role as keyof UserRoles]}</span>
                            </li>
                        );
                    })}
                </ul>
                {Object.keys(changedRoles).length > 0 &&
                    <button onClick={() => setRolesUpdateConfOpen(true)}>Update roles</button>}
            </div>

            <ConfirmationModal
                isOpen={rolesUpdateConfOpen}
                onClose={() => setRolesUpdateConfOpen(false)}
                onConfirm={() => {
                    setRolesUpdateConfOpen(false);
                    handleRolesUpdate(user, roles, addNotification);
                }}
                title="Update roles"
            >
                <p>Are you sure you want to update the following roles for <b>{user.displayName}</b>?</p>
                <ul className="UserItem__changed-roles">
                    {Object.entries(changedRoles).map(([role, value]) =>
                        <li key={`user-${user.uid}_role-${role}-change`}>
                            {value ? "Grant role" : "Revoke role"} <i>{rolesLabels[role as keyof UserRoles]}</i>
                        </li>
                    )}
                </ul>
            </ConfirmationModal>
        </article>
    );
}

type StatusAction = "grant" | "deny" | "revoke";
const buttonLabels: Record<StatusAction, string> = {
    grant: "Grant access",
    deny: "Deny access",
    revoke: "Revoke access"
};

function handleStatusAction(user: UserWithClaims, action: StatusAction) {
    // TODO: implement
    console.log("handleStatusAction", user.uid, action);
}

function getStatusProps(claims: UserClaims): {
    text: string,
    clazz: string,
    actions: StatusAction[]
} | null {
    if (claims.accessDenied) return {text: "Denied", clazz: "denied", actions: []};
    if (claims.accessRequested) return {text: "Requested access", clazz: "requested", actions: ["grant", "deny"]};
    if (claims.admin) return {text: "Active", clazz: "active", actions: ["revoke"]};
    return null;
}

const rolesLabels: Record<keyof UserRoles, string> = {
    contentManager: "Content Manager",
    guestManager: "Guest Manager",
    accessManager: "Access Manager"
};

function handleRolesUpdate(user: UserWithClaims, roles: UserRoles, addNoti: any) {
    // TODO: implement
    console.log("handleRolesUpdate", user.uid, roles);
    addNoti({
        messages: {
            loading: "Updating roles...",
            success: "Roles updated successfully",
            error: "Failed to update roles"
        },
        action: () => new Promise(resolve => setTimeout(resolve, 2000))
    });
}
