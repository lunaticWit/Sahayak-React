'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, FarmerProfile, BuyerProfile, UserRole, CropListing, Order, BuyerRequirement } from '@/types';
import { DEMO_USERS, INITIAL_LISTINGS, INITIAL_ORDERS, INITIAL_REQUIREMENTS } from '@/lib/mockData';

interface AuthContextType {
  currentUser: UserProfile;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  listings: CropListing[];
  addListing: (listing: Omit<CropListing, 'id' | 'created_at'>) => void;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  createOrder: (order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => Order;
  requirements: BuyerRequirement[];
  addRequirement: (req: Omit<BuyerRequirement, 'id' | 'created_at'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('farmer');
  const [listings, setListings] = useState<CropListing[]>(INITIAL_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [requirements, setRequirements] = useState<BuyerRequirement[]>(INITIAL_REQUIREMENTS);

  useEffect(() => {
    const savedRole = localStorage.getItem('sahayak_active_role') as UserRole;
    if (savedRole && DEMO_USERS[savedRole]) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_active_role', newRole);
    }
  };

  const currentPersona = DEMO_USERS[role] || DEMO_USERS.farmer;

  const addListing = (newListingData: Omit<CropListing, 'id' | 'created_at'>) => {
    const newListing: CropListing = {
      ...newListingData,
      id: `l-custom-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              updated_at: new Date().toISOString(),
              payment_status: status === 'cancelled' || status === 'rejected' ? ord.payment_status : 'captured',
            }
          : ord
      )
    );
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Order => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      order_number: `SHK-2026-${randomSuffix}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const addRequirement = (reqData: Omit<BuyerRequirement, 'id' | 'created_at'>) => {
    const newReq: BuyerRequirement = {
      ...reqData,
      id: `req-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setRequirements((prev) => [newReq, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentPersona.profile,
        farmerProfile: currentPersona.farmer,
        buyerProfile: currentPersona.buyer,
        role,
        setRole,
        listings,
        addListing,
        orders,
        updateOrderStatus,
        createOrder,
        requirements,
        addRequirement,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
