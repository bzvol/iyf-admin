import './styles/Home.scss';
import apiUrls, {CountInfo, apiClient} from "../api";
import {useEffect, useState} from "react";
import {useAuth} from "../firebase";
import Alert from "../components/Alert";
import {useNotifications} from "../utils";
import Bugsnag from "@bugsnag/js";

export function Home() {
    const [countInfo, setContentInfo] = useState<CountInfo>({
        posts: {total: 0, draft: 0, published: 0, archived: 0},
        events: {total: 0, draft: 0, published: 0, archived: 0, upcoming: 0, past: 0, totalGuests: 0, uniqueGuests: 0},
        regularEvents: {total: 0, draft: 0, published: 0, archived: 0}
    });
    const [loaded, setLoaded] = useState(false);

    const addNotification = useNotifications();

    const {user} = useAuth();
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                setLoaded(false);
                const res = await apiClient.get<CountInfo>(apiUrls.info.counts);
                setContentInfo(res.data);
                setLoaded(true);
            } catch (e) {
                addNotification({
                    type: "error",
                    message: "Failed to fetch counts"
                });
                if (e instanceof Error) Bugsnag.notify(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const {posts, events, regularEvents} = countInfo;

    return (
        <div className="Home flex-vert-gap1">
            <h1>IYF counters</h1>
            {!loaded && <Alert type="loading">Loading counts...</Alert>}
            <section className="Home__widgets">
                <article className="Home__widget Home__post-counts">
                    <h2>{posts.total} posts</h2>
                    <ul>
                        <li><span>{posts.draft}</span> draft</li>
                        <li><span>{posts.published}</span> published</li>
                        <li><span>{posts.archived}</span> archived</li>
                    </ul>
                </article>
                <article className="Home__widget Home__event-counts">
                    <div>
                        <h2>{events.total} events</h2>
                        <div className="Home__event-counts-lb">
                            <ul>
                                <li><span>{events.draft}</span> draft</li>
                                <li><span>{events.published}</span> published</li>
                                <li><span>{events.archived}</span> archived</li>
                            </ul>
                            <ul>
                                <li>{events.upcoming} upcoming</li>
                                <li>{events.past} past</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3>Hosted {events.totalGuests} guests,</h3>
                        <p>of which (approx.) <b>{events.uniqueGuests}</b> were unique.</p>
                        <p><i>This counter does not include upcoming events' guests.</i></p>
                    </div>
                </article>
                <article className="Home__widget Home__regular-event-counts">
                    <h2>{regularEvents.total} regular events</h2>
                    <ul>
                        <li><span>{regularEvents.draft}</span> draft</li>
                        <li><span>{regularEvents.published}</span> published</li>
                        <li><span>{regularEvents.archived}</span> archived</li>
                    </ul>
                </article>
            </section>
        </div>
    );
}
