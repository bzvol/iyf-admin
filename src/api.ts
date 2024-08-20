import {User} from "firebase/auth";
import axios from "axios";
import {auth} from "./firebase";

const base = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api' : 'https://api.iyf.hu/api';

export const apiClient = axios.create({baseURL: base});
apiClient.interceptors.request.use(async config => {
    if (!auth.currentUser) return config;
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const apiUrls = {
    users: {
        list: `/users`,
        read: (id: string) => `/users/${id}`, // public
        setDefaultClaims: (id: string) => `/users/${id}/set-default-claims`, // public
        clearClaims: (id: string) => `/users/${id}/clear-claims`,
        requestAccess: (id: string) => `/users/${id}/request-access`, // public
        grantAccess: (id: string) => `/users/${id}/grant-access`,
        revokeAccess: (id: string) => `/users/${id}/revoke-access`,
        resetAccess: (id: string) => `/users/${id}/reset-access`,
        updateRoles: (id: string) => `/users/${id}/update-roles`,
    },
    info: {
        counts: `/info/counts`, // public
    },
    images: {
        upload: '/images',
    },
    posts: {
        list: `/posts`, // public
        create: `/posts`,
        read: (id: number) => `/posts/${id}`, // public
        update: (id: number) => `/posts/${id}`,
        delete: (id: number) => `/posts/${id}`,
    },
    events: {
        list: `/events`, // public
        create: `/events`,
        read: (id: number) => `/events/${id}`, // public
        update: (id: number) => `/events/${id}`,
        delete: (id: number) => `/events/${id}`,
        guests: {
            list: (eventId: number) => `/events/${eventId}/guests`, // public
            create: (eventId: number) => `/events/${eventId}/guests`,
            read: (eventId: number, guestId: number) => `/events/${eventId}/guests/${guestId}`, // public
            update: (eventId: number, guestId: number) => `/events/${eventId}/guests/${guestId}`,
            delete: (eventId: number, guestId: number) => `/events/${eventId}/guests/${guestId}`,
        }
    },
    regularEvents: {
        list: `/regular`, // public
        create: `/regular`,
        read: (id: number) => `/regular/${id}`, // public
        update: (id: number) => `/regular/${id}`,
        delete: (id: number) => `/regular/${id}`,
    }
};

export default apiUrls;

export interface CountInfo {
    posts: {
        total: number;
        draft: number;
        published: number;
        archived: number;
    },
    events: {
        total: number;
        upcoming: number;
        past: number;
        draft: number;
        published: number;
        archived: number;
        totalGuests: number;
        uniqueGuests: number;
    },
    regularEvents: {
        total: number;
        draft: number;
        published: number;
        archived: number;
    }
}

export interface ImageUpload {
    url: string;
}

export type Status = 'draft' | 'published' | 'archived';

interface MetadataAttributes {
    metadata: {
        createdAt: string;
        createdBy: User;
        updatedAt: string;
        updatedBy: User;
    }
}

export interface Post extends MetadataAttributes {
    id: number;
    title: string;
    content: string;
    tags: string[];
    status: Status;
    publishedAt: string | null;
}

export interface Event extends MetadataAttributes {
    id: number;
    title: string;
    details: string;
    schedule: {
        startTime: string;
        endTime: string;
        location: string;
    },
    status: Status;
    publishedAt: string | null;
}

export interface RegularEvent extends MetadataAttributes {
    id: number;
    title: string;
    details: string;
    schedule: {
        time: string;
        location: string;
    }
    status: Status;
}
