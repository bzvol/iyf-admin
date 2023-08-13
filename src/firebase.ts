import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, User} from "firebase/auth";
import {get, getDatabase, ref} from "firebase/database";
import {getStorage} from "firebase/storage";
import {useEffect, useState} from "react";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: "johirmisszio",
    storageBucket: "johirmisszio.appspot.com",
    messagingSenderId: "961463867363",
    appId: "1:961463867363:web:cd2e952d39cc61fd47b2d6",
    measurementId: "G-62KRMZG5SY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const storage = getStorage(app);

interface IAuth {
    user: User | null;
    loading: boolean;
    loggedIn: boolean;
    role: "guest" | "admin";
}

export function useAuth(): IAuth {
    const [authState, setAuthState] = useState<IAuth>({
        user: null,
        loading: true,
        loggedIn: false,
        role: "guest"
    });

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            setAuthState({
                user: user,
                loading: true,
                loggedIn: !!user,
                role: "guest"
            });

            if (!user) return;

            const adminsRef = ref(database, "admins");
            get(adminsRef).then(snapshot => {
                if (snapshot.exists()) {
                    if (snapshot.hasChild(user.uid))
                        setAuthState((prev) => ({
                            ...prev,
                            role: "admin"
                        }));
                }
            }).catch(console.error);

            /*console.info("User logged in:", {
                user,
                token: user?.getIdToken(),
                role: authState.role
            });*/

            setAuthState((prev) => ({
                ...prev,
                loading: false
            }));
        });
    }, []);

    return authState;
}