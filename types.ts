export enum Role {
  ADMIN = 'ADMIN',
  FARMER = 'FARMER',
  BUYER = 'BUYER',
}

// More granular status for the entire farmer onboarding journey
export enum FarmerStatus {
  REGISTERED = 'Terdaftar', // Just signed up
  PENDING_PAYMENT = 'Menunggu Pembayaran', // Clicked buy, needs to pay
  PENDING_SHIPMENT = 'Menunggu Pengiriman', // Paid, admin needs to ship
  SHIPPING = 'Dalam Pengiriman', // Admin has shipped
  DELIVERED = 'Barang Diterima', // Admin confirmed delivery
  PENDING_INSTALLATION_CONFIRMATION = 'Menunggu Konfirmasi Pemasangan', // Team installed, admin needs to verify
  ACTIVE = 'Aktif', // Verified, dashboard unlocked but device not connected
  DEVICE_OFFLINE = 'Belum Terkoneksi', // Needs to click "connect device"
  DEVICE_ONLINE = 'Online', // Fully operational
}

export enum ProduceOrderStatus {
    PENDING_PAYMENT = 'Menunggu Pembayaran',
    PROCESSING = 'Pesanan Diproses',
    SHIPPING = 'Dalam Pengiriman',
    COMPLETED = 'Selesai',
    CANCELED = 'Dibatalkan',
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: Role;
  farmerStatus?: FarmerStatus;
  location?: { lat: number, lon: number };
  nik?: string;
  domicile?: string;
  age?: number;
}

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface DevicePurchase {
  purchaseId: string;
  userId: string;
  userName: string;
  packageName: string;
  date: string;
  status: FarmerStatus; // Status of the purchase/onboarding
}

export interface ProduceOrder {
    orderId: string;
    buyerId: string;
    buyerName: string;
    farmerId: string;
    items: { productId: string, productName: string, quantity: number, price: number }[];
    total: number;
    orderDate: string;
    status: ProduceOrderStatus;
}


export interface SensorData {
  timestamp: Date;
  humidity: number;
  temperature: number;
  soilMoisture: number;  // percentage (0-100)
  soilTemperature: number; // celsius
}

export interface IrrigationStatus {
  isAutoMode: boolean;
  isPumpActive: boolean;
  lastActivation: Date;
  nextScheduledCheck: Date;
}

export interface IrrigationThresholds {
  minSoilMoisture: number;  // minimum soil moisture percentage
  maxSoilMoisture: number;  // maximum soil moisture percentage
  optimalSoilTemperature: number;  // optimal soil temperature in celsius
  temperatureThreshold: number;  // temperature threshold for irrigation
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    receiverName: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface FinancialInput {
    seeds: number;
    fertilizer: number;
    labor: number;
    others: number;
    harvestAmount: number;
    marketPrice: number;
}

export interface FinancialReport {
    totalCost: number;
    estimatedRevenue: number;
    profit: number;
    breakEvenPoint: number;
    breakEvenDays: number;
}
