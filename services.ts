import { User, Role, FarmerStatus, Product, Article, DevicePurchase, ProduceOrder, ProduceOrderStatus } from './types';
import { WEATHER_API_KEY, CHATBOT_API_URL, CHATBOT_API_KEY, ADMIN_ID, MOCK_FARMER_ID, MOCK_BUYER_ID } from './constants';

// --- MOCK DATABASE ---
let users: User[] = [
    { id: ADMIN_ID, email: 'admin@gmail.com', password: 'admin', name: 'Admin Tani', role: Role.ADMIN, nik: '123456789', domicile: 'Jakarta', age: 30 },
    { id: MOCK_FARMER_ID, email: 'petani@temantani.com', password: 'password123', name: 'Budi Santoso', role: Role.FARMER, farmerStatus: FarmerStatus.REGISTERED, location: { lat: -6.200000, lon: 106.816666 }, nik: '987654321', domicile: 'Bogor', age: 45 },
    { id: MOCK_BUYER_ID, email: 'pembeli@temantani.com', password: 'password123', name: 'Siti Aminah', role: Role.BUYER, nik: '555566667', domicile: 'Bandung', age: 28 },
];

let products: Product[] = [
    { id: 'prod-1', farmerId: MOCK_FARMER_ID, farmerName: 'Budi Santoso', name: 'Tomat Ceri Organik', price: 25000, stock: 100, imageUrl: 'https://picsum.photos/seed/tomato/400/300', description: 'Tomat ceri segar langsung dari kebun, ditanam tanpa pestisida.' },
    { id: 'prod-2', farmerId: MOCK_FARMER_ID, farmerName: 'Budi Santoso', name: 'Bayam Hijau Segar', price: 15000, stock: 200, imageUrl: 'https://picsum.photos/seed/spinach/400/300', description: 'Bayam hijau kaya nutrisi, cocok untuk tumis atau jus.' },
    { id: 'prod-3', farmerId: 'farmer-002', farmerName: 'Dewi Lestari', name: 'Wortel Manis', price: 18000, stock: 150, imageUrl: 'https://picsum.photos/seed/carrot/400/300', description: 'Wortel manis dan renyah, baik untuk kesehatan mata.' },
];

let articles: Article[] = [
    { id: 'art-1', title: '5 Tips Jitu Merawat Tanaman Tomat di Musim Hujan', content: 'Musim hujan bisa menjadi tantangan tersendiri bagi petani tomat. Berikut adalah 5 tips untuk memastikan tanaman tomat Anda tetap sehat dan produktif...', author: 'Admin Tani', createdAt: new Date().toISOString() },
    { id: 'art-2', title: 'Mengenal Manfaat Pertanian Organik untuk Lingkungan', content: 'Pertanian organik tidak hanya baik untuk kesehatan kita, tetapi juga untuk kelestarian lingkungan. Mari kita pelajari lebih lanjut...', author: 'Admin Tani', createdAt: new Date().toISOString() },
];

let devicePurchases: DevicePurchase[] = [];
let produceOrders: ProduceOrder[] = [];

// Tambahkan interface untuk chat
interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    receiverName: string;
    message: string;
    timestamp: string;
    read: boolean;
}

// Tambahkan storage untuk chat
let chats: ChatMessage[] = [];

const simulateDelay = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 500));

interface RegisterData {
    name: string;
    email: string;
    role: Role;
    password?: string;
    nik: string;
    domicile: string;
    age: number;
}

