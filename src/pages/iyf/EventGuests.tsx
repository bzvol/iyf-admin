import './styles/EventGuests.scss';
import {Link, useLocation} from "react-router-dom";
import apiUrls, {apiClient, Event, EventGuest} from "../../api";
import {createTriggerContext, parseISO, useCreateTrigger, useNotifications, useTrigger} from "../../utils";
import React, {useEffect, useMemo, useRef, useState} from "react";
import Alert from "../../components/Alert";
import {ArrowBack, Delete, Edit} from "@mui/icons-material";
import {useMediaQuery} from "@mui/material";
import ConfirmationModal from "../../components/ConfirmationModal";
import Modal from "../../components/Modal";
import Bugsnag from "@bugsnag/js";

const GuestsTrigger = createTriggerContext();

export default function EventGuests() {
    const {state: event} = useLocation() as { state: Event };
    const desc = useMemo(() => getEventDesc(event), [event]);

    const [guests, setGuests] = useState<EventGuest[]>([]);
    const [loaded, setLoaded] = useState(false);

    const addNotification = useNotifications();
    const {trigger, triggerVal} = useCreateTrigger();

    const xlScreen = useMediaQuery('(min-width: 1200px)');

    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient.get<EventGuest[]>(apiUrls.events.guests.list(event.id));
                setGuests(res.data);
                setLoaded(true);
            } catch (e) {
                addNotification({
                    type: "error",
                    message: "Failed to load guests",
                });
                if (e instanceof Error) Bugsnag.notify(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerVal]);

    return (
        <section className="EventGuests flex-vert-gap1">
            <h1>Guests</h1>
            <div className="EventGuests__event-info">
                <h2>{event.title}</h2> {desc && <span>{desc}</span>}
            </div>
            <Link to="/iyf/events">
                <button className="icon-n-text"><ArrowBack/> Back to events</button>
            </Link>
            {!loaded && <Alert type="loading">Loading guests...</Alert>}
            {loaded && <div className="EventGuests__guests-info">
                {guests.length === 0
                    ? "There are no guests registered for this event."
                    : "Number of guests: " + guests.length}
            </div>}
            <GuestsTrigger.Provider value={trigger}>
                {loaded && guests.length > 0 &&
                    <table className="EventGuests__guests">
                        {xlScreen && <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Age</th>
                            <th>Where from</th>
                            <th>Heard from</th>
                            <th>Custom fields</th>
                            <th>Registered at</th>
                            <th>Actions</th>
                        </tr>
                        </thead>}
                        <tbody>
                        {guests.map(guest => <GuestItem
                            key={"guest-" + guest.id} guest={guest}
                            eventId={event.id} xlScreen={xlScreen}/>)}
                        </tbody>
                    </table>}
            </GuestsTrigger.Provider>
        </section>
    );
}

function getEventDesc(event: Event) {
    const locntime = [];

    if (event.schedule.location) locntime.push(event.schedule.location);

    const time = [];
    if (event.schedule.startTime) time.push(parseISO(event.schedule.startTime));
    if (event.schedule.endTime) time.push(parseISO(event.schedule.endTime));
    if (time.length > 0) locntime.push(time.join(" - "));

    return locntime.join(", ");
}

interface GuestItemProps {
    guest: EventGuest;
    eventId: number;
    xlScreen: boolean;
}

function GuestItem({guest, eventId, xlScreen}: GuestItemProps) {
    const customFields = useMemo(() => Object.entries(guest.custom), [guest.custom]);

    return xlScreen
        ? (<tr>
            <td>{guest.name || <b>---</b>}</td>
            <td>{guest.email || <b>---</b>}</td>
            <td>{guest.phone || <b>---</b>}</td>
            <td>{guest.age || <b>---</b>}</td>
            <td>{guest.city || <b>---</b>}</td>
            <td>{guest.source || <b>---</b>}</td>
            <GuestCustomFields fields={customFields}/>
            <td>{parseISO(guest.createdAt)} (UTC)</td>
            <GuestActions guest={guest} eventId={eventId}/>
        </tr>)
        : (<>
            <tr>
                <td>Name</td>
                <td>{guest.name || <b>---</b>}</td>
            </tr>
            <tr>
                <td>Email</td>
                <td>{guest.email || <b>---</b>}</td>
            </tr>
            <tr>
                <td>Phone</td>
                <td>{guest.phone || <b>---</b>}</td>
            </tr>
            <tr>
                <td>Age</td>
                <td>{guest.age || <b>---</b>}</td>
            </tr>
            <tr>
                <td>Where from</td>
                <td>{guest.city || <b>---</b>}</td>
            </tr>
            <tr>
                <td>Heard from</td>
                <td>{guest.source || <b>---</b>}</td>
            </tr>
            <tr>
                <td>Custom fields</td>
                <GuestCustomFields fields={customFields}/>
            </tr>
            <tr>
                <td>Registered at</td>
                <td>{parseISO(guest.createdAt)} (UTC)</td>
            </tr>
            <tr>
                <td>Actions</td>
                <GuestActions guest={guest} eventId={eventId}/>
            </tr>
        </>);
}

