import React, { useEffect, useMemo, useRef, useState } from "react"
import { useGetFeedItemsQuery } from "../services/apiSlice"
import { addFeed, selectFeeds, selectSelectedFeed, setFeedItems, setSelectedFeed, bookMarkFeedItem, removeFeed } from "../store"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FaSortAlphaDown, FaSortAlphaUp, FaSpinner, FaPlus, FaBookmark, FaRegBookmark, FaTrash } from "react-icons/fa";
import { SortDirection } from "../types"
import { format } from "date-fns"

export default function RSSReaderView() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const feeds = useSelector(selectFeeds)
    const selectedFeed = useSelector(selectSelectedFeed)
    const timestampRef = useRef(Date.now()).current
    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC)
    const [filterByFavorite, setFilterByFavorite] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const { data: fetchedFeed, isFetching: isLoadingFeedItems } = useGetFeedItemsQuery(
        {
            url:
                selectedFeed?.url || '',
            feedId: selectedFeed?.id || '',
            timestamp: timestampRef
        }, { skip: !selectedFeed }
    )

    useEffect(() => {
        if (fetchedFeed) {
            dispatch(setFeedItems({
                items: fetchedFeed.items,
                title: fetchedFeed.title
            }))
        }
    }, [fetchedFeed, dispatch, sortDirection]);

    const sortedFeedItems = useMemo(() => {
        const fItems = selectedFeed?.feedItems?.map((f) => ({ ...f })) || [];
        fItems.sort((a, b) => sortDirection === SortDirection.ASC ?
            new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime() :
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        return fItems;
    }, [selectedFeed, sortDirection]);

    const postProcessContent = (content: string) => {
        return content.replace(new RegExp(searchQuery, 'gi'), (match) => `<mark>${match}</mark>`)
    }

    const filteredFeedItems = useMemo(() => {
        return sortedFeedItems.filter((feedItem) => filterByFavorite ? localStorage.getItem(feedItem.link) : true)
            .filter((feedItem) =>
                feedItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feedItem.contentSnippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feedItem.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feedItem.creator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feedItem['content:encodedSnippet']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feedItem['content:encoded']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feedItem.content?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((feedItem) => ({
                ...feedItem,
                title: postProcessContent(feedItem.title),
                contentSnippet: postProcessContent(feedItem.contentSnippet || ''),
                summary: postProcessContent(feedItem.summary || ''),
                content: postProcessContent(feedItem['content:encodedSnippet'] || feedItem.summary || feedItem.contentSnippet || ''),
            }))
    }, [sortedFeedItems, searchQuery, filterByFavorite])



    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between flex-wrap">
                <h1>RSS Reader</h1>
                {/* Search box */}
                <div>
                    <input type="text" placeholder="Search" className="search-box" onChange={(e) => {
                        setSearchQuery(e.target.value)
                    }} />
                </div>
            </div>
            <div className="flex gap-4 flex-wrap">
                <div>
                    <div className="flex justify-between">
                        <h2>Feeds</h2><button type="button" onClick={() => {
                            // prompt for channel name and url
                            const url = prompt('Enter feed url')
                            try {
                                const urlObject = new URL(url || '')
                            } catch (error) {
                                alert('Please enter a valid feed url')
                                return
                            }
                            dispatch(addFeed({
                                id: Date.now().toString(),
                                name: '...',
                                url: url || '',
                                feedItems: []
                            }))
                        }}><FaPlus /> Add</button></div>
                    <ul>
                        {feeds.length === 0 ? <div>No feeds, go ahead and add one</div> : feeds.map((feed) => (
                            <li key={feed.id}
                                style={{
                                    backgroundColor: selectedFeed?.id === feed.id ? '#007bff' : 'unset',
                                    color: selectedFeed?.id === feed.id ? 'white' : 'unset',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline'
                                }}
                                className="feed-item"
                                onClick={() => {
                                    dispatch(setSelectedFeed(feed))
                                }}>{feed.name}
                                {feed.feedItems.length > 0 && (` (${feed.feedItems.length})`)}
                                {/* show only on hover */}
                                <span className="visible">
                                    <button type="button" data-testid="remove-feed" role="button" aria-label="Remove feed" onClick={() => {
                                        if (confirm(`Are you sure you want to remove ${feed.name}?`)) {
                                            dispatch(removeFeed(feed.id))
                                        }
                                    }}><FaTrash /></button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedFeed && <div className="w-80">
                    <h2>{selectedFeed.name} Feed</h2>
                    {/* sorting by pubDate */}
                    <button onClick={() => {
                        setSortDirection(sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC)
                    }}>
                        {sortDirection === SortDirection.ASC ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                    </button>
                    {/* filter by favorite */}
                    <button onClick={() => {
                        setFilterByFavorite(!filterByFavorite)
                    }}>
                        {filterByFavorite ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                    {isLoadingFeedItems ? <p><FaSpinner /></p> : filteredFeedItems.length === 0 ? <p>No news found</p> : (
                        <ul>
                            {filteredFeedItems.map((feedItem) => (
                                <li key={feedItem.link}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                    }}
                                >
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
                                </li>
                            ))}
                        </ul>
                    )}
                </div>}
            </div>
        </div>
    )
}