import './styles/CreatePost.scss';
import ContentEditor, {ContentEditorState} from "../../components/content-editor/ContentEditor";
import {Link, useNavigate} from "react-router-dom";
import {ArrowBack} from "@mui/icons-material";
import apiUrls, {apiClient} from "../../api";
import {useContext} from "react";
import {NotificationsContext} from "../../components/sidebar/Notifications";

export default function CreatePost() {
    const {addNotification: withNoti} = useContext(NotificationsContext);
    const navigate = useNavigate();

    const handleSubmit = (state: ContentEditorState) => {
        withNoti({
            type: 'loading',
            messages: {
                loading: 'Creating post...',
                success: 'Post created successfully.',
                error: 'Failed to create post.'
            },
            action: async () => apiClient.post(apiUrls.posts.create, {...state, tags: []})
        });
        setTimeout(() => navigate('/iyf/posts'), 5000);
    };

    return (
        <div className="CreatePost">
            <Link to="/iyf/posts">
                <button className="icon-n-text"><ArrowBack/> Back to posts</button>
            </Link>
            <ContentEditor onSubmit={handleSubmit}/>
        </div>
    );
}
