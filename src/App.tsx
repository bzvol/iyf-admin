import './App.scss';
import {useAuth} from "./firebase";
import {createBrowserRouter, RouterProvider, useRouteError} from "react-router-dom";
import axios from "axios";
import apiUrls, {makeBearer} from "./api";
import Root from "./pages/Root";
import Posts from "./pages/iyf/Posts";
import {useEffect} from "react";
import Events from "./pages/iyf/Events";
import IAM from "./pages/IAM";

export default function App() {
    useEffect(() => {
        setPerfectHeight();
        window.addEventListener('resize', setPerfectHeight);
    }, []);

    const {user} = useAuth();

    // FirstCache.clear();

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root/>,
            loader: async () => await FirstCache.cache("home",
                async () => axios.get(apiUrls.info.counts)),
            children: [
                {
                    path: "/iam",
                    element: <IAM/>,
                    loader: async () => await axios.get(apiUrls.users.list, await makeBearer(user!))
                },
                {
                    path: "/iyf",
                    children: [
                        {
                            path: "/iyf/homepage",
                            element: <h1>Homepage</h1>
                        },
                        {
                            path: "/iyf/posts",
                            element: <Posts/>,
                            loader: async () => await axios.get(apiUrls.posts.list)
                        },
                        {
                            path: "/iyf/events",
                            element: <Events/>,
                            loader: async () => await axios.get(apiUrls.events.list)
                        },
                        {
                            path: "/iyf/regular",
                            element: <h1>Regular Events</h1>,
                            loader: async () => await axios.get(apiUrls.regularEvents.list)
                        }
                    ]
                },
            ],
            errorElement: <ErrorBoundary/>
        }
    ]);

    return <RouterProvider router={router}/>;
}

function ErrorBoundary() {
    const error = useRouteError() as { status?: number };

    return (
        <div style={{margin: "1rem", display: "inline-flex", flexDirection: "column", gap: "1rem"}}>
            {(error.status && error.status === 404)
                ? <h1>Page not found</h1>
                : <h1>Something went wrong</h1>}

            <button onClick={() => window.location.href = "/"}>Go back to home</button>
        </div>
    )
}

// "Debouncing" loaders (strict mode sends multiple requests)
class FirstCache {
    private static _cache: Record<string, Promise<any>> = {};

    static async cache(key: string, loader: () => Promise<any>) {
        if (this._cache[key] === undefined) {
            this._cache[key] = loader().catch(error => {
                delete this._cache[key];
                throw error;
            })
        }

        return this._cache[key];
    }

    static clear() {
        this._cache = {};
    }
}

function setPerfectHeight() {
    const html = document.documentElement,
        body = document.body;
    const height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
    document.documentElement.style.height = document.body.style.height = `${height}px`;
}
