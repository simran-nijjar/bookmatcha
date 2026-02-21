import React, { useEffect, useState } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const SYSTEM_SHELF_ORDER = ['read', 'want_to_read', 'reading', 'dnf'];

export const UserBooks = () => {
    const [shelves, setShelves] = useState([]);
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchShelves();
    }, []);

    const fetchShelves = async () => {
        try {
            const [shelvesRes, booksRes] = await Promise.all([
                api.get('shelves'),
                api.get('user-books'),
            ]);

            const system = SYSTEM_SHELF_ORDER
                .map(slug => shelvesRes.data.find(s => s.slug === slug))
                .filter(Boolean);

            const custom = shelvesRes.data
                .filter(s => s.shelf_type === 'custom')
                .sort((a, b) => a.name.localeCompare(b.name));

            const allShelves = [...system, ...custom];

            const shelvesWithCovers = allShelves.map(shelf => {
                const shelfBooks = (booksRes.data || []).filter(b => b.shelf_id === shelf.shelf_id);
                const covers = shelfBooks
                    .filter(b => b.bookImage)
                    .slice(0, 3)
                    .map(b => b.bookImage);
                return { ...shelf, covers: covers || [] };
            });

            setShelves(shelvesWithCovers);
            setError('');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Please log in to view your books.');
            } else {
                setError('Error fetching your shelves. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="title">My Bookshelf</h1>
            <p className="subtitle">Here you can organize all of your books</p>

            {error ? (
                <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>
            ) : shelves.length === 0 ? (
                <p className="empty-message">No shelves found. Try logging in again.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                    {shelves.map(shelf => (
                        <div
                            key={shelf.shelf_id}
                            className="book-card"
                            onClick={() => navigate(`/shelf/${shelf.slug}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Cover previews */}
                            {(shelf.covers || []).length > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, maxWidth: '100px', overflow: 'hidden' }}>
                                    {(shelf.covers || []).map((cover, idx) => (
                                        <img
                                            key={idx}
                                            src={cover}
                                            alt=""
                                            style={{
                                                width: '40px',
                                                height: '58px',
                                                borderRadius: '4px',
                                                objectFit: 'cover',
                                                marginLeft: idx === 0 ? '0' : '-10px',
                                                border: '2px solid #f7f5ef',
                                                boxShadow: '1px 1px 4px rgba(0,0,0,0.15)',
                                                zIndex: (shelf.covers || []).length - idx,
                                                position: 'relative',
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    width: '40px',
                                    height: '58px',
                                    borderRadius: '4px',
                                    background: '#dfe8dc',
                                    border: '2px dashed #c8d9c4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    color: '#c8d9c4',
                                    flexShrink: 0,
                                }}>
                                    +
                                </div>
                            )}

                            {/* Shelf info */}
                            <div className="book-content" style={{ flex: 1 }}>
                                <div>
                                    <div className="book-title">{shelf.name}</div>
                                    <div className="book-author">
                                        {shelf.book_count} {shelf.book_count === 1 ? 'book' : 'books'}
                                    </div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div style={{ color: '#c8d9c4', fontSize: '24px', alignSelf: 'center' }}>›</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};