const base = 'https://api.iyf.hu/api';

const apiUrls = {
    users: {
        list: `${base}/users`,
        read: (id: string) => `${base}/users/${id}`, // public
        setDefaultClaims: (id: string) => `${base}/users/${id}/set-default-claims`, // public
        clearClaims: (id: string) => `${base}/users/${id}/clear-claims`,
        requestAccess: (id: string) => `${base}/users/${id}/request-access`, // public
        grantAccess: (id: string) => `${base}/users/${id}/grant-access`,
        revokeAccess: (id: string) => `${base}/users/${id}/revoke-access`,
        updateRoles: (id: string) => `${base}/users/${id}/update-roles`,
    },
    posts: {
        list: `${base}/posts`, // public
        create: `${base}/posts`,
        read: (id: number) => `${base}/posts/${id}`, // public
        update: (id: number) => `${base}/posts/${id}`,
        delete: (id: number) => `${base}/posts/${id}`,
    },
    events: {
        list: `${base}/events`, // public
        create: `${base}/events`,
        read: (id: number) => `${base}/events/${id}`, // public
        update: (id: number) => `${base}/events/${id}`,
        delete: (id: number) => `${base}/events/${id}`,
        guests: {
            list: (eventId: number) => `${base}/events/${eventId}/guests`, // public
            create: (eventId: number) => `${base}/events/${eventId}/guests`,
            read: (eventId: number, guestId: number) => `${base}/events/${eventId}/guests/${guestId}`, // public
            update: (eventId: number, guestId: number) => `${base}/events/${eventId}/guests/${guestId}`,
            delete: (eventId: number, guestId: number) => `${base}/events/${eventId}/guests/${guestId}`,
        }
    },
    regularEvents: {
        list: `${base}/regular-events`, // public
        create: `${base}/regular-events`,
        read: (id: number) => `${base}/regular-events/${id}`, // public
        update: (id: number) => `${base}/regular-events/${id}`,
        delete: (id: number) => `${base}/regular-events/${id}`,
    }
};

export default apiUrls;