interface GuestCustomFieldsProps {
    fields: [string, string][]
}

function GuestCustomFields({fields}: GuestCustomFieldsProps) {
    return (
        <td className="GuestItem__custom-fields">
            <div>
                {fields.map(([key, value]) => (
                    <span key={key} className="GuestItem__custom-field">
                    <b>{key}</b>: {value || <b>---</b>}
                </span>
                ))}
            </div>
        </td>
    );
}

interface GuestActionsProps {
    guest: EventGuest,
    eventId: number
}

function GuestActions({guest, eventId}: GuestActionsProps) {
    const withNoti = useNotifications();
    const trigger = useTrigger(GuestsTrigger);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfOpen, setDeleteConfOpen] = useState(false);

    const handleDelete = () => withNoti({
        type: "loading",
        messages: {
            loading: "Deleting guest...",
            success: "Guest deleted successfully",
            error: "Failed to delete guest"
        },
        action: async () => apiClient.delete(apiUrls.events.guests.delete(eventId, guest.id)),
        onSuccess: trigger
    });

    return (
        <td className="GuestItem__actions">
            <div>
                <button title="Edit guest's data" onClick={() => setEditModalOpen(true)}><Edit/></button>
                <button title="Delete guest" onClick={() => setDeleteConfOpen(true)}><Delete/></button>
                <ConfirmationModal
                    isOpen={deleteConfOpen}
                    onClose={() => setDeleteConfOpen(false)}
                    onConfirm={() => {
                        setDeleteConfOpen(false);
                        handleDelete();
                    }}
                    title="Delete guest"
                >
                    Are you sure you want to delete guest <b>{guest.name || guest.email || guest.phone}</b>?
                </ConfirmationModal>
                <EditGuestModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    guest={guest}
                />
            </div>
        </td>
    )
}

interface EditGuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    guest: EventGuest;
}

function EditGuestModal({isOpen, onClose, guest}: EditGuestModalProps) {
    const withNoti = useNotifications();
    const trigger = useTrigger(GuestsTrigger);

    const edit = {
        name: useRef<HTMLInputElement>(null),
        email: useRef<HTMLInputElement>(null),
        phone: useRef<HTMLInputElement>(null),
        city: useRef<HTMLInputElement>(null),
        source: useRef<HTMLInputElement>(null)
    };
    const age = useRef<HTMLInputElement>(null);
    const custom = useRef<[string, HTMLInputElement | null][]>([]);

    const handleEdit = () => withNoti({
        type: "loading",
        messages: {
            loading: "Updating guest...",
            success: "Guest updated successfully",
            error: "Failed to update guest"
        },
        action: async () => apiClient.put(apiUrls.events.guests.update(guest.eventId, guest.id), {
            ...Object.fromEntries(Object.entries(edit).map(([key, ref]) =>
                [key, ref.current?.value ? ref.current.value : null])),
            age: age.current?.value ? parseInt(age.current.value) : null,
            custom: Object.fromEntries(custom.current.map(([key, ref]) =>
                [key, ref?.value ? ref.value : null]))
        }),
        onSuccess: trigger
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="EditGuestModal">
                <h2>Edit guest's data</h2>
                <h3>{guest.name || guest.email || guest.phone}</h3>

                <form onSubmit={e => {
                    e.preventDefault();
                    onClose();
                    handleEdit();
                }}>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" ref={edit.name} placeholder="Name..."
                               defaultValue={guest.name || ""}/>
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" ref={edit.email} placeholder="Email..."
                               defaultValue={guest.email || ""}/>
                    </div>
                    <div>
                        <label htmlFor="phone">Phone</label>
                        <input type="tel" id="phone" ref={edit.phone} placeholder="Phone..."
                               defaultValue={guest.phone || ""}/>
                    </div>
                    <div>
                        <label htmlFor="age">Age</label>
                        <input type="number" id="age" ref={age} placeholder="Age..."
                               defaultValue={guest.age?.toString() || ""} min="0"/>
                    </div>
                    <div>
                        <label htmlFor="city">Where from</label>
                        <input type="text" id="city" ref={edit.city} placeholder="Where from..."
                               defaultValue={guest.city || ""}/>
                    </div>
                    <div>
                        <label htmlFor="source">Heard from</label>
                        <input type="text" id="source" ref={edit.source} placeholder="Heard from..."
                               defaultValue={guest.source || ""}/>
                    </div>

                    {Object.entries(guest.custom).map(([key, value]) => (
                        <div key={key}>
                            <label htmlFor={key}>{key}</label>
                            <input type="text" id={key}
                                   ref={el => custom.current.push([key, el])}
                                   placeholder={key + "..."} defaultValue={value || ""}/>
                        </div>
                    ))}

                    <button type="submit">Update</button>
                </form>
            </div>
        </Modal>
    )
}
