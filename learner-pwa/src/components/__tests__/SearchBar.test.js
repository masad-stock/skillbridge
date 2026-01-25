import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from '../SearchBar';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');

const MockedSearchBar = (props) => (
    <BrowserRouter>
        <SearchBar {...props} />
    </BrowserRouter>
);

describe('SearchBar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders search input', () => {
        render(<MockedSearchBar />);
        const input = screen.getByPlaceholderText(/search/i);
        expect(input).toBeInTheDocument();
    });

    it('calls onSearch when form is submitted', () => {
        const mockOnSearch = jest.fn();
        render(<MockedSearchBar onSearch={mockOnSearch} />);

        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'test query' } });
        fireEvent.submit(input.closest('form'));

        expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('shows clear button when input has value', () => {
        render(<MockedSearchBar />);

        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'test' } });

        const clearButton = screen.getByTitle(/clear search/i);
        expect(clearButton).toBeInTheDocument();
    });

    it('clears input when clear button is clicked', () => {
        render(<MockedSearchBar />);

        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'test' } });

        const clearButton = screen.getByTitle(/clear search/i);
        fireEvent.click(clearButton);

        expect(input.value).toBe('');
    });

    it('loads suggestions when typing', async () => {
        api.searchAPI = {
            getSuggestions: jest.fn().mockResolvedValue({
                data: {
                    success: true,
                    data: [
                        { title: 'Digital Marketing', category: 'Marketing' },
                        { title: 'Digital Literacy', category: 'Basic Skills' }
                    ]
                }
            }),
            getPopular: jest.fn().mockResolvedValue({
                data: { success: true, data: [] }
            })
        };

        render(<MockedSearchBar />);

        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'dig' } });
        fireEvent.focus(input);

        await waitFor(() => {
            expect(api.searchAPI.getSuggestions).toHaveBeenCalledWith('dig', 'modules', 5);
        });
    });
});
