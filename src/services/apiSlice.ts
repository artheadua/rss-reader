import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FeedItem } from "../types";

export const feedApi = createApi({
    reducerPath: "feedApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
    endpoints: (build) => ({
        getFeedItems: build.query<{ items: FeedItem[], title: string }, { url: string, feedId: string, timestamp: number }>({
            query: ({ url, feedId }) => `feed?url=${encodeURIComponent(url)}`,
            transformResponse: (response: { items: FeedItem[], title: string }, _, { feedId }) => {
                return {
                    items: response.items.map((feedItem) => {
                        return {
                            ...feedItem,
                            feedId: feedId
                        }
                    }),
                    title: response.title
                }
            }
        })
    })
});

export const { useGetFeedItemsQuery } = feedApi;
