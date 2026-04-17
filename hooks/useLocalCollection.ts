import { useState, useEffect } from 'react';

/**
 * Helper to dynamically grab auth token if available.
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

/**
 * A hook to manage a generic collection via our Express MongoDB API.
 * Uses optimistic updates for a snappy UX without websockets.
 */
export function useLocalCollection<T extends { id: string }>(collectionName: string) {
    const [data, setData] = useState<T[]>([]);

    useEffect(() => {
        let mounted = true;
        const token = localStorage.getItem('auth_token');
        fetch(`/api/collections/${collectionName}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(res => {
                if (!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(result => {
                if (mounted) {
                    setData(Array.isArray(result) ? result : []);
                    if (!Array.isArray(result)) {
                        console.error(`Expected array for ${collectionName}, got:`, result);
                    }
                }
            })
            .catch(err => console.error(`Error fetching ${collectionName}:`, err));
        
        return () => { mounted = false; };
    }, [collectionName]);

    const add = async (item: T) => {
        setData(prev => [...prev, item]); // Optimistic
        try {
            await fetch(`/api/collections/${collectionName}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(item)
            });
        } catch (e) {
            console.error(`Error adding to ${collectionName}:`, e);
        }
    };

    const update = async (id: string, updates: Partial<T>) => {
        setData(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)); // Optimistic
        try {
            await fetch(`/api/collections/${collectionName}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates)
            });
        } catch (e) {
            console.error(`Error updating ${collectionName}:`, e);
        }
    };

    const remove = async (id: string) => {
        setData(prev => prev.filter(d => d.id !== id)); // Optimistic
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/collections/${collectionName}/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
        } catch (e) {
            console.error(`Error deleting from ${collectionName}:`, e);
        }
    };

    return { data, add, update, remove };
}
