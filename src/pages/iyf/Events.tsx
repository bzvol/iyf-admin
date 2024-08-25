import './styles/Events.scss';
import './styles/common.scss';
import apiUrls, {apiClient, Event, Status} from "../../api";
import {useEffect, useMemo, useState} from "react";
import {useAuth} from "../../firebase";
import {
    AccessTimeFilled as StartTime,
    Add,
    Delete,
    Edit,
    LocationOn,
    MoreVert, PeopleAlt,
    Update as EndTime
} from "@mui/icons-material";
import {capitalize, getFirstName, getMetadataTitle, StatusAction, StatusIcon} from './common';
import SearchBar from '../../components/SearchBar';
import ViewOnlyAlert from "../../components/ViewOnlyAlert";
import UserPhoto from "../../components/UserPhoto";
import Alert from "../../components/Alert";
import {
    convertLexToPlain,
    createTriggerContext,
    parseISO,
    useCreateTrigger,
    useNotifications,
    useTrigger
} from "../../utils";
import {Link, useNavigate} from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal";
import Bugsnag from "@bugsnag/js";

const EventsTrigger = createTriggerContext();

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);

    const addNotification = useNotifications();
    const {trigger, triggerVal} = useCreateTrigger();

    const {roles} = useAuth();

    useEffect(() => {
        (async () => {
            try {
                setLoaded(false);
                const eventsRes = await apiClient.get<Event[]>(apiUrls.events.list);
                setEvents(eventsRes.data);
                setFilteredEvents(eventsRes.data);
                setLoaded(true);
            } catch (e) {
                addNotification({
                    type: "error",
                    message: "Failed to load events"
                });
                if (e instanceof Error) Bugsnag.notify(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerVal]);

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
                    ? <Link to="/iyf/events/create">
                        <button className="icon-n-text"><Add/> Create</button>
                    </Link>
                    : <ViewOnlyAlert/>}
                <SearchBar onSearch={handleSearch}/>
            </div>
            {!loaded && <Alert type="loading">Loading events...</Alert>}
            <div className="schgrid__filter-info">
                {loaded && (filteredEvents.length !== 0
                    ? `Showing ${filteredEvents.length} of ${events.length} events`
                    : events.length === 0 ? "There are not yet any events." : "No events found.")}
            </div>
            <EventsTrigger.Provider value={trigger}>
                <div className="schgrid">
                    {filteredEvents.map((event) => (
                        <EventItem
                            key={"event" + event.id} event={event}
                            showOptions={roles.contentManager}
                            showGuests={roles.guestManager}
                        />
                    ))}
                </div>
            </EventsTrigger.Provider>
        </section>
    );
}

interface EventItemProps {
    event: Event;
    showOptions: boolean;
    showGuests: boolean;
}

function EventItem({event, showOptions, showGuests}: EventItemProps) {
    const plainText = useMemo(() => convertLexToPlain(event.details), [event.details])
    const showSchedule = event.schedule.location || event.schedule.startTime || event.schedule.endTime;

    const [deleteConfOpen, setDeleteConfOpen] = useState(false);
    const [statusActionConfOpen, setStatusActionConfOpen] = useState(false);

    const withNoti = useNotifications();
    const trigger = useTrigger(EventsTrigger);
    const navigate = useNavigate();

    const handleDelete = () => withNoti({
        type: "loading",
        messages: {
            loading: "Deleting event...",
            success: "Event deleted successfully",
            error: "Failed to delete event"
        },
        action: async () => {
            await apiClient.delete(apiUrls.events.delete(event.id));
            trigger();
        }
    })

    const handleStatusAction = () => withNoti({
        type: "loading",
        messages: {
            loading: (event.status === "published" ? "Archiving" : "Publishing") + " event...",
            success: "Event " + (event.status === "published" ? "archived" : "published") + " successfully",
            error: "Failed to " + (event.status === "published" ? "archive" : "publish") + " event"
        },
        action: async () => {
            const newStatus: Status = event.status === "published" ? "archived" : "published";
            await apiClient.put(apiUrls.events.update(event.id), {...event, status: newStatus});
            trigger();
        }
    })

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
                <div className="schgrid__item__top-bar-el2">
                    {showGuests && <Link className="EventItem__guests-btn" title="View guests"
                                         to={`/iyf/events/${event.id}/guests`} state={event}><PeopleAlt/></Link>}
                    {showOptions && <div className="schgrid__item__options">
                        <MoreVert/>
                        <ul className="schgrid__item__options-menu">
                            <li onClick={() => navigate(`/iyf/events/${event.id}/edit`, {state: event})}>
                                <div/>
                                <Edit/> Edit
                                <div/>
                            </li>
                            {event.status === "draft" &&
                                <li onClick={() => setDeleteConfOpen(true)}>
                                    <div/>
                                    <Delete/> Delete
                                    <div/>
                                </li>}
                            <li onClick={() => setStatusActionConfOpen(true)}>
                                <div/>
                                <StatusAction status={event.status}/>
                                <div/>
                            </li>
                        </ul>
                    </div>}
                </div>
            </div>

            <h2>{event.title}</h2>
            <p>{plainText}</p>

            {showSchedule &&
                <div className="EventItem__schedule">
                    {event.schedule.location &&
                        <div className="icon-n-text"><LocationOn/> {event.schedule.location}</div>}
                    {event.schedule.startTime &&
                        <div className="icon-n-text"><StartTime/> {parseISO(event.schedule.startTime)}</div>}
                    {event.schedule.endTime &&
                        <div className="icon-n-text"><EndTime/> {parseISO(event.schedule.endTime)}</div>}
                </div>}

            <ConfirmationModal
                isOpen={deleteConfOpen}
                onClose={() => setDeleteConfOpen(false)}
                onConfirm={() => {
                    setDeleteConfOpen(false);
                    handleDelete();
                }}
                title="Delete draft event"
            >
                Are you sure you want to delete this event? <b>This action cannot be undone.</b>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={statusActionConfOpen}
                onClose={() => setStatusActionConfOpen(false)}
                onConfirm={() => {
                    setStatusActionConfOpen(false);
                    handleStatusAction()
                }}
                title={(event.status === "published" ? "Archive" : "Publish") + " event"}
            >
                Are you sure you want to {event.status === "published" ? "archive" : "publish"} this event?
            </ConfirmationModal>
        </article>
    );
}
