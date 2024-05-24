import './styles/Posts.scss';
import './styles/common.scss';
import apiUrls, {httpClient, Post, Status} from "../../api";
import {useEffect, useState} from "react";
import {useAuth} from "../../firebase";
import {Add, Delete, Edit, MoreVert} from "@mui/icons-material";
import {capitalize, getFirstName, getMetadataTitle, StatusAction, StatusIcon} from './common';
import SearchBar from '../../components/SearchBar';
import UserPhoto from "../../components/UserPhoto";
import ViewOnlyAlert from "../../components/ViewOnlyAlert";

export default function Posts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

    const {roles} = useAuth();

    const loadPosts = async () => {
        try {
            setLoaded(false);
            const postsRes = await httpClient.get<Post[]>(apiUrls.posts.list);
            setPosts(postsRes.data);
            setFilteredPosts(postsRes.data);
            setLoaded(true);
        } catch (e) {
            // TODO: Send error noti/alert
            console.error("Error fetching posts", e);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

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
        <section className="Posts schgrid__wrapper">
            <h1>Posts</h1>
            <div className="schgrid__actions">
                {roles.contentManager
                    ? <button className="icon-n-text" onClick={handleCreate}><Add/> Create</button>
                    : <ViewOnlyAlert/>}
                <SearchBar onSearch={handleSearch}/>
            </div>
            <div className="schgrid__filter-info">
                {loaded
                    ? (filteredPosts.length !== 0
                        ? `Showing ${filteredPosts.length} of ${posts.length} posts`
                        : posts.length === 0 ? "There are not yet any posts." : "No posts found.")
                    : "Loading posts..."}
            </div>
            <div className="schgrid">
                {filteredPosts.map((post) => (
                    <PostItem key={"post" + post.id} post={post} showOptions={roles.contentManager}/>
                ))}
            </div>
        </section>
    );
}

function PostItem({showOptions, ...props}: { post: Post; showOptions: boolean; }) {
    const [post, setPost] = useState<Post>(props.post);

    async function handleStatusAction(status: Status) {
        try {
            post.status = status === "draft" || status === "archived" ? "published" : "archived";
            const res = await httpClient.put<Post>(apiUrls.posts.update(post.id), post)
            setPost(res.data);
        } catch (e) {
            // TODO: Send error noti/alert
            console.error("Error updating post", e);
        }
    }

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
                        <li onClick={() => console.log("Editing post " + post.id)}>
                            <div/>
                            <Edit/> Edit
                            <div/>
                        </li>
                        <li onClick={() => console.log("Deleting post " + post.id)}>
                            <div/>
                            <Delete/> Delete
                            <div/>
                        </li>
                        <li onClick={() => handleStatusAction(post.status)}>
                            <div/>
                            <StatusAction status={post.status}/>
                            <div/>
                        </li>
                    </ul>
                </div>}
            </div>

            <h2>{post.title}</h2>
            <p>{post.content}</p>
        </article>
    );
}

// TODO: Implement create
function handleCreate() {
    console.log("Creating new post");
}
