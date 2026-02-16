import { useState } from 'react';

function StarRating({ rating, setRating, max = 5 }) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseMove = (event, index) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - left;
        const newHover = mouseX < width / 2 ? index + 0.5 : index + 1;
        setHoverRating(newHover);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClick = (event, index) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - left;
        const newRating = mouseX < width / 2 ? index + 0.5 : index + 1;
        setRating(newRating);
    };

    const displayRating = hoverRating || rating;

    return (
        <div style={{ display: 'flex', gap: '6px', cursor: 'pointer', fontSize: '28px' }}>
            {[...Array(max)].map((_, index) => {
                let fillPercent = 0;
                if (displayRating >= index + 1) fillPercent = 100;
                else if (displayRating >= index + 0.5) fillPercent = 50;

                return (
                    <span
                        key={index}
                        onClick={(e) => handleClick(e, index)}
                        onMouseMove={(e) => handleMouseMove(e, index)}
                        onMouseLeave={handleMouseLeave}
                        style={{ position: 'relative', display: 'inline-block', width: '28px' }}
                    >
                        {/* Empty star */}
                        <span style={{ color: '#ccc' }}>★</span>

                        {/* Filled overlay */}
                        <span
                            style={{
                                color: '#FFD700',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: `${fillPercent}%`,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            ★
                        </span>
                    </span>
                );
            })}
        </div>
    );
}

export default StarRating;