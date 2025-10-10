import React from 'react'
import { FeedItem } from '../types'
import { FaBookmark, FaRegBookmark } from 'react-icons/fa'
import { format } from 'date-fns'

export default function FeedItemComponent({ feedItem, navigate, dispatch, bookMarkFeedItem }: { feedItem: FeedItem, navigate: (path: string) => void, dispatch: (action: any) => void, bookMarkFeedItem: (action: any) => void }) {
    return (
        <div className="flex">
            <div className="flex gap-2">
                {feedItem.imageUrl && <img src={feedItem.imageUrl} alt={feedItem.title} className="preview" onClick={() => {
                    navigate(`/feed/${encodeURIComponent(feedItem.link)}`)
                }} />}
            </div>
            <div className="flex flex-wrap">
                <div className="flex flex-col">
                    <div onClick={() => {
                        navigate(`/feed/${encodeURIComponent(feedItem.link)}`)
                    }} className="title" dangerouslySetInnerHTML={{ __html: feedItem.title }}></div>
                    <div className="date">{format(new Date(feedItem.pubDate || ''), 'MMM d, yyyy')}
                        <span className="bookmark" onClick={() => {
                            dispatch(bookMarkFeedItem({ feedItem: feedItem, favorite: !localStorage.getItem(feedItem.link) }))
                        }}>{localStorage.getItem(feedItem.link) ? <FaBookmark /> : <FaRegBookmark />}</span>
                    </div>

                </div>
                <div className="content" onClick={() => {
                    navigate(`/feed/${encodeURIComponent(feedItem.link)}`)
                }} dangerouslySetInnerHTML={{ __html: feedItem['content:encodedSnippet'] || feedItem.summary || feedItem.contentSnippet || '' }}></div>
            </div>
        </div>
    )
}