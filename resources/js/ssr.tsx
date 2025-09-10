import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import ReactDOMServer from "react-dom/server";
import { type RouteName, route } from "ziggy-js";

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => title,
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx")),
        setup: ({ App, props }) => {
            /* biome-disable */
            // @ts-expect-error
            global.route = (
                name: RouteName,
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                params?: any,
                absolute?: boolean,
            ) =>
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                route(name, params as any, absolute, {
                    // @ts-expect-error
                    ...page.props.ziggy,
                    // @ts-expect-error
                    location: new URL(page.props.ziggy.location),
                });
            /* biome-enable */

            return <App {...props} />;
        },
    }),
);
