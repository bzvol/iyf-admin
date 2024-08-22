import './styles/CreateEvent.scss';
import {useNotifications} from "../../utils";
import {Link, useNavigate} from "react-router-dom";
import React, {useRef} from "react";
import {ArrowBack} from "@mui/icons-material";
import ContentEditor, {ContentEditorState} from "../../components/content-editor/ContentEditor";
import apiUrls, {apiClient} from "../../api";
import LocationField from "../../components/content-editor/LocationField";
import StartEndTimeFields, {StartEndTimeRefs} from "../../components/content-editor/StartEndTimeFields";

export default function CreateEvent() {
    const locRef = useRef<HTMLInputElement>(null);
    const timeRefs = useRef<StartEndTimeRefs>(null);

    const withNoti = useNotifications();
    const navigate = useNavigate();

    const handleSubmit = (state: ContentEditorState) => withNoti({
        type: 'loading',
        messages: {
            loading: 'Creating event...',
            success: 'Event created successfully',
            error: 'Failed to create event'
        },
        action: async () => {
            let location: string | null | undefined = locRef.current?.value;
            location = !location || location === '' ? null : location;
            let startTime: string | null | undefined = timeRefs.current?.start.value;
            startTime = !startTime || startTime === '' ? null : startTime;
            let endTime: string | null | undefined = timeRefs.current?.end.value;
            endTime = !endTime || endTime === '' ? null : endTime

            return apiClient.post(apiUrls.events.create, {
                title: state.title, details: state.content,
                schedule: {startTime, endTime, location}
            });
        },
        onSuccess: () => navigate('/iyf/events')
    });

    return (
        <div className="CreateEvent">
            <Link to="/iyf/events">
                <button className="icon-n-text"><ArrowBack/> Back to events</button>
            </Link>
            <ContentEditor
                onSubmit={handleSubmit}
                before={<div className="ContentEditor__schedule">
                    <LocationField ref={locRef}/>
                    <StartEndTimeFields ref={timeRefs}/>
                </div>}
            />
        </div>
    );
}
