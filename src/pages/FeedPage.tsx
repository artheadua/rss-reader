import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';  
import { selectFeeds } from '../store';
import { FaBackward, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { format } from 'date-fns';


export default function FeedPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const url = new URL(decodeURIComponent(slug || ''));
    // fetch the feed item from the state
    const feeds = useSelector(selectFeeds);
    let selectedFeedItem = null;
    const [bookMarked, setBookMarked] = useState(localStorage.getItem(url.toString()) ? true : false);
    for (const feed of feeds) {
        const feedItem = feed.feedItems.find(feedItem => feedItem.link === url.toString());
        if (feedItem) {
            selectedFeedItem = feedItem;
            break;
        }
    }


    useEffect(() => {
        if (!selectedFeedItem) {
            navigate('/');
            return;
        }
    }, [selectedFeedItem, navigate]);

    return <div>
        <button className="bg-blue-500 h-8 text-white p-2 rounded-md cursor-pointer" onClick={() => {
            navigate('/');
        }}><FaBackward /></button>

        <div>
            <h2>{selectedFeedItem?.title}
                <span className="bookmark" onClick={() => {
                    if (localStorage.getItem(url.toString())) {
                        localStorage.removeItem(url.toString());
                        setBookMarked(false);
                    } else {
                        localStorage.setItem(url.toString(), 'true');
                        setBookMarked(true);
                    }
                }}>{bookMarked ? <FaBookmark /> : <FaRegBookmark />}</span>
            </h2>

            <p className="text-sm text-gray-500">{format(new Date(selectedFeedItem?.pubDate || ''), 'MMM d, yyyy')}</p>
            <p className="text-sm text-gray-500 font-bold mb-2">{selectedFeedItem?.creator}</p>
            <div dangerouslySetInnerHTML={{ __html: selectedFeedItem?.['content:encoded'] || selectedFeedItem?.content || '' }} />
            <a className="text-blue-500 cursor-pointer font-bold" href={selectedFeedItem?.link} target="_blank" rel="noopener noreferrer">Read more</a>
        </div>

    </div>
}