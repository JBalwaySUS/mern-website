import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, X, Check } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import Navbar from '../components/Navbar';
import { useToast } from "@/hooks/use-toast";

const DeliverItems = () => {
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingDeliveries();
  }, []);

  const fetchPendingDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view pending deliveries');
      }

      const response = await fetch('http://localhost:5000/api/orders/deliveritems', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending deliveries');
      }

      const data = await response.json();
      const pendingOrders = data.filter(order => order.status === 'pending');
      setPendingDeliveries(pendingOrders);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to cancel orders');
      }
  
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
  
      setPendingDeliveries(prev => prev.filter(d => d._id !== orderId));
      toast({
        title: "Success",
        description: "Order cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleOtpSubmit = async (orderId, otp) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to verify OTP');
      }

      const response = await fetch('http://localhost:5000/api/orders/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, otp })
      });

      if (!response.ok) {
        throw new Error('Invalid OTP. Please try again.');
      }

      setPendingDeliveries(prev => prev.filter(d => d._id !== orderId));

      toast({
        title: "Success",
        description: "Order verified successfully",
      });
    } catch (error) {
      setPendingDeliveries(prev => prev.map(d => {
        if (d._id === orderId) {
          return { ...d, error: error.message };
        }
        return d;
      }));
    }
  };

  const toggleOtpInput = (orderId) => {
    setPendingDeliveries(prev => prev.map(delivery => {
      if (delivery._id === orderId) {
        return {
          ...delivery,
          showOtpInput: !delivery.showOtpInput,
          otpInput: "",
          error: ""
        };
      }
      return delivery;
    }));
  };

  const handleOtpChange = (orderId, value) => {
    setPendingDeliveries(prev => prev.map(delivery => {
      if (delivery._id === orderId) {
        return {
          ...delivery,
          otpInput: value,
          error: ""
        };
      }
      return delivery;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Deliver Items</h1>
          </div>

          {pendingDeliveries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No pending deliveries</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingDeliveries.map((delivery) => (
                <Card key={delivery._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>Order #{delivery._id}</CardTitle>
                      <Badge variant="secondary">Pending Delivery</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Item:</span>
                          <span className="font-medium">{delivery.item.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">₹{delivery.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(delivery.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Buyer Details</h3>
                        <div className="grid gap-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span>{delivery.buyerId.firstName} {delivery.buyerId.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{delivery.buyerId.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contact:</span>
                            <span>{delivery.buyerId.contactNumber}</span>
                          </div>
                        </div>
                      </div>

                      {delivery.showOtpInput && (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Enter OTP"
                              value={delivery.otpInput}
                              onChange={(e) => handleOtpChange(delivery._id, e.target.value)}
                              className="max-w-[200px]"
                            />
                            <Button 
                              variant="default"
                              onClick={() => handleOtpSubmit(delivery._id, delivery.otpInput)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Verify & Complete
                            </Button>
                          </div>
                          
                          {delivery.error && (
                            <Alert variant="destructive">
                              <AlertTitle>Error</AlertTitle>
                              <AlertDescription>
                                {delivery.error}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelOrder(delivery._id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                    <Button
                      variant={delivery.showOtpInput ? "outline" : "default"}
                      onClick={() => toggleOtpInput(delivery._id)}
                    >
                      {delivery.showOtpInput ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Complete Delivery
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeliverItems;