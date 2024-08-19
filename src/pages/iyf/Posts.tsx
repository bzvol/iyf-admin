import './styles/Posts.scss';
import './styles/common.scss';
import apiUrls, {apiClient, Post, Status} from "../../api";
import React, {useEffect, useMemo, useState} from "react";
import {useAuth} from "../../firebase";
import {Add, Delete, Edit, MoreVert} from "@mui/icons-material";
import {capitalize, getFirstName, getMetadataTitle, StatusAction, StatusIcon} from './common';
import SearchBar from '../../components/SearchBar';
import UserPhoto from "../../components/UserPhoto";
import ViewOnlyAlert from "../../components/ViewOnlyAlert";
import Alert from "../../components/Alert";
import {Link, useNavigate} from "react-router-dom";
import {convertLexToPlain, createTriggerContext, useCreateTrigger, useNotifications, useTrigger} from "../../utils";
import ConfirmationModal from "../../components/ConfirmationModal";

const PostsTrigger = createTriggerContext();

export default function Posts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

    const addNotification = useNotifications();
    const {trigger, triggerVal} = useCreateTrigger();

    const {roles} = useAuth();

    useEffect(() => {
        (async () => {
            try {
                setLoaded(false);
                const postsRes = await apiClient.get<Post[]>(apiUrls.posts.list);
                setPosts(postsRes.data);
                setFilteredPosts(postsRes.data);
                setLoaded(true);
            } catch (e) {
                addNotification({
                    type: "error",
                    message: "Failed to load posts"
                });
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerVal]);

    // If there are more than 50 posts, the filter will
    // only be applied 500ms after the user stops typing.
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const handleSearch = (query: string) => {
        if (searchTimeout) clearTimeout(searchTimeout);

        if (!query || query.length < 3) {
            if (filteredPosts.length !== posts.length) setFilteredPosts(posts);
            return;
        }

        if (posts.length > 50) {
            const timeout = setTimeout(() => filterPosts(query), 500);
            setSearchTimeout(timeout);
        } else filterPosts(query);
    }

    const filterPosts = (query: string) => {
        const q = query.trim().toLowerCase();
        setFilteredPosts(posts.filter(post =>
            post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)));
    }

    return (
        <section className="Posts schgrid__wrapper flex-vert-gap1">
            <h1>Posts</h1>
            <div className="schgrid__actions">
                {roles.contentManager
                    ? <Link to="/iyf/posts/create">
                        <button className="icon-n-text"><Add/> Create</button>
                    </Link>
                    : <ViewOnlyAlert/>}
                <SearchBar onSearch={handleSearch}/>
            </div>
            {!loaded && <Alert type="loading">Loading posts...</Alert>}
            <div className="schgrid__filter-info">
                {loaded && (filteredPosts.length !== 0
                    ? `Showing ${filteredPosts.length} of ${posts.length} posts`
                    : posts.length === 0 ? "There are not yet any posts." : "No posts found.")}
            </div>
            <PostsTrigger.Provider value={trigger}>
                <div className="schgrid">
                    {filteredPosts.map((post) => (
                        <PostItem key={"post" + post.id} post={post} showOptions={roles.contentManager}/>
                    ))}
                </div>
            </PostsTrigger.Provider>
        </section>
    );
}

interface PostItemProps {
    post: Post;
    showOptions: boolean;
}

function PostItem({post, showOptions}: PostItemProps) {
    const plainText = useMemo(() => convertLexToPlain(post.content), [post.content])

    const withNoti = useNotifications();
    const trigger = useTrigger(PostsTrigger);
    const navigate = useNavigate();

    const [deleteConfOpen, setDeleteConfOpen] = useState(false);
    const [statusActionConfOpen, setStatusActionConfOpen] = useState(false);

    const handleDelete = () => withNoti({
        type: "loading",
        messages: {
            loading: "Deleting post...",
            success: "Post deleted successfully",
            error: "Failed to delete post"
        },
        action: async () => {
            await apiClient.delete(apiUrls.posts.delete(post.id));
            trigger();
        }
    });

    const handleStatusAction = () => withNoti({
        type: "loading",
        messages: {
            loading: (post.status === "published" ? "Archiving" : "Publishing") + " post...",
            success: "Post " + (post.status === "published" ? "archived" : "published") + " successfully",
            error: "Failed to " + (post.status === "published" ? "archive" : "publish") + " post"
        },
        action: async () => {
            const newStatus: Status = post.status === "published" ? "archived" : "published";
            await apiClient.put(apiUrls.posts.update(post.id), {...post, status: newStatus});
            trigger();
        }
    });

    return (
        <article className="schgrid__item">
            <div className="schgrid__item__top-bar">
                <div className="schgrid__item__top-bar-el1">
                    <div className="schgrid__item__status" title={capitalize(post.status)}>
                        <StatusIcon status={post.status}/>
                    </div>

                    <div className="schgrid__item__metadata"
                         title={getMetadataTitle(post.metadata.createdBy, post.metadata.updatedBy)}>
                        <UserPhoto user={post.metadata.createdBy}
                                   alt={`Created by ${post.metadata.createdBy.displayName}`}/>
                        <span>{getFirstName(post.metadata.createdBy.displayName)}</span>

                        {(post.metadata.createdBy.uid !== post.metadata.updatedBy.uid) && (
                            <>
                                <UserPhoto user={post.metadata.updatedBy}
                                           alt={`Updated by ${post.metadata.updatedBy.displayName}`}/>
                                <span>{getFirstName(post.metadata.updatedBy.displayName)}</span>
                            </>
                        )}
                    </div>
                </div>
                {showOptions && <div className="schgrid__item__options">
                    <MoreVert/>
                    <ul className="schgrid__item__options-menu">
                        <li onClick={() => navigate(`/iyf/posts/${post.id}/edit`, {state: post})}>
                            <div/>
                            <Edit/> Edit
                            <div/>
                        </li>
                        {post.status === "draft" &&
                            <li onClick={() => setDeleteConfOpen(true)}>
                                <div/>
                                <Delete/> Delete
                                <div/>
                            </li>}
                        <li onClick={() => setStatusActionConfOpen(true)}>
                            <div/>
                            <StatusAction status={post.status}/>
                            <div/>
                        </li>
                    </ul>
                </div>}
            </div>

            <h2>{post.title}</h2>
            <p>{plainText}</p>

            <ConfirmationModal
                isOpen={deleteConfOpen}
                onClose={() => setDeleteConfOpen(false)}
                onConfirm={() => {
                    setDeleteConfOpen(false);
                    handleDelete();
                }}
                title="Delete draft post"
            >
                Are you sure you want to delete this post? <b>This action cannot be undone.</b>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={statusActionConfOpen}
                onClose={() => setStatusActionConfOpen(false)}
                onConfirm={() => {
                    setStatusActionConfOpen(false);
                    handleStatusAction();
                }}
                title={post.status === "published" ? "Archive post" : "Publish post"}
            >
                Are you sure you want to {post.status === "published" ? "archive" : "publish"} this post?
            </ConfirmationModal>
        </article>
    );
}
