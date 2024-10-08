import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, User, setPersistence, browserSessionPersistence} from "firebase/auth";
import {useEffect, useState} from "react";
import apiUrls, {apiClient} from "./api";
import Bugsnag from "@bugsnag/js";

const authDomain = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ?
    "iyfhu-caaf9.firebaseapp.com" : "admin.iyf.hu";

const firebaseConfig = {
    apiKey: "AIzaSyBh6uKx5gRKrjnLPxZthaiF38_U92yNU7w",
    authDomain: authDomain,
    projectId: "iyfhu-caaf9",
    storageBucket: "iyfhu-caaf9.appspot.com",
    messagingSenderId: "452082197799",
    appId: "1:452082197799:web:044f10863739db2281f502"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);
export const provider = new GoogleAuthProvider();

interface IAuth {
    user: User | null;
    loading: boolean;
    loggedIn: boolean;
    accessRequested: boolean;
    admin: boolean;
    roles: IRoles;
}

export interface IRoles {
    contentManager: boolean;
    guestManager: boolean;
    accessManager: boolean;
}

export function useAuth(): IAuth {
    const [authState, setAuthState] = useState<IAuth>({
        user: null,
        loading: true,
        loggedIn: false,
        accessRequested: false,
        admin: false,
        roles: {
            contentManager: false,
            guestManager: false,
            accessManager: false
        }
    });

    useEffect(() =>
        auth.onAuthStateChanged(async (user) => {
            setAuthState((prev) => ({
                ...prev,
                user: user,
                loading: true,
                loggedIn: !!user,
            }));

            if (!user) return;

            let token = await user.getIdTokenResult();
            let claims = token.claims;

            const isNewUser = user.metadata.creationTime === undefined || user.metadata.lastSignInTime === undefined
                ? false
                : Date.parse(user.metadata.creationTime) === Date.parse(user.metadata.lastSignInTime);

            if (isNewUser && !('admin' in claims)) try {
                await apiClient.post(apiUrls.users.setDefaultClaims(user.uid));

                token = await user.getIdTokenResult(true);
                claims = token.claims;
            } catch (err) {
                if (err instanceof Error) Bugsnag.notify(err);
            }

            setAuthState((prev) => ({
                ...prev,
                loading: false,
                accessRequested: claims.accessRequested as boolean,
                admin: (claims.admin || claims.contentManager || claims.guestManager || claims.accessManager) as boolean,
                roles: {
                    contentManager: claims.contentManager as boolean,
                    guestManager: claims.guestManager as boolean,
                    accessManager: claims.accessManager as boolean
                }
            }));
        }), []);

    return authState;
}
