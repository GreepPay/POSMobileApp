// Get all Vue files from the views directory and transform their paths into route segments
const pages = Object.entries(import.meta.glob('../views/**/*.vue', { eager: true }))
    .map(([key]) => key.slice('../views/'.length)
    .replace('.vue', '')
    .split('/'));
const modules = import.meta.glob('../views/**/*.vue', { eager: true });
// Function to generate route paths from array of segments
const generateRoute = (path) => {
    // Remove first element if route starts with 'index' (except if it's the only element)
    if (path[0].toLowerCase().startsWith('index') && path.length > 1) {
        path.shift();
    }
    // Handle root-level routes
    if (path.length === 1) {
        const shortcut = path[0].toLowerCase();
        return shortcut.startsWith('index')
            ? '' // Index route becomes root path
            : shortcut.startsWith('_')
                ? shortcut.replace('_', ':') // '_parameter' becomes ':parameter' (dynamic route)
                : shortcut;
    }
    // Handle nested routes
    const lastElement = path[path.length - 1];
    if (lastElement.toLowerCase().startsWith('index')) {
        path.pop(); // Remove 'index' from the end of the path
    }
    else if (lastElement.startsWith('_')) {
        path[path.length - 1] = lastElement.replace('_', ':'); // Convert dynamic route parameter
    }
    return path.map((p) => p.toLowerCase()).join('/');
};
// Helper function to identify child routes (marked with ^)
const childrenFilter = (p) => ~p.indexOf('^');
// Process and group child routes by their parent path
const childrenByPath = pages
    // Note: filter pages by children routes
    .filter((path) => path.some(childrenFilter))
    .map((path) => {
    // Note: copy path and remove special char ^
    const copy = [...path];
    copy[copy.length - 1] = copy[copy.length - 1].slice(1);
    // Note: generate key to identify parent
    const key = `/${generateRoute(copy.slice(0, copy.length - 1))}`;
    return {
        path,
        route: `/${generateRoute(copy)}`,
        key
    };
})
    .reduce((acc, cur) => {
    // Note: generate list of nested routes where key is the parent path
    const key = cur.key;
    delete cur.key;
    if (acc[key]) {
        acc[key].push(cur);
    }
    else {
        acc[key] = [cur];
    }
    return acc;
}, {});
const defaultLayout = 'AppDefaultLayout';
export default Promise.all(pages
    .filter((path) => !path.some(childrenFilter))
    .map(async (path) => {
    try {
        const importPath = `../views/${path.join('/')}.vue`;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const component = modules[importPath].default;
        const { layout, middlewares, name } = component;
        const route = `/${generateRoute([...path])}`;
        let children = [];
        if (childrenByPath[route]) {
            const promises = childrenByPath[route].map(async ({ path, route }) => {
                const childComponent = (await import(`../views/${path.join('/')}.vue`)).default;
                const { layout: childLayout, middlewares: childMiddleware, name: childName } = childComponent;
                return {
                    path: route,
                    name: childName,
                    component: childComponent,
                    meta: {
                        layout: childLayout || defaultLayout,
                        middlewares: childMiddleware || {}
                    }
                };
            });
            children = await Promise.all(promises);
        }
        return {
            path: route,
            name,
            component,
            meta: {
                layout: layout || defaultLayout,
                middlewares: middlewares || {}
            },
            children
        };
    }
    catch (error) {
        console.error(`Error importing component for path: ${path.join('/')}`, error);
        return null;
    }
}));
//# sourceMappingURL=index.js.map