import './styles/IAM.scss';
import {useLoaderData} from "react-router-dom";
import {fixUserModel, useAuth} from "../firebase";
import Alert from "../components/Alert";

const defaultProfilePhoto = "/assets/images/default-profile.png";

export default function IAM() {
    const {data} = useLoaderData() as { data: any[] };
    const users = data.map(u => fixUserModel(u)!);

    const {roles} = useAuth();

    return (
        <section className="IAM">
            <h1>Users / IAM</h1>
            {!roles.accessManager &&
                <Alert type="info">You cannot modify users.</Alert>}
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
                        <td>
                            <img src={user.photoURL || defaultProfilePhoto}
                                 alt={user.displayName || "<No name>"}
                                 referrerPolicy="no-referrer"/>
                        </td>
                        <td>{user.displayName}</td>
                        <td>{user.email}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    )
}
