import React, { useEffect } from 'react'
import { store } from '../store'
import { Provider } from 'react-redux'
import RSSReaderView from '../components/RSSReaderView'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import FeedPage from './FeedPage';

import '../globals.css'

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<div>
            <RSSReaderView />
          </div>} />
          <Route path="/feed/:slug" element={<FeedPage />} />
        </Routes>
      </Router>

    </Provider>
  );
}
