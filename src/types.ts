export type Feed = {
    id: string;
    name: string;
    url: string;
    feedItems: FeedItem[];
}

export type FeedItem = {
    feedId: string;
    title: string;
    link: string;
    pubDate: string;
    isoDate: string;
    'content:encoded'?: string;
    'content:encodedSnippet'?: string;
    content?: string;
    contentSnippet?: string;
    summary?: string;
    creator?: string;   
    favorite: boolean;
    imageUrl?: string;
}

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc'
}