// --- MOCK API SERVICE ---
export const mockApiService = {
  login: async (email: string, password: string): Promise<User | null> => {
    const user = users.find(u => u.email === email && u.password === password);
    return simulateDelay(user || null);
  },
  register: async (data: RegisterData): Promise<User> => {
    const { name, email, role, password, nik, domicile, age } = data;
    const newUser: User = { 
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        password,
        nik,
        domicile,
        age
    };
    if (role === Role.FARMER) {
      newUser.farmerStatus = FarmerStatus.REGISTERED;
      newUser.location = { lat: -6.200000, lon: 106.816666 }; // Default location
    }
    users.push(newUser);
    return simulateDelay(newUser);
  },
  getUserById: async (id: string): Promise<User | null> => {
    const user = users.find(u => u.id === id);
    return simulateDelay(user || null);
  },
   updateUser: async (userId: string, data: Partial<User>): Promise<User | null> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      return simulateDelay({ ...users[userIndex] });
    }
    return simulateDelay(null);
  },
  deleteUser: async (userId: string): Promise<boolean> => {
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    return simulateDelay(users.length < initialLength);
  },
  // This function now handles the entire onboarding flow, step by step
  updateFarmerStatus: async (farmerId: string, status: FarmerStatus): Promise<User | null> => {
      const userIndex = users.findIndex(u => u.id === farmerId && u.role === Role.FARMER);
      if (userIndex > -1) {
          users[userIndex].farmerStatus = status;
          // Also update the corresponding device purchase record
          const purchaseIndex = devicePurchases.findIndex(p => p.userId === farmerId);
          if (purchaseIndex > -1) {
              devicePurchases[purchaseIndex].status = status;
          }
          return simulateDelay({ ...users[userIndex] });
      }
      return simulateDelay(null);
  },
  // Creates the initial purchase record and updates user status atomically
  purchaseDevice: async (userId: string, userName: string): Promise<DevicePurchase> => {
      // Prevent duplicate purchases for the same user in this simulation
      if (devicePurchases.some(p => p.userId === userId)) {
          console.warn(`Purchase already exists for user ${userId}`);
          return devicePurchases.find(p => p.userId === userId)!;
      }

      const purchase: DevicePurchase = { 
          purchaseId: `dev-${Date.now()}`,
          userId, 
          userName, 
          packageName: 'Paket Tahunan', 
          date: new Date().toISOString(),
          status: FarmerStatus.PENDING_SHIPMENT // Status after successful payment
      };
      devicePurchases.push(purchase);
      
      // Directly update the user's status as part of the same transaction
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex > -1) {
          users[userIndex].farmerStatus = FarmerStatus.PENDING_SHIPMENT;
      }

      return simulateDelay(purchase);
  },
  getAllUsers: async (): Promise<User[]> => simulateDelay([...users]),
  getDevicePurchases: async (): Promise<DevicePurchase[]> => simulateDelay([...devicePurchases]),
  getProducts: async (): Promise<Product[]> => simulateDelay([...products]),
  getArticles: async (): Promise<Article[]> => simulateDelay([...articles]),
  createArticle: async (title: string, content: string): Promise<Article> => {
      const newArticle: Article = {
          id: `art-${Date.now()}`,
          title,
          content,
          author: 'Admin Tani',
          createdAt: new Date().toISOString()
      };
      articles.unshift(newArticle);
      return simulateDelay(newArticle);
  },
  updateArticle: async (articleId: string, data: { title: string, content: string }): Promise<Article | null> => {
    const articleIndex = articles.findIndex(a => a.id === articleId);
    if (articleIndex > -1) {
      articles[articleIndex] = { ...articles[articleIndex], ...data };
      return simulateDelay({ ...articles[articleIndex] });
    }
    return simulateDelay(null);
  },
  deleteArticle: async (articleId: string): Promise<boolean> => {
    const initialLength = articles.length;
    articles = articles.filter(a => a.id !== articleId);
    return simulateDelay(articles.length < initialLength);
  },

  // --- Produce Order Management ---
  createProduceOrder: async (buyer: User, product: Product): Promise<ProduceOrder> => {
      const newOrder: ProduceOrder = {
          orderId: `ord-${Date.now()}`,
          buyerId: buyer.id,
          buyerName: buyer.name,
          farmerId: product.farmerId,
          items: [{ productId: product.id, productName: product.name, quantity: 1, price: product.price }],
          total: product.price,
          orderDate: new Date().toISOString(),
          status: ProduceOrderStatus.PROCESSING, // Status after successful payment
      };
      produceOrders.push(newOrder);
      return simulateDelay(newOrder);
  },
  getOrdersForBuyer: async(buyerId: string): Promise<ProduceOrder[]> => {
      return simulateDelay(produceOrders.filter(o => o.buyerId === buyerId).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  },
  getOrdersForFarmer: async(farmerId: string): Promise<ProduceOrder[]> => {
      return simulateDelay(produceOrders.filter(o => o.farmerId === farmerId).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  },
  updateProduceOrderStatus: async(orderId: string, status: ProduceOrderStatus): Promise<ProduceOrder | null> => {
      const orderIndex = produceOrders.findIndex(o => o.orderId === orderId);
      if(orderIndex > -1) {
          produceOrders[orderIndex].status = status;
          return simulateDelay({...produceOrders[orderIndex]});
      }
      return simulateDelay(null);
  },

  // Product Management
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const newProduct = {
          id: `prod_${Date.now()}`,
          ...product
      };
      products.push(newProduct);
      return simulateDelay(newProduct);
  },

  updateProduct: async (productId: string, updates: Partial<Product>): Promise<Product | null> => {
      const index = products.findIndex(p => p.id === productId);
      if (index > -1) {
          products[index] = { ...products[index], ...updates };
          return simulateDelay(products[index]);
      }
      return simulateDelay(null);
  },

  deleteProduct: async (productId: string): Promise<boolean> => {
      const initialLength = products.length;
      products = products.filter(p => p.id !== productId);
      return simulateDelay(products.length < initialLength);
  },

  // Chat Management
  sendMessage: async (message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
      const newMessage = {
          id: `msg_${Date.now()}`,
          ...message,
          timestamp: new Date().toISOString(),
      };
      chats.push(newMessage);
      return simulateDelay(newMessage);
  },

  getChats: async (userId: string): Promise<ChatMessage[]> => {
      return simulateDelay(
          chats.filter(c => c.senderId === userId || c.receiverId === userId)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      );
  },

  markAsRead: async (messageIds: string[]): Promise<boolean> => {
      messageIds.forEach(id => {
          const msg = chats.find(c => c.id === id);
          if (msg) msg.read = true;
      });
      return simulateDelay(true);
  }
};

