import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  totalStars = 5, 
  initialRating = 0, 
  onRatingChange 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleRatingChange = (currentRating) => {
    setRating(currentRating);
    if (onRatingChange) {
      onRatingChange(currentRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={24}
            className={`cursor-pointer transition-colors duration-200 ${
              starValue <= (hover || rating) 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRatingChange(starValue)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;