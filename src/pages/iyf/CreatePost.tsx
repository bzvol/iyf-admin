import './styles/CreatePost.scss';
import ContentEditor, {ContentEditorState} from "../../components/content-editor/ContentEditor";
import {Link, useNavigate} from "react-router-dom";
import {ArrowBack} from "@mui/icons-material";
import apiUrls, {apiClient} from "../../api";
import React, {useState} from "react";
import Tags from "../../components/content-editor/Tags";
import {useNotifications} from "../../utils";

export default function CreatePost() {
    const [tags, setTags] = useState<string[]>([]);

    const withNoti = useNotifications();
    const navigate = useNavigate();

    const handleSubmit = (state: ContentEditorState) => withNoti({
            type: 'loading',
            messages: {
                loading: 'Creating post...',
                success: 'Post created successfully.',
                error: 'Failed to create post.'
            },
            action: async () => apiClient.post(apiUrls.posts.create, {...state, tags}),
            onSuccess: () => navigate('/iyf/posts')
        });

    return (
        <div className="CreatePost">
            <Link to="/iyf/posts">
                <button className="icon-n-text"><ArrowBack/> Back to posts</button>
            </Link>
            <ContentEditor
                onSubmit={handleSubmit}
                after={<Tags tags={tags} setTags={setTags}/>}
            />
        </div>
    );
}
