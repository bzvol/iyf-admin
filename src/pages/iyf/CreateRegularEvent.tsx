import './styles/CreateRegularEvent.scss';
import React, {useRef} from "react";
import {useNotifications} from "../../utils";
import {Link, useNavigate} from "react-router-dom";
import ContentEditor, {ContentEditorState} from "../../components/content-editor/ContentEditor";
import apiUrls, {apiClient} from "../../api";
import {ArrowBack} from "@mui/icons-material";
import LocationField from "../../components/content-editor/LocationField";
import TimeField from "../../components/content-editor/TimeField";

export default function CreateRegularEvent() {
    const locRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);

    const withNoti = useNotifications();
    const navigate = useNavigate();

    const handleSubmit = (state: ContentEditorState) => withNoti({
        type: 'loading',
        messages: {
            loading: 'Creating regular event...',
            success: 'Regular event created successfully',
            error: 'Failed to create regular event'
        },
        action: async () => {
            let location: string | null | undefined = locRef.current?.value;
            location = !location || location === '' ? null : location;
            let time: string | null | undefined = timeRef.current?.value;
            time = !time || time === '' ? null : time;

            return apiClient.post(apiUrls.regularEvents.create, {
                title: state.title, details: state.content,
                schedule: {time, location}
            });
        },
        onSuccess: () => navigate('/iyf/regular')
    });

    return (
        <div className="CreateRegularEvent">
            <Link to="/iyf/regular">
                <button className="icon-n-text"><ArrowBack/> Back to regular events</button>
            </Link>
            <ContentEditor
                onSubmit={handleSubmit}
                before={<div className="ContentEditor__schedule">
                    <LocationField ref={locRef}/>
                    <TimeField ref={timeRef}/>
                </div>}
            />
        </div>
    );
}
