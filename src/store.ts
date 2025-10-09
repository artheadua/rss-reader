import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'
import { Feed, FeedItem } from './types'
import { feedApi } from './services/apiSlice'

const DEFAULT_FEEDS = localStorage.getItem('feeds') ? JSON.parse(localStorage.getItem('feeds') || '[]') : [];

const rssSlice = createSlice({
    name: 'rss',
    initialState: {
        feeds: DEFAULT_FEEDS || [] as Feed[],
        selectedFeedId: null
    } as {
        feeds: Feed[]
        selectedFeedId: string | null
    },
    reducers: {
        addFeed: (state, action: PayloadAction<Feed>) => {
            state.feeds.push(action.payload)
            localStorage.setItem('feeds', JSON.stringify(state.feeds))
            state.selectedFeedId = action.payload.id
        },
        removeFeed: (state, action: PayloadAction<string>) => {
            state.feeds = state.feeds.filter(feed => feed.id !== action.payload)
            if (state.selectedFeedId === action.payload) {
                state.selectedFeedId = null
            }
            localStorage.setItem('feeds', JSON.stringify(state.feeds))
            if (state.feeds.length === 0) {
                localStorage.removeItem('feeds')
            }
        },
        setSelectedFeed: (state, action: PayloadAction<Feed>) => {
            state.selectedFeedId = action.payload.id
        },
        setFeedItems: (state, action: PayloadAction<{ items: FeedItem[], title: string }>) => {
            if (!state.selectedFeedId) {
                return
            }
            state.feeds.find(feed => feed.id === state.selectedFeedId)!.feedItems = action.payload.items;
            state.feeds.find(feed => feed.id === state.selectedFeedId)!.name = action.payload.title;
            localStorage.setItem('feeds', JSON.stringify(state.feeds))
        },
        bookMarkFeedItem: (state, action: PayloadAction<{ feedItem: FeedItem, favorite: boolean }>) => {
            const feed = state.feeds.find(feed => feed.id === action.payload.feedItem.feedId)
            const feedItem = feed?.feedItems.find(feedItem => feedItem.link === action.payload.feedItem.link)
            if (feedItem) {
                feedItem.favorite = action.payload.favorite

                if (action.payload.favorite) {
                    localStorage.setItem(feedItem.link, 'true')
                } else {
                    localStorage.removeItem(feedItem.link)
                }
            }
        }
    }
})

export const {
    addFeed,
    removeFeed,
    setSelectedFeed,
    setFeedItems,
    bookMarkFeedItem
} = rssSlice.actions

export const store = configureStore({
    reducer: {
        [feedApi.reducerPath]: feedApi.reducer,
        rss: rssSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(feedApi.middleware)
})

// selector
export const selectFeeds = (state: ReturnType<typeof store.getState>) => state.rss.feeds
export const selectSelectedFeed = (state: ReturnType<typeof store.getState>) => state.rss.selectedFeedId ? state.rss.feeds.find(feed => feed.id === state.rss.selectedFeedId) : null