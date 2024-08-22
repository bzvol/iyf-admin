import './styles/RegularEvents.scss';
import {convertLexToPlain, createTriggerContext, useCreateTrigger, useNotifications, useTrigger} from "../../utils";
import {useEffect, useMemo, useState} from "react";
import apiUrls, {apiClient, RegularEvent, Status} from "../../api";
import {useAuth} from "../../firebase";
import {Link, useNavigate} from "react-router-dom";
import {AccessTimeFilled as Time, Add, Delete, Edit, LocationOn, MoreVert} from "@mui/icons-material";
import ViewOnlyAlert from "../../components/ViewOnlyAlert";
import SearchBar from "../../components/SearchBar";
import Alert from "../../components/Alert";
import {capitalize, getFirstName, getMetadataTitle, StatusAction, StatusIcon} from "./common";
import UserPhoto from "../../components/UserPhoto";
import ConfirmationModal from "../../components/ConfirmationModal";

const RegularEventsTrigger = createTriggerContext();

export default function RegularEvents() {
    const [events, setEvents] = useState<RegularEvent[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<RegularEvent[]>([]);

    const addNotification = useNotifications();
    const {trigger, triggerVal} = useCreateTrigger();

    const {roles} = useAuth();

    useEffect(() => {
        (async () => {
            try {
                setLoaded(false);
                const eventsRes = await apiClient.get<RegularEvent[]>(apiUrls.regularEvents.list);
                setEvents(eventsRes.data);
                setFilteredEvents(eventsRes.data);
                setLoaded(true);
            } catch (e) {
                addNotification({
                    type: "error",
                    message: "Failed to load regular events"
                });
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
        <section className="RegularEvents schgrid__wrapper flex-vert-gap1">
            <h1>Regular events</h1>
            <div className="schgrid__actions">
                {roles.contentManager
                    ? <Link to="/iyf/regular/create">
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
            <RegularEventsTrigger.Provider value={trigger}>
                <div className="schgrid">
                    {filteredEvents.map((event) => (
                        <RegularEventItem key={"event" + event.id} event={event} showOptions={roles.contentManager}/>
                    ))}
                </div>
            </RegularEventsTrigger.Provider>
        </section>
    );
}

interface RegularEventItemProps {
    event: RegularEvent;
    showOptions: boolean;
}

function RegularEventItem({event, showOptions}: RegularEventItemProps) {
    const plainText = useMemo(() => convertLexToPlain(event.details), [event.details]);
    const showSchedule = event.schedule.location || event.schedule.time

    const [deleteConfOpen, setDeleteConfOpen] = useState(false);
    const [statusActionConfOpen, setStatusActionConfOpen] = useState(false);

    const withNoti = useNotifications();
    const trigger = useTrigger(RegularEventsTrigger);
    const navigate = useNavigate();

    const handleDelete = () => withNoti({
        type: "loading",
        messages: {
            loading: "Deleting regular event...",
            success: "Regular event deleted successfully",
            error: "Failed to delete regular event"
        },
        action: async () => {
            await apiClient.delete(apiUrls.regularEvents.delete(event.id));
            trigger();
        }
    });

    const handleStatusAction = () => withNoti({
        type: "loading",
        messages: {
            loading: (event.status === "published" ? "Archiving" : "Publishing") + " regular event...",
            success: "Regular event " + (event.status === "published" ? "archived" : "published") + " successfully",
            error: "Failed to " + (event.status === "published" ? "archive" : "publish") + " regular event"
        },
        action: async () => {
            const newStatus: Status = event.status === "published" ? "archived" : "published";
            await apiClient.put(apiUrls.regularEvents.update(event.id), {...event, status: newStatus});
            trigger();
        }
    });

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
                        <li onClick={() => navigate(`/iyf/regular/${event.id}/edit`, {state: event})}>
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

            <h2>{event.title}</h2>
            <p>{plainText}</p>

            {showSchedule &&
                <div className="RegularEventItem__schedule">
                    {event.schedule.location &&
                        <div className="icon-n-text"><LocationOn/> {event.schedule.location}</div>}
                    {event.schedule.time &&
                        <div className="icon-n-text"><Time/> {event.schedule.time}</div>}
                </div>}

            <ConfirmationModal
                isOpen={deleteConfOpen}
                onClose={() => setDeleteConfOpen(false)}
                onConfirm={() => {
                    setDeleteConfOpen(false);
                    handleDelete();
                }}
                title="Delete draft regular event"
            >
                Are you sure you want to delete this regular event? <b>This action cannot be undone.</b>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={statusActionConfOpen}
                onClose={() => setStatusActionConfOpen(false)}
                onConfirm={() => {
                    setStatusActionConfOpen(false);
                    handleStatusAction()
                }}
                title={(event.status === "published" ? "Archive" : "Publish") + " regular event"}
            >
                Are you sure you want to {event.status === "published" ? "archive" : "publish"} this regular event?
            </ConfirmationModal>
        </article>
    );
}
