import './styles/Posts.scss';
import './styles/common.scss';
import axios, {AxiosResponse} from "axios";
import apiUrls, {makeBearer, Post, Status} from "../../api";
import {useEffect, useState} from "react";
import {useLoaderData} from "react-router-dom";
import {useAuth} from "../../firebase";
import {Add, Delete, Edit, MoreVert} from "@mui/icons-material";
import {capitalize, getFirstName, StatusAction, StatusIcon, unknownProfilePic} from './common';
import SearchBar from '../../component/SearchBar';
import Alert from "../../component/Alert";

export default function Posts() {
    const {data: posts} = useLoaderData() as AxiosResponse<Post[]>;
    const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

    const {user, roles} = useAuth();

    const [createdBy, setCreatedBy] = useState<(any)[]>([]);
    const [updatedBy, setUpdatedBy] = useState<(any)[]>([]);

    useEffect(() => {
        if (!user) return;
        // TODO: this only works if user is AM, needs to be updated to work with any admin
        makeBearer(user)
            .then(config => axios.get(apiUrls.users.list, config))
            .then(res => {
                const users = res.data as any[];
                setCreatedBy(posts.map(post =>
                    users.find(user => user.uid === post.metadata.createdBy)));
                setUpdatedBy(posts.map(post =>
                    users.find(user => user.uid === post.metadata.updatedBy)));
            });
    }, [posts, user]);

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
                    : <Alert type="info">You don't have permission to create or edit posts.</Alert>}
                <SearchBar onSearch={handleSearch}/>
            </div>
            <div className="schgrid__filter-info">
                {filteredPosts.length !== 0
                    ? `Showing ${filteredPosts.length} of ${posts.length} posts`
                    : posts.length === 0 ? "There are not yet any posts." : "No posts found."}
            </div>
            <div className="schgrid">
                {filteredPosts.reverse().map((post, idx) => (
                    <PostItem key={"post" + post.id} post={post}
                              createdBy={createdBy[idx]} updatedBy={updatedBy[idx]}
                              showOptions={roles.contentManager}/>
                ))}
            </div>
        </section>
    );
}

interface PostItemProps {
    post: Post;
    createdBy: any;
    updatedBy: any;
    showOptions: boolean;
}

function PostItem({createdBy, updatedBy, showOptions, ...props}: PostItemProps) {
    const [post, setPost] = useState<Post>(props.post);

    const {user} = useAuth();

    async function handleStatusAction(status: Status) {
        post.status = status === "draft" || status === "archived" ? "published" : "archived";
        const res = await axios.put(apiUrls.posts.update(post.id), post, await makeBearer(user!))
        if (res.status === 200) setPost(res.data as Post);
    }

    return (
        <article className="schgrid__item">
            <div className="schgrid__item__top-bar">
                <div className="schgrid__item__top-bar-el1">
                    <div className="schgrid__item__status" title={capitalize(post.status)}>
                        <StatusIcon status={post.status}/>
                    </div>

                    <div className="schgrid__item__metadata">
                        <img src={createdBy?.photoUrl || unknownProfilePic} alt="created by"
                             referrerPolicy="no-referrer"/>
                        <span>{getFirstName(createdBy?.displayName)}</span>
                        {(post.metadata.createdBy !== post.metadata.updatedBy) && (
                            <>
                                <img src={updatedBy?.photoUrl || unknownProfilePic} alt="updated by"
                                     referrerPolicy="no-referrer"/>
                                <span>{getFirstName(updatedBy?.displayName)}</span>
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
