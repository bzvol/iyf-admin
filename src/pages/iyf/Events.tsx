import './styles/Events.scss';
import './styles/common.scss';
import axios, {AxiosResponse} from "axios";
import apiUrls, {makeBearer, Event, Status} from "../../api";
import {useEffect, useState} from "react";
import {useLoaderData} from "react-router-dom";
import {useAuth} from "../../firebase";
import {Add, Delete, Edit, MoreVert} from "@mui/icons-material";
import {capitalize, getFirstName, StatusAction, StatusIcon, unknownProfilePic} from './common';
import SearchBar from '../../component/SearchBar';
import Alert from "../../component/Alert";

export default function Events() {
    const {data: events} = useLoaderData() as AxiosResponse<Event[]>;
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);

    const {user, roles} = useAuth();

    const [createdBy, setCreatedBy] = useState<(any)[]>([]);
    const [updatedBy, setUpdatedBy] = useState<(any)[]>([]);

    useEffect(() => {
        if (!user) return;
        makeBearer(user)
            .then(config => axios.get(apiUrls.users.list, config))
            .then(res => {
                const users = res.data as any[];
                setCreatedBy(events.map(event =>
                    users.find(user => user.uid === event.metadata.createdBy)));
                setUpdatedBy(events.map(event =>
                    users.find(user => user.uid === event.metadata.updatedBy)));
            });
    }, [events, user]);

    // If there are more than 50 events, the filter will
    // only be applied 500ms after the user stops typing.
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const handleSearch = (query: string) => {
        if (searchTimeout) clearTimeout(searchTimeout);

        if (!query || query.length < 3) {
            if (filteredEvents.length !== events.length) setFilteredEvents(events);
            return;
        }

        if (events.length > 50) {
            const timeout = setTimeout(() => filterEvents(query), 500);
            setSearchTimeout(timeout);
        } else filterEvents(query);
    }

    const filterEvents = (query: string) => {
        const q = query.trim().toLowerCase();
        setFilteredEvents(events.filter(event =>
            event.title.toLowerCase().includes(q) || event.details.toLowerCase().includes(q)));
    }

    return (
        <section className="Events schgrid__wrapper">
            <h1>Events</h1>
            <div className="schgrid__actions">
                {roles.contentManager
                    ? <button className="icon-n-text" onClick={handleCreate}><Add/> Create</button>
                    : <Alert type="info">You don't have permission to create or edit events.</Alert>}
                <SearchBar onSearch={handleSearch}/>
            </div>
            <div className="schgrid__filter-info">
                {filteredEvents.length !== 0
                    ? `Showing ${filteredEvents.length} of ${events.length} events`
                    : events.length === 0 ? "There are not yet any events." : "No events found."}
            </div>
            <div className="schgrid">
                {filteredEvents.reverse().map((event, idx) => (
                    <EventItem key={"event" + event.id} event={event}
                              createdBy={createdBy[idx]} updatedBy={updatedBy[idx]}
                              showOptions={roles.contentManager}/>
                ))}
            </div>
        </section>
    );
}

interface EventItemProps {
    event: Event;
    createdBy: any;
    updatedBy: any;
    showOptions: boolean;
}

function EventItem({createdBy, updatedBy, showOptions, ...props}: EventItemProps) {
    const [event, setEvent] = useState<Event>(props.event);

    const {user} = useAuth();

    async function handleStatusAction(status: Status) {
        event.status = status === "draft" || status === "archived" ? "published" : "archived";
        const res = await axios.put(apiUrls.events.update(event.id), event, await makeBearer(user!))
        if (res.status === 200) setEvent(res.data as Event);
    }

    return (
        <article className="schgrid__item">
            <div className="schgrid__item__top-bar">
                <div className="schgrid__item__top-bar-el1">
                    <div className="schgrid__item__status" title={capitalize(event.status)}>
                        <StatusIcon status={event.status}/>
                    </div>

                    <div className="schgrid__item__metadata">
                        <img src={createdBy?.photoUrl || unknownProfilePic} alt="created by"
                             referrerPolicy="no-referrer"/>
                        <span>{getFirstName(createdBy?.displayName)}</span>
                        {(event.metadata.createdBy !== event.metadata.updatedBy) && (
                            <>
                                <img src={updatedBy?.photoUrl || unknownProfilePic} alt="updated by"
                                     referrerPolicy="no-referrer"/>
                                <span>{getFirstName(updatedBy?.displayName)}</span>
                            </>
                        )}
                    </div>
                </div>
                {showOptions && <div className="schgrid__item__options">
                    <MoreVert/>
                    <ul className="schgrid__item__options-menu">
                        <li onClick={() => console.log("Editing event " + event.id)}>
                            <div/>
                            <Edit/> Edit
                            <div/>
                        </li>
                        <li onClick={() => console.log("Deleting event " + event.id)}>
                            <div/>
                            <Delete/> Delete
                            <div/>
                        </li>
                        <li onClick={() => handleStatusAction(event.status)}>
                            <div/>
                            <StatusAction status={event.status}/>
                            <div/>
                        </li>
                    </ul>
                </div>}
            </div>

            <h2>{event.title}</h2>
            <p>{event.details}</p>
        </article>
    );
}

// TODO: Implement create
function handleCreate() {
    console.log("Creating new event");
}
