import {User} from "firebase/auth";
import {AxiosRequestConfig} from "axios";

const base = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api' : 'https://api.iyf.hu/api';

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
    info: {
        counts: `${base}/info/counts`, // public
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
        list: `${base}/regular`, // public
        create: `${base}/regular`,
        read: (id: number) => `${base}/regular/${id}`, // public
        update: (id: number) => `${base}/regular/${id}`,
        delete: (id: number) => `${base}/regular/${id}`,
    }
};

export async function makeBearer(user: User): Promise<AxiosRequestConfig> {
    return {headers: {Authorization: `Bearer ${await user.getIdToken()}`}};
}

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

export type Status = 'draft' | 'published' | 'archived';
interface MetadataAttributes {
    metadata: {
        createdAt: string;
        createdBy: string;
        updatedAt: string;
        updatedBy: string;
    }
}

export interface Post extends MetadataAttributes {
    id: number;
    title: string;
    content: string;
    tags: string[];
    status: Status;
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