// --- WEATHER SERVICE ---
export const weatherService = {
  getWeather: async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=20bb443cf41991d2c9e31cac16348d6c&units=metric&lang=id`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      return await response.json();
    } catch (error) {
      console.error("Weather API Error:", error);
      return null;
    }
  }
};


// --- CHATBOT SERVICE ---
export const chatbotService = {
  getReply: async (prompt: string): Promise<string> => {
    // ✅ Pesan pembuka saat pertama kali muncul
    if (!prompt) {
      return "👩‍🌾 Hai! Saya adalah Asisten Teman Tani 🌱. Saya siap membantu Anda menjawab berbagai pertanyaan seputar pertanian, ladang, cuaca, dan lainnya. Silakan ajukan pertanyaan pertama Anda!";
    }

    try {
      // ✅ Tambahkan konteks tetap di depan prompt
      const fullPrompt = `
        Kamu adalah Asisten Teman Tani 🌱, asisten cerdas yang membantu petani Indonesia dalam urusan pertanian, ladang, panen, dan cuaca. 
        Jawablah selalu dalam bahasa Indonesia, tanpa tanda bintang (*), tanpa kalimat seperti 'ini jawaban', dan langsung ke inti jawaban.
        Pertanyaan petani: ${prompt}
      `;

      const response = await fetch(
        `https://api.ferdev.my.id/ai/chatgpt?prompt=${encodeURIComponent(fullPrompt)}&apikey=key-veng`
      );

      if (!response.ok) throw new Error("Failed to fetch chatbot reply");

      const data = await response.json();

      // ✅ Bersihkan hasil
      const cleanReply = (data.message || "Maaf, saya tidak mengerti. Bisa coba pertanyaan lain?")
        .replace(/\*/g, "") // hapus tanda *
        .replace(/ini jawaban:?/gi, "") // hapus teks 'ini jawaban'
        .trim();

      return cleanReply;
    } catch (error) {
      console.error("Chatbot API Error:", error);
      return "Maaf, sedang ada gangguan pada layanan AI. Silakan coba lagi nanti.";
    }
  }
};
