import React, { useState } from 'react';
import api from '../api/api';

const SHELF_BUTTONS = [
    { slug: 'want_to_read', label: 'Want to Read' },
    { slug: 'reading',      label: 'Reading'      },
    { slug: 'read',         label: 'Read'         },
    { slug: 'dnf',          label: 'Did Not Finish'},
];

const MEDIA_TYPES = [
    { value: 'print',     label: 'Print'     },
    { value: 'ebook',     label: 'E-Book'    },
    { value: 'audiobook', label: 'Audiobook' },
];

const SHOW_MEDIA_TYPE    = ['reading', 'read', 'dnf'];
const SHOW_START_DATE    = ['reading', 'read', 'dnf'];
const SHOW_FINISHED_DATE = ['read', 'dnf'];

export const ShelfSelector = ({ bookId, initialEntry, onUpdate }) => {
    const [selectedSlug, setSelectedSlug] = useState(initialEntry?.shelfSlug || null);
    const [mediaType, setMediaType]       = useState(initialEntry?.media_type || '');
    const [startDate, setStartDate]       = useState(initialEntry?.start_date?.slice(0, 10) || '');
    const [finishedDate, setFinishedDate] = useState(initialEntry?.finished_date?.slice(0, 10) || '');
    const [showDetails, setShowDetails]   = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [error, setError]               = useState('');
    const [success, setSuccess]           = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleShelfSelect = (slug) => {
        setSelectedSlug(slug);
        setShowDetails(true);
        setDropdownOpen(false);
        setError('');
        setSuccess('');
        if (!SHOW_START_DATE.includes(slug))    setStartDate('');
        if (!SHOW_FINISHED_DATE.includes(slug)) setFinishedDate('');
    };

    const handleSave = async () => {
        if (!selectedSlug || submitting) {
            return;
        }
        if (finishedDate && startDate && new Date(finishedDate) < new Date(startDate)) {
            setError('Finished date cannot be before start date');
            return;
        }
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const shelvesRes = await api.get('shelves');
            const shelf = shelvesRes.data.find(s => s.slug === selectedSlug);
            if (!shelf) {
                setError('Shelf not found. Please try again.');
                setSubmitting(false);
                return;
            }
            await api.post('user-books', {
                bookId,
                shelfId:      shelf.shelf_id,
                mediaType:    mediaType    || null,
                startDate:    startDate    || null,
                finishedDate: finishedDate || null,
            });

            setSuccess('Shelf updated!');
            setShowDetails(false);
            if (onUpdate) {
                onUpdate();
            }
        } catch {
            setError('Error saving to shelf. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async () => {
        if (submitting) {
            return;
        }
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await api.delete(`user-books/${bookId}`);
            setSelectedSlug(null);
            setShowDetails(false);
            setMediaType('');
            setStartDate('');
            setFinishedDate('');
            setSuccess('Removed from shelf.');
            if (onUpdate) {
                onUpdate();
            }
        } catch {
            setError('Error removing from shelf. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ marginTop: '15px' }}>

            {/* Dropdown trigger button */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                        backgroundColor: selectedSlug ? '#44624a' : '#dfe8dc',
                        color: selectedSlug ? '#f4f1ea' : '#2f3e32',
                        border: 'none',
                        padding: '7px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: '0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    {selectedSlug
                        ? `✓ ${SHELF_BUTTONS.find(s => s.slug === selectedSlug)?.label}`
                        : 'Add to Shelf'
                    }
                    <span style={{ fontSize: '10px' }}>{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        backgroundColor: '#f7f5ef',
                        borderRadius: '12px',
                        boxShadow: '0 8px 20px rgba(68, 98, 74, 0.15)',
                        overflow: 'hidden',
                        zIndex: 100,
                        minWidth: '170px',
                    }}>
                        {SHELF_BUTTONS.map(shelf => (
                            <button
                                key={shelf.slug}
                                onClick={() => handleShelfSelect(shelf.slug)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '10px 16px',
                                    backgroundColor: selectedSlug === shelf.slug ? '#dfe8dc' : 'transparent',
                                    color: '#2f3e32',
                                    border: 'none',
                                    fontSize: '14px',
                                    fontWeight: selectedSlug === shelf.slug ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: '0.15s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dfe8dc'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedSlug === shelf.slug ? '#dfe8dc' : 'transparent'}
                            >
                                {selectedSlug === shelf.slug ? `✓ ${shelf.label}` : shelf.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Expandable details section */}
            {showDetails && selectedSlug && (
                <div style={{
                    backgroundColor: '#f7f5ef',
                    borderRadius: '12px',
                    padding: '16px',
                    marginTop: '10px',
                    boxShadow: '0 4px 12px rgba(68, 98, 74, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    {/* Media type */}
                    {SHOW_MEDIA_TYPE.includes(selectedSlug) && (
                    <div>
                        <label style={{ fontWeight: 600, fontSize: '14px', color: '#44624a', display: 'block', marginBottom: '6px' }}>
                            Media Type (optional)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {MEDIA_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => setMediaType(mediaType === type.value ? '' : type.value)}
                                    style={{
                                        backgroundColor: mediaType === type.value ? '#44624a' : '#dfe8dc',
                                        color: mediaType === type.value ? '#f4f1ea' : '#2f3e32',
                                        border: 'none',
                                        fontWeight: 600,
                                        padding: '5px 14px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: '0.2s ease',
                                    }}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    )}

                    {/* Start date */}
                    {SHOW_START_DATE.includes(selectedSlug) && (
                        <div>
                            <label style={{ fontWeight: 600, fontSize: '14px', color: '#44624a', display: 'block', marginBottom: '6px' }}>
                                Start Date (optional)
                            </label>
                            <input
                                type="date"
                                className="auth-input"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                style={{ marginBottom: 0, width: '180px' }}
                            />
                        </div>
                    )}

                    {/* Finished date */}
                    {SHOW_FINISHED_DATE.includes(selectedSlug) && (
                        <div>
                            <label style={{ fontWeight: 600, fontSize: '14px', color: '#44624a', display: 'block', marginBottom: '6px' }}>
                                Finished Date (optional)
                            </label>
                            <input
                                type="date"
                                className="auth-input"
                                value={finishedDate}
                                onChange={e => setFinishedDate(e.target.value)}
                                style={{ marginBottom: 0, width: '180px' }}
                            />
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            className="theme-custom"
                            onClick={handleSave}
                            disabled={submitting}
                            style={{ fontSize: '13px', padding: '5px 14px' }}
                        >
                            {submitting ? 'Saving...' : 'Save to Shelf'}
                        </button>

                        {initialEntry && (
                            <button
                                onClick={handleRemove}
                                disabled={submitting}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#c0392b',
                                    border: '1.5px solid #c0392b',
                                    fontWeight: 600,
                                    padding: '5px 14px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    transition: '0.2s ease',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    {error   && <p className="error-text"   style={{ margin: 0 }}>{error}</p>}
                    {success && <p className="success-text" style={{ margin: 0 }}>{success}</p>}
                </div>
            )}
        </div>
    );
};