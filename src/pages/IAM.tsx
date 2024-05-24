import './styles/IAM.scss';
import {useAuth} from "../firebase";
import UserPhoto from "../components/UserPhoto";
import ViewOnlyAlert from "../components/ViewOnlyAlert";
import {User} from "firebase/auth";
import {useEffect, useState} from "react";
import apiUrls, {httpClient} from "../api";

export default function IAM() {
    const [users, setUsers] = useState<User[]>([]);

    const {roles} = useAuth();

    useEffect(() => {
        (async () => {
            try {
                const res = await httpClient.get<User[]>(apiUrls.users.list);
                setUsers(res.data);
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
            <table>
                <thead>
                <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.uid}>
                        <td><UserPhoto user={user}/></td>
                        <td>{user.displayName}</td>
                        <td>{user.email}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    )
}
