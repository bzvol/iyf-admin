import './styles/EditRegularEvent.scss';
import {Link, useLocation, useNavigate} from "react-router-dom";
import apiUrls, {apiClient, RegularEvent} from "../../api";
import React, {useEffect, useRef} from "react";
import {parseISO, useNotifications} from "../../utils";
import ContentEditor, {ContentEditorState} from "../../components/content-editor/ContentEditor";
import {ArrowBack} from "@mui/icons-material";
import LocationField from "../../components/content-editor/LocationField";
import TimeField from "../../components/content-editor/TimeField";

export default function EditRegularEvent() {
    const {state: event} = useLocation() as { state: RegularEvent };

    const locRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);

    const withNoti = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        if (locRef.current && event.schedule.location) locRef.current.value = event.schedule.location;
        if (timeRef.current && event.schedule.time) timeRef.current.value = event.schedule.time;
    }, [event.schedule]);

    const handleSubmit = (state: ContentEditorState) => withNoti({
        type: 'loading',
        messages: {
            loading: 'Submitting regular event edit...',
            success: 'Regular event edit submitted successfully',
            error: 'Failed to submit regular event edit'
        },
        action: async () => {
            let location: string | null | undefined = locRef.current?.value;
            location = !location || location === '' ? null : location;
            let time: string | null | undefined = timeRef.current?.value;
            time = !time || time === '' ? null : time;

            return apiClient.put(apiUrls.regularEvents.update(event.id), {
                title: state.title, details: state.content,
                schedule: {time, location}
            });
        },
        onSuccess: () => navigate('/iyf/regular')
    });

    return (
        <div className="EditRegularEvent">
            <Link to="/iyf/regular">
                <button className="icon-n-text"><ArrowBack/> Back to regular events</button>
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
                    <TimeField ref={timeRef}/>
                </div>}
            />
        </div>
    );
}
