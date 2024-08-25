import './styles/EditPost.scss';
import React, {useState} from "react";
import {parseISO, useNotifications} from "../../utils";
import {Link, useLocation, useNavigate} from "react-router-dom";
import ContentEditor, {ContentEditorState} from "../../components/content-editor/ContentEditor";
import apiUrls, {apiClient, Post} from "../../api";
import {ArrowBack} from "@mui/icons-material";
import Tags from "../../components/content-editor/Tags";

export default function EditPost() {
    const {state: post} = useLocation() as {state: Post};

    const [tags, setTags] = useState<string[]>(post.tags);

    const withNoti = useNotifications();
    const navigate = useNavigate();

    const handleSubmit = (state: ContentEditorState) => withNoti({
            type: 'loading',
            messages: {
                loading: 'Submitting post edit...',
                success: 'Post edit submitted successfully',
                error: 'Failed to submit post edit'
            },
            action: async () => apiClient.put(apiUrls.posts.update(post.id), {...state, tags}),
            onSuccess: () => navigate('/iyf/posts')
        });

    return (
        <div className="EditPost">
            <Link to="/iyf/posts">
                <button className="icon-n-text"><ArrowBack/> Back to posts</button>
            </Link>
            <div>
                <p>Created at {parseISO(post.metadata.createdAt)} (UTC) by {post.metadata.createdBy.displayName}</p>
                <p>Last updated at {parseISO(post.metadata.updatedAt)} (UTC) by {post.metadata.updatedBy.displayName}</p>
            </div>
            <ContentEditor
                onSubmit={handleSubmit}
                state={post}
                after={<Tags tags={tags} setTags={setTags}/>}
            />
        </div>
    );
}
