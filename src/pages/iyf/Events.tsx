import './styles/Events.scss';
import './styles/common.scss';
import apiUrls, {Event, apiClient, Status} from "../../api";
import {useEffect, useState} from "react";
import {useAuth} from "../../firebase";
import {Add, Delete, Edit, MoreVert} from "@mui/icons-material";
import {capitalize, getFirstName, getMetadataTitle, StatusAction, StatusIcon} from './common';
import SearchBar from '../../components/SearchBar';
import ViewOnlyAlert from "../../components/ViewOnlyAlert";
import UserPhoto from "../../components/UserPhoto";
import Alert from "../../components/Alert";

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);

    const {roles} = useAuth();

    const loadEvents = async () => {
        try {
            setLoaded(false);
            const eventsRes = await apiClient.get<Event[]>(apiUrls.events.list);
            setEvents(eventsRes.data);
            setFilteredEvents(eventsRes.data);
            setLoaded(true);
        } catch (e) {
            // TODO: Send error noti/alert
            console.error("Error fetching events", e);
        }
    }

    useEffect(() => {
        loadEvents();
    }, []);

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
        <section className="Events schgrid__wrapper flex-vert-gap1">
            <h1>Events</h1>
            <div className="schgrid__actions">
                {roles.contentManager
                    ? <button className="icon-n-text" onClick={handleCreate}><Add/> Create</button>
                    : <ViewOnlyAlert/>}
                <SearchBar onSearch={handleSearch}/>
            </div>
            {!loaded && <Alert type="loading">Loading events...</Alert> }
            <div className="schgrid__filter-info">
                {loaded && (filteredEvents.length !== 0
                    ? `Showing ${filteredEvents.length} of ${events.length} events`
                    : events.length === 0 ? "There are not yet any events." : "No events found.")}
            </div>
            <div className="schgrid">
                {filteredEvents.map((event) => (
                    <EventItem key={"event" + event.id} event={event} showOptions={roles.contentManager}/>
                ))}
            </div>
        </section>
    );
}

function EventItem({showOptions, ...props}: { event: Event; showOptions: boolean; }) {
    const [event, setEvent] = useState<Event>(props.event);

    async function handleStatusAction(status: Status) {
        try {
            event.status = status === "draft" || status === "archived" ? "published" : "archived";
            const res = await apiClient.put<Event>(apiUrls.events.update(event.id), event)
            setEvent(res.data);
        } catch (e) {
            // TODO: Send error noti/alert
            console.error("Error updating event", e);
        }
    }

    return (
        <article className="schgrid__item">
            <div className="schgrid__item__top-bar">
                <div className="schgrid__item__top-bar-el1">
                    <div className="schgrid__item__status" title={capitalize(event.status)}>
                        <StatusIcon status={event.status}/>
                    </div>

                    <div className="schgrid__item__metadata"
                         title={getMetadataTitle(event.metadata.createdBy, event.metadata.updatedBy)}>
                        <UserPhoto user={event.metadata.createdBy}
                                   alt={`Created by ${event.metadata.createdBy.displayName}`}/>
                        <span>{getFirstName(event.metadata.createdBy.displayName)}</span>

                        {(event.metadata.createdBy.uid !== event.metadata.updatedBy.uid) && (
                            <>
                                <UserPhoto user={event.metadata.updatedBy}
                                           alt={`Updated by ${event.metadata.updatedBy.displayName}`}/>
                                <span>{getFirstName(event.metadata.updatedBy.displayName)}</span>
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
