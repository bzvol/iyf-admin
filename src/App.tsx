import './App.scss';
import {createBrowserRouter, RouterProvider, useRouteError} from "react-router-dom";
import Root from "./pages/Root";
import Posts from "./pages/iyf/Posts";
import {useEffect} from "react";
import Events from "./pages/iyf/Events";
import IAM from "./pages/IAM";
import CreatePost from "./pages/iyf/CreatePost";

export default function App() {
    useEffect(() => {
        setPerfectHeight();
        window.addEventListener('resize', setPerfectHeight);
        return () => window.removeEventListener('resize', setPerfectHeight);
    }, []);

    const router = createBrowserRouter([
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
                            path: "/iyf/homepage",
                            element: <h1>Homepage</h1>
                        },
                        {
                            path: "/iyf/posts",
                            element: <Posts/>,
                        },
                        {
                            path: "/iyf/posts/create",
                            element: <CreatePost/>
                        },
                        {
                            path: "/iyf/events",
                            element: <Events/>
                        },
                        {
                            path: "/iyf/regular",
                            element: <h1>Regular Events</h1>
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

function setPerfectHeight() {
    const html = document.documentElement,
        body = document.body;
    const height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
    document.documentElement.style.height = document.body.style.height = `${height}px`;
}
