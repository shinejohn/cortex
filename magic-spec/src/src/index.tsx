import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../App'; // Adjust import path as needed
// Get the root element from the DOM
const rootElement = document.getElementById('root');
// Create a root using the modern React 18 API
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  // Render the App component wrapped in BrowserRouter
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}