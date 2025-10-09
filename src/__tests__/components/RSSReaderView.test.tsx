import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import RSSReaderView from '../../components/RSSReaderView'
import { store as storeInstance } from '../../store'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { mockedFeeds } from '../../__mocks__/mockedFeeds'

describe('RSSReaderView', () => {
    let store: any;

    beforeEach(() => {
        store = storeInstance;
        global.prompt = () => 'https://medium.com/feed/backchannel';
    })

    it('should render', () => {
        render(<Provider store={store}>
            <BrowserRouter>
                <RSSReaderView />
            </BrowserRouter>
        </Provider>)
        expect(screen.getByText('RSS Reader')).toBeDefined()
    })

    it('should render the feeds', () => {
        const prevState = store.getState;
        store.getState = () => {
            return {
                rss: {
                    feeds: mockedFeeds,
                    selectedFeedId: null
                }
            }
        }
        render(<Provider store={store}>
            <BrowserRouter>
                <RSSReaderView />
            </BrowserRouter>
        </Provider>)
        expect(screen.getByText('Medium')).toBeDefined()
        expect(screen.getByText('Hacker News')).toBeDefined()
        expect(screen.getByText('TechCrunch')).toBeDefined()
        expect(screen.getByText('The Verge')).toBeDefined()
        expect(screen.getByText('The Economist')).toBeDefined()
        store.getState = prevState;
    })

    it('should add a new feed and remove it', async () => {
        render(<Provider store={store}>
            <BrowserRouter>
                <RSSReaderView />
            </BrowserRouter>
        </Provider>)
        fireEvent.click(screen.getByText('Add'))
        await waitFor(() => {
            expect(screen.getByText('...')).toBeDefined()
        })  
        expect(screen.getAllByTestId('remove-feed')[0]).toBeDefined()
        fireEvent.click(screen.getAllByTestId('remove-feed')[0])
        await waitFor(() => {
            expect(screen.queryByText('...')).toBeNull()
        })
    })
})
