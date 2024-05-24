import './styles/UserPhoto.scss';
import {User} from "firebase/auth";
import React from "react";

const defaultProfilePhoto = "/assets/images/default-profile.png";

export default function UserPhoto({user, className, alt}: { user: User | null, className?: string, alt?: string }) {
    return (
        <img src={user?.photoURL ?? defaultProfilePhoto} alt={alt ?? user?.displayName ?? "Profile photo"}
             referrerPolicy="no-referrer" onError={handleLoadError} className={"UserPhoto " + className}/>
    );
}

const handleLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) =>
    (e.target as HTMLImageElement).src = defaultProfilePhoto
