import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Package, ShoppingBag, Store, X } from "lucide-react";
import Navbar from '../components/Navbar';
import { useToast } from "@/hooks/use-toast";


const OrderHistory = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [boughtItems, setBoughtItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [otps, setOtps] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingOrders();
    fetchBoughtItems();
    fetchSoldItems();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view pending orders');
      }

      const response = await fetch('http://localhost:5000/api/orders/pendingorders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending orders');
      }

      const data = await response.json();
      setPendingOrders(data.orders);
      setOtps(data.otps);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const fetchBoughtItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view bought items');
      }

      const response = await fetch('http://localhost:5000/api/orders/boughtitems', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bought items');
      }

      const data = await response.json();
      setBoughtItems(data);
    } catch (error) {
      console.error('Error fetching bought items:', error);
    }
  };

  const fetchSoldItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view sold items');
      }

      const response = await fetch('http://localhost:5000/api/orders/solditems', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sold items');
      }

      const data = await response.json();
      setSoldItems(data);
    } catch (error) {
      console.error('Error fetching sold items:', error);
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
  
      setPendingOrders(prev => prev.filter(order => order._id !== orderId));
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Order History</h1>
          
          <Tabs defaultValue="pending" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-3 mb-8 gap-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pending Orders
              </TabsTrigger>
              <TabsTrigger value="bought" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Bought Items
              </TabsTrigger>
              <TabsTrigger value="sold" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Sold Items
              </TabsTrigger>
            </TabsList>

            {/* Pending Orders Tab */}
            <TabsContent value="pending" className="mt-6">
              <div className="grid gap-4">
                {pendingOrders.map((order) => (
                  <Card key={order._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>Order #{order._id}</CardTitle>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Item:</span>
                          <span className="font-medium">{order.item.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seller:</span>
                          <span className="font-medium">{order.item.sellerId.firstName} {order.item.sellerId.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 p-2 bg-gray-50 rounded">
                          <span className="text-gray-600">OTP for Delivery:</span>
                          <span className="font-bold text-lg">{otps[order._id]}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingOrders.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No pending orders</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Bought Items Tab */}
            <TabsContent value="bought" className="mt-6">
              <div className="grid gap-4">
                {boughtItems.map((order) => (
                  <Card key={order._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>Order #{order._id}</CardTitle>
                        <Badge variant="success">{order.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Item:</span>
                          <span className="font-medium">{order.item.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seller:</span>
                          <span className="font-medium">{order.item.sellerId.firstName} {order.item.sellerId.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {boughtItems.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No bought items</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Sold Items Tab */}
            <TabsContent value="sold" className="mt-6">
              <div className="grid gap-4">
                {soldItems.map((order) => (
                  <Card key={order._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>Order #{order._id}</CardTitle>
                        <Badge variant="success">{order.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Item:</span>
                          <span className="font-medium">{order.item.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Buyer:</span>
                          <span className="font-medium">{order.buyerId.firstName} {order.buyerId.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {soldItems.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No sold items</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default OrderHistory;