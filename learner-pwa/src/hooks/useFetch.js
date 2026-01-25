import { useState, useEffect } from 'react';

/**
 * Custom hook for data fetching with loading and error states
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFetch(fetchFunction, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    return { data, loading, error, refetch: fetchData };
}

export default useFetch;
