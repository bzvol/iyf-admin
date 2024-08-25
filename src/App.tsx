import './App.scss';
import {createBrowserRouter, Link, RouterProvider, useRouteError} from "react-router-dom";
import Root from "./pages/Root";
import Posts from "./pages/iyf/Posts";
import {useEffect} from "react";
import Events from "./pages/iyf/Events";
import IAM from "./pages/IAM";
import CreatePost from "./pages/iyf/CreatePost";
import EditPost from "./pages/iyf/EditPost";
import CreateEvent from "./pages/iyf/CreateEvent";
import {EditEvent} from "./pages/iyf/EditEvent";
import RegularEvents from "./pages/iyf/RegularEvents";
import CreateRegularEvent from "./pages/iyf/CreateRegularEvent";
import EditRegularEvent from "./pages/iyf/EditRegularEvent";
import EventGuests from "./pages/iyf/EventGuests";

export const routes = [
    {
        path: "/",
        element: <Root/>,
        children: [
            {
                path: "/iam",
                element: <IAM/>
            },
            {
                path: "/iyf",
                children: [
                    {
                        path: "/iyf/posts",
                        element: <Posts/>,
                    },
                    {
                        path: "/iyf/posts/create",
                        element: <CreatePost/>
                    },
                    {
                        path: "/iyf/posts/:id/edit",
                        element: <EditPost/>
                    },
                    {
                        path: "/iyf/events",
                        element: <Events/>
                    },
                    {
                        path: "/iyf/events/create",
                        element: <CreateEvent/>
                    },
                    {
                        path: "/iyf/events/:id/edit",
                        element: <EditEvent/>
                    },
                    {
                        path: "/iyf/events/:id/guests",
                        element: <EventGuests/>
                    },
                    {
                        path: "/iyf/regular",
                        element: <RegularEvents/>
                    },
                    {
                        path: "/iyf/regular/create",
                        element: <CreateRegularEvent/>
                    },
                    {
                        path: "/iyf/regular/:id/edit",
                        element: <EditRegularEvent/>
                    }
                ]
            },
        ],
        errorElement: <ErrorBoundary/>
    }
];

const router = createBrowserRouter(routes);

export default function App() {
    useEffect(() => {
        setPerfectHeight();
        window.addEventListener('resize', setPerfectHeight);
        return () => window.removeEventListener('resize', setPerfectHeight);
    }, []);

    return <RouterProvider router={router}/>;
}

function ErrorBoundary() {
    const error = useRouteError() as { status?: number };

    return (
        <div className="ErrorBoundary">
            <div>
                {(error.status && error.status === 404)
                    ? <h1>Page not found</h1>
                    : <div className="ErrorBoundary__error">
                        <h1>Something went wrong</h1>
                        <code>{JSON.stringify(error)}</code>
                    </div>}

                <Link to="/">
                    <button>Go back to home</button>
                </Link>
            </div>
        </div>
    )
}

function setPerfectHeight() {
    const html = document.documentElement,
        body = document.body;
    const height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
    document.documentElement.style.height = document.body.style.height = `${height}px`;
}
