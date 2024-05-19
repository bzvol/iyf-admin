import './styles/Home.scss';
import {useLoaderData} from "react-router-dom";
import {AxiosResponse} from "axios";
import {CountInfo} from "../api";

export function Home() {
    const {data: {posts, events, regularEvents}} = useLoaderData() as AxiosResponse<CountInfo>;

    return (
        <div className="Home">
            <h1>IYF counters</h1>
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
