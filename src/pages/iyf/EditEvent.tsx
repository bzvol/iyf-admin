import './styles/EditEvent.scss';
import React, {useEffect, useRef} from "react";
import StartEndTimeFields, {StartEndTimeRefs} from "../../components/content-editor/StartEndTimeFields";
import {parseISO, useNotifications} from "../../utils";
import {Link, useLocation, useNavigate} from "react-router-dom";
import ContentEditor, {ContentEditorState} from "../../components/content-editor/ContentEditor";
import apiUrls, {apiClient, Event} from "../../api";
import {ArrowBack} from "@mui/icons-material";
import LocationField from "../../components/content-editor/LocationField";

export function EditEvent() {
    const {state: event} = useLocation() as { state: Event };

    const locRef = useRef<HTMLInputElement>(null);
    const timeRefs = useRef<StartEndTimeRefs>(null);

    const withNoti = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        if (locRef.current && event.schedule.location) locRef.current.value = event.schedule.location;
        if (!timeRefs.current) return;
        if (event.schedule.startTime) timeRefs.current.start.value = event.schedule.startTime;
        if (event.schedule.endTime) timeRefs.current.end.value = event.schedule.endTime;
    }, [event.schedule]);

    const handleSubmit = (state: ContentEditorState) => withNoti({
        type: 'loading',
        messages: {
            loading: 'Submitting event edit...',
            success: 'Event edit submitted successfully',
            error: 'Failed to submit event edit'
        },
        action: async () => {
            let location: string | null | undefined = locRef.current?.value;
            location = !location || location === '' ? null : location;
            let startTime: string | null | undefined = timeRefs.current?.start.value;
            startTime = !startTime || startTime === '' ? null : startTime;
            let endTime: string | null | undefined = timeRefs.current?.end.value;
            endTime = !endTime || endTime === '' ? null : endTime

            return apiClient.put(apiUrls.events.update(event.id), {
                title: state.title, details: state.content,
                schedule: {startTime, endTime, location}
            });
        },
        onSuccess: () => navigate('/iyf/events')
    });

    return (
        <div className="EditEvent">
            <Link to="/iyf/events">
                <button className="icon-n-text"><ArrowBack/> Back to events</button>
            </Link>
            <div>
                <p>Created at {parseISO(event.metadata.createdAt)} (UTC) by {event.metadata.createdBy.displayName}</p>
                <p>Last updated at {parseISO(event.metadata.updatedAt)} (UTC) by {event.metadata.updatedBy.displayName}</p>
            </div>
            <ContentEditor
                onSubmit={handleSubmit}
                state={{title: event.title, content: event.details}}
                before={<div className="ContentEditor__schedule">
                    <LocationField ref={locRef}/>
                    <StartEndTimeFields ref={timeRefs}/>
                </div>}
            />
        </div>
    );
}
