import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Navbar from '../components/Navbar';
import StarRating from '@/components/StarRating';

const DashboardPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        contactNumber: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchUserProfile();
        fetchUserReviews();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
    
            const data = await response.json();
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email,
                age: data.age ? data.age.toString() : '',
                contactNumber: data.contactNumber || '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load profile data",
                variant: "destructive"
            });
        }
    };

    const fetchUserReviews = async () => {
        try {
            const tempresponse = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const userData = await tempresponse.json();

            const response = await fetch(`http://localhost:5000/api/profile/reviews/${userData._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: "Failed to load reviews",
                variant: "destructive"
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (formData.newPassword !== formData.confirmNewPassword) {
                toast({
                    title: "Error",
                    description: "New passwords do not match",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            const updatedProfile = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                age: formData.age ? parseInt(formData.age) : null,
                contactNumber: formData.contactNumber || '',
                newPassword: formData.newPassword || undefined
            };
    
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedProfile)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            toast({
                title: "Success",
                description: "Profile updated successfully",
            });

            setFormData({
                ...formData,
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster />
            <main className="pt-16 flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0 md:space-x-4">
                    <Card className="w-full md:w-2/3">
                        <CardHeader>
                            <CardTitle>Profile Dashboard</CardTitle>
                            <CardDescription>Manage your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input 
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input 
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email"
                                    value={formData.email}
                                    readOnly 
                                    className="bg-gray-50" 
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="age">Age (Optional)</Label>
                                <Input 
                                    id="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder="Enter your age"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
                                <Input 
                                    id="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter your contact number"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input 
                                    id="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                <Input 
                                    id="confirmNewPassword"
                                    type="password"
                                    value={formData.confirmNewPassword}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full" 
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="w-full md:w-1/3">
                        <CardHeader>
                            <CardTitle>Reviews About You</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reviews.length === 0 ? (
                                <p className="text-gray-500">No reviews yet</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="mb-4">
                                        <p className="text-gray-600"><strong>{review.reviewer.firstName} {review.reviewer.lastName}</strong></p>
                                        <StarRating totalStars={5} initialRating={review.rating} />
                                        <p className="text-gray-600">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;