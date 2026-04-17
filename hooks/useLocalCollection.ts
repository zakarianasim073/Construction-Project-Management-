import { useState, useEffect } from 'react';

/**
 * A hook to manage a generic collection via our Express MongoDB API.
 * Uses optimistic updates for a snappy UX without websockets.
 */
export function useLocalCollection<T extends { id: string }>(collectionName: string) {
    const [data, setData] = useState<T[]>([]);

    useEffect(() => {
        let mounted = true;
        fetch(`/api/collections/${collectionName}`)
            .then(res => res.json())
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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (e) {
            console.error(`Error updating ${collectionName}:`, e);
        }
    };

    const remove = async (id: string) => {
        setData(prev => prev.filter(d => d.id !== id)); // Optimistic
        try {
            await fetch(`/api/collections/${collectionName}/${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error(`Error deleting from ${collectionName}:`, e);
        }
    };

    return { data, add, update, remove };
}
