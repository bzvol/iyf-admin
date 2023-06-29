import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, User} from "firebase/auth";
import {get, getDatabase, ref} from "firebase/database";
import {getStorage} from "firebase/storage";
import {useEffect, useState} from "react";

const firebaseConfig = {
    apiKey: "AIzaSyAz6R00lLWRFC64dBmxQOHmrqtbSPivrV8",
    authDomain: "johirmisszio.firebaseapp.com",
    databaseURL: "https://johirmisszio-default-rtdb.europe-west1.firebasedatabase.app",
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
                    const admins = snapshot.val();
                    if (admins.includes(user.uid))
                        setAuthState((prev) => ({
                            ...prev,
                            role: "admin"
                        }));
                }
            }).catch(console.error);

            setAuthState((prev) => ({
                ...prev,
                loading: false
            }));
        });
    }, []);

    return authState;
}