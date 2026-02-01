import React, { createElement } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';
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
} else {
  // Fallback if root element is not found
  console.error(
    'Root element not found! Creating a new div element to mount the app.'
  );
  const newRootElement = document.createElement('div');
  newRootElement.id = 'root';
  document.body.appendChild(newRootElement);
  const root = ReactDOM.createRoot(newRootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}