import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '../components/ui/toaster';
import Navbar from '../components/Navbar';
import { Textarea } from "@/components/ui/textarea";
import StarRating from '@/components/StarRating';

const ItemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/items/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch item details');
                }
                const data = await response.json();

                function capitalizeFirstLetter(string: string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }
                data.category = capitalizeFirstLetter(data.category);
                setItem(data);

                // Check if the logged-in user is the seller of the item
                const token = localStorage.getItem('token');
                if (token) {
                    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const userData = await userResponse.json();
                    setIsSeller(userData.email === data.sellerId.email);
                }

                // Fetch reviews for the seller
                const reviewsResponse = await fetch(`http://localhost:5000/api/profile/reviews/${data.sellerId._id}`);
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: "Error",
                description: "You must be logged in to add items to the cart",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ itemId: item._id })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('You must be logged in to add items to the cart');
                }
                else if (response.status === 400) {
                    throw new Error('Item is already in your cart');
                }
                else if (response.status === 402) {
                    throw new Error('Cannot add an item to the cart that is sold by you');
                }
                else {
                    throw new Error('Failed to add item to cart');
                }
            }

            toast({
                title: "Added to Cart",
                description: `${item.name} has been added to your cart.`,
            });

            window.dispatchEvent(new Event('cartUpdated'));      
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleDeleteItem = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: "Error",
                description: "You must be logged in to delete items",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            toast({
                title: "Deleted",
                description: `${item.name} has been deleted.`,
            });

            navigate('/searchitems');
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleReviewChange = (e) => {
        setNewReview({ ...newReview, [e.target.name]: e.target.value });
    };

    const handleAddReview = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: "Error",
                description: "You must be logged in to leave a review",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/profile/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sellerId: item.sellerId._id,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add review');
            }

            const addedReview = await response.json();
            setReviews([...reviews, addedReview]);
            setNewReview({ rating: 0, comment: '' });

            toast({
                title: "Success",
                description: "Review added successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster />
            <main className="pt-16">
                <div className="max-w-4xl mx-auto p-4">
                    <Card className="w-full">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl mb-2">{item.name}</CardTitle>
                                    <CardDescription>Category: {item.category}</CardDescription>
                                </div>
                                <div className="text-2xl font-bold">₹{item.price}</div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            {/* Item Details */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                                
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
                                    <p className="text-gray-600">Sold by: {item.sellerId.firstName} {item.sellerId.lastName}</p>
                                    <p className="text-gray-600">Email: {item.sellerId.email}</p>
                                    <p className="text-gray-600">Phone: +91 {item.sellerId.contactNumber}</p>
                                </div>
                            </div>

                            {/* Reviews */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-2">Reviews</h3>
                                {reviews.map((review) => (
                                    <div key={review._id} className="mb-4">
                                        <p className="text-gray-600"><strong>{review.reviewer.firstName} {review.reviewer.lastName}</strong></p>
                                        <StarRating totalStars={5} initialRating={review.rating} />
                                        <p className="text-gray-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Add Review */}
                            {!isSeller && (
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
                                    <div className="space-y-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <label htmlFor="rating">Rating</label>
                                            <StarRating 
                                                totalStars={5} 
                                                initialRating={newReview.rating} 
                                                onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                                            />
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <label htmlFor="comment">Comment</label>
                                            <Textarea 
                                                id="comment" 
                                                name="comment" 
                                                value={newReview.comment}
                                                onChange={handleReviewChange}
                                                required 
                                            />
                                        </div>
                                        <Button onClick={handleAddReview}>Submit Review</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        
                        <CardFooter className="flex justify-between">
                            <Button 
                                className="w-full"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </Button>
                            {isSeller && (
                                <Button 
                                    variant="destructive"
                                    className="ml-4"
                                    onClick={handleDeleteItem}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete Item
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ItemPage;