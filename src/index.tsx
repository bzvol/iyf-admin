import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App, {routes} from './App';
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";
import {ReactRouterRoutingProvider} from "@bugsnag/react-router-performance";

Bugsnag.start({
    apiKey: process.env.REACT_APP_BUGSNAG_API_KEY!,
    plugins: [new BugsnagPluginReact()]
});
BugsnagPerformance.start({
    apiKey: process.env.REACT_APP_BUGSNAG_API_KEY!,
    routingProvider: new ReactRouterRoutingProvider(routes)
});

const ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <ErrorBoundary>
        <App/>
    </ErrorBoundary>
);