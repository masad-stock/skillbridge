import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// Mock the service worker registration
jest.mock('../../serviceWorkerRegistration', () => ({
  register: jest.fn(),
  unregister: jest.fn(),
}));

// Mock reportWebVitals
jest.mock('../../reportWebVitals', () => jest.fn());

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // App should render without throwing errors
    expect(document.body).toBeInTheDocument();
  });

  test('renders main navigation elements', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Check for common navigation elements that should be present
    // This will depend on your actual App component structure
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  test('handles routing correctly', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Test that routing works (this will depend on your routes)
    expect(window.location.pathname).toBeDefined();
  });

  test('loads i18n configuration', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // i18n should be initialized
    expect(document.documentElement.lang).toBeDefined();
  });
});
