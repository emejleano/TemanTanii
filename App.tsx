import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import { User, Role, FarmerStatus, Product, Article, DevicePurchase, SensorData, ProduceOrder, ProduceOrderStatus, ChatMessage, FinancialInput, FinancialReport } from './types';
import { mockApiService, weatherService, chatbotService } from './services';
import { Button, Card, Input, Modal, Spinner, IconLeaf, IconSun, IconDrop, IconChat, StatusBadge } from './components';

// --- ROUTER HOOK ---
const useHashRouter = () => {
    const [hash, setHash] = useState(window.location.hash);

    const handleHashChange = useCallback(() => {
        setHash(window.location.hash);
    }, []);

    useEffect(() => {
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [handleHashChange]);

    const path = hash.replace(/^#/, '') || '/';
    return path;
};

// --- AUTH CONTEXT ---
interface RegisterPayload {
    name: string;
    email: string;
    role: Role;
    password?: string;
    nik: string;
    domicile: string;
    age: number;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<boolean>;
  refreshUser: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
const useAuth = () => useContext(AuthContext)!;

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const userData = await mockApiService.getUserById(userId);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const userData = await mockApiService.login(email, pass);
    if (userData) {
      localStorage.setItem('userId', userData.id);
      setUser(userData);
      window.location.hash = '/dashboard';
      return true;
    }
    return false;
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    const newUser = await mockApiService.register(payload);
    if (newUser) {
      localStorage.setItem('userId', newUser.id);
      setUser(newUser);
      window.location.hash = '/dashboard';
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setUser(null);
    window.location.hash = '/';
  };
  
  const refreshUser = useCallback(async () => {
      if(user) {
          const updatedUser = await mockApiService.getUserById(user.id);
          setUser(updatedUser);
      }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- UI COMPONENTS ---
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, section?: string) => {
    e.preventDefault();
    
    // If user is logged in, first navigate to home page
    if (user) {
      window.location.hash = '/';
      // Wait for hash change to complete
      setTimeout(() => {
        // Then scroll to section if specified
        if (section) {
          const element = document.getElementById(section);
          element?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If not logged in, just scroll to section
      if (section) {
        const element = document.getElementById(section);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a 
            href="#" 
            onClick={(e) => handleNavigation(e)}
            className="flex-shrink-0 flex items-center cursor-pointer"
          >
            <img src="https://emejleano.github.io/TemanTanii/logo.png" alt="Logo Teman Tani" className="h-20 w-20" />
            <span className="ml-2 text-xl font-bold text-green-700">Teman Tani</span>
          </a>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a 
              href="#about" 
              onClick={(e) => handleNavigation(e, 'about')}
              className="text-gray-500 hover:text-green-600 inline-flex items-center px-1 pt-1 text-sm font-medium"
            >
              Tentang Kami
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleNavigation(e, 'features')}
              className="text-gray-500 hover:text-green-600 inline-flex items-center px-1 pt-1 text-sm font-medium"
            >
              Fitur
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavigation(e, 'contact')}
              className="text-gray-500 hover:text-green-600 inline-flex items-center px-1 pt-1 text-sm font-medium"
            >
              Kontak
            </a>
          </div>
          <div className="flex items-center">
            {user ? (
              <Button onClick={() => logout()} variant="secondary">Logout</Button>
            ) : (
              <>
                <Button onClick={() => window.location.hash = '/login'} variant="secondary" className="mr-2">Login</Button>
                <Button onClick={() => window.location.hash = '/register'} variant="primary">Daftar</Button>
              </>
              )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
    <footer className="bg-gray-100" id="contact">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                <div className="space-y-8 xl:col-span-1">
                     <div className="flex-shrink-0 flex items-center">
                        <img src="https://emejleano.github.io/TemanTanii/logo.png" alt="Logo Teman Tani" className="h-20 w-20" />
                        <span className="ml-2 text-xl font-bold text-green-700">Teman Tani</span>
                    </div>
                    <p className="text-gray-500 text-base">
                        Memodernisasi pertanian Indonesia dengan teknologi cerdas.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                    <div className="md:grid md:grid-cols-2 md:gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Solusi</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">IoT Monitoring</a></li>
                                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Marketplace</a></li>
                                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Analitik AI</a></li>
                            </ul>
                        </div>
                        <div className="mt-12 md:mt-0">
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</a></li>
                                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12 border-t border-gray-200 pt-8">
                <p className="text-base text-gray-400 xl:text-center">&copy; 2024 Teman Tani. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

// --- Reusable Payment Modal ---
const PaymentModal: React.FC<{ isOpen: boolean; onClose: () => void; onPaymentSuccess: () => void; amount: number; }> = ({ isOpen, onClose, onPaymentSuccess, amount }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePay = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => {
                onPaymentSuccess();
                onClose();
                // Important: Reset success state after closing
                setTimeout(() => setSuccess(false), 500);
            }, 2000); // Show success message for 2 seconds
        }, 1500); // Simulate payment processing
    };

    const handleClose = () => {
      if (!loading) {
        onClose();
        // Reset success state if modal is closed before timeout
        setSuccess(false);
      }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Lakukan Pembayaran">
            {success ? (
                <div className="text-center p-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Pembayaran Berhasil!</h3>
                    <p className="text-sm text-gray-500 mt-2">Terima kasih! Pesanan Anda sedang kami proses.</p>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-600">Pilih metode pembayaran Anda:</p>
                    <div className="space-y-4 mt-4">
                        <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">QRIS</button>
                        <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">Bank Transfer</button>
                    </div>
                    <div className="mt-6 border-t pt-4">
                        <p className="text-lg font-semibold text-right">Total: Rp {amount.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="mt-6">
                        <Button onClick={handlePay} disabled={loading} className="w-full">
                            {loading ? <Spinner /> : 'Bayar Sekarang'}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// --- CHAT BOX COMPONENT ---
const ChatBox: React.FC<{
    userId: string;
    userName: string;
    partnerId: string;
    partnerName: string;
    onClose: () => void;
}> = ({ userId, userName, partnerId, partnerName, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = useCallback(async () => {
        const chats = await mockApiService.getChats(userId);
        setMessages(chats.filter(c => 
            (c.senderId === userId && c.receiverId === partnerId) ||
            (c.senderId === partnerId && c.receiverId === userId)
        ));
        setLoading(false);
    }, [userId, partnerId]);

    useEffect(() => {
        loadMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [loadMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await mockApiService.sendMessage({
            senderId: userId,
            senderName: userName,
            receiverId: partnerId,
            receiverName: partnerName,
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
            read: false,
        });

        setNewMessage('');
        loadMessages();
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg flex flex-col" style={{ height: '500px' }}>
            <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-semibold">{partnerName}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        {messages.map(msg => (
                            <div key={msg.id} 
                                className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-2 rounded-lg ${
                                    msg.senderId === userId ? 
                                    'bg-green-500 text-white' : 
                                    'bg-gray-200'
                                }`}>
                                    {msg.message}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            <form onSubmit={handleSend} className="p-3 border-t">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>Kirim</Button>
                </div>
            </form>
        </div>
    );
};

// --- PAGES & DASHBOARDS ---
const HomePage = () => (
  <>
    <main>
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Pertanian Cerdas untuk</span>{' '}
                  <span className="block text-green-600 xl:inline">Masa Depan Indonesia</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Teman Tani adalah platform revolusioner yang mengintegrasikan IoT, AI, dan marketplace untuk membantu petani meningkatkan hasil panen dan profitabilitas.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                     <Button onClick={() => window.location.hash = '/register'} variant="primary">Mulai Sekarang</Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://i.pinimg.com/1200x/62/d8/1d/62d81d5394fdff21d07134d422fdb0d8.jpg" alt="Farmer in a field" />
        </div>
      </div>

      {/* About Section */}
       <div id="about" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Tentang Kami</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Misi Kami untuk Petani
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Kami percaya bahwa teknologi dapat menjadi sahabat terbaik petani. Misi kami adalah menyediakan alat yang mudah digunakan, data yang akurat, dan akses pasar yang lebih luas untuk setiap petani di Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Fitur Unggulan</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Semua yang Anda Butuhkan
            </p>
          </div>
          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Monitoring IoT</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Pantau kondisi lahan Anda secara real-time, dari kelembapan tanah hingga suhu, langsung dari dashboard.
                </dd>
              </div>
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Rekomendasi AI</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Dapatkan saran cerdas dari AI kami untuk waktu penyiraman, pemupukan, dan prediksi panen.
                </dd>
              </div>
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Marketplace Hasil Panen</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Jual hasil panen Anda langsung ke pembeli tanpa perantara, dengan harga yang lebih baik.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  </>
);

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await login(email, password);
        if (!success) {
            setError('Email atau password salah.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
   <img src="https://emejleano.github.io/TemanTanii/logo.png" alt="Logo Teman Tani" className="h-20 w-20" />
</div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login ke Akun Anda</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Atau{' '}
                     <button onClick={() => window.location.hash = '/register'} className="font-medium text-green-600 hover:text-green-500">
                        buat akun baru
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="px-4 py-8 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input id="email" label="Alamat Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Spinner/> : 'Login'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', nik: '', domicile: '', age: '', role: Role.BUYER });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { name, email, role, password, nik, domicile, age } = formData;
        if (!name || !email || !password || !nik || !domicile || !age) {
            setError('Semua field harus diisi.');
            setLoading(false);
            return;
        }
        
        const success = await register({ name, email, role, password, nik, domicile, age: parseInt(age) });

        if (!success) {
            setError('Gagal mendaftarkan akun. Email mungkin sudah digunakan.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
   <img src="https://emejleano.github.io/TemanTanii/logo.png" alt="logo." className="h-20 w-20" />
</div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
                 <p className="mt-2 text-center text-sm text-gray-600">
                    Atau{' '}
                     <button onClick={() => window.location.hash = '/login'} className="font-medium text-green-600 hover:text-green-500">
                        login ke akun yang sudah ada
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                 <Card className="px-4 py-8 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input name="name" label="Nama Lengkap" type="text" onChange={handleChange} required />
                        <Input name="email" label="Alamat Email" type="email" onChange={handleChange} required />
                        <Input name="password" label="Password" type="password" onChange={handleChange} required />
                        <Input name="nik" label="NIK (sesuai KTP)" type="text" onChange={handleChange} required />
                        <Input name="domicile" label="Domisili" type="text" onChange={handleChange} required />
                        <Input name="age" label="Umur" type="number" onChange={handleChange} required />
                        
                         <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Daftar sebagai</label>
                          <select id="role" name="role" onChange={handleChange} value={formData.role} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                            <option value={Role.BUYER}>Pembeli</option>
                            <option value={Role.FARMER}>Petani</option>
                          </select>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Spinner/> : 'Daftar'}
                            </Button>
                        </div>
                    </form>
                 </Card>
            </div>
        </div>
    );
};

// --- AUTHENTICATED APP LAYOUT ---
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout } = useAuth();
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar would be here in a more complex app */}
            {/* <Sidebar /> */}
            <div className="flex-1 flex flex-col overflow-hidden">
                 <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                        <Button onClick={logout} variant="secondary">Logout</Button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

// --- DASHBOARDS ---
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState<User[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [purchases, setPurchases] = useState<DevicePurchase[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State for modals
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [isArticleModalOpen, setArticleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [usersData, articlesData, purchasesData] = await Promise.all([
            mockApiService.getAllUsers(),
            mockApiService.getArticles(),
            mockApiService.getDevicePurchases(),
        ]);
        setUsers(usersData);
        setArticles(articlesData);
        setPurchases(purchasesData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // User Management Handlers
    const handleUpdateFarmerStatus = async (farmerId: string, newStatus: FarmerStatus) => {
        await mockApiService.updateFarmerStatus(farmerId, newStatus);
        fetchData(); // Refresh data
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setUserModalOpen(true);
        setIsEditing(false);
    };
    
    // Article Management Handlers
    const handleSaveArticle = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const title = e.currentTarget.articleTitle.value;
        const content = e.currentTarget.content.value;
        
        if (isEditing && selectedArticle) {
            await mockApiService.updateArticle(selectedArticle.id, { title, content });
        } else {
            await mockApiService.createArticle(title, content);
        }
        
        setArticleModalOpen(false);
        setSelectedArticle(null);
        fetchData();
    };

    const handleEditArticle = (article: Article) => {
        setSelectedArticle(article);
        setIsEditing(true);
        setArticleModalOpen(true);
    };
    
    const handleDeleteArticle = async (articleId: string) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            await mockApiService.deleteArticle(articleId);
            fetchData();
        }
    };

    if (loading) return <Spinner />;
    
    const renderUserManagement = () => (
      <Card>
        <h2 className="text-xl font-bold mb-4">Manajemen Pengguna</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Petani</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role === Role.FARMER && user.farmerStatus && <StatusBadge status={user.farmerStatus} />}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button onClick={() => handleViewUser(user)} size="sm" variant="secondary">Detail</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );

    const renderArticleManagement = () => (
      <Card>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manajemen Artikel</h2>
            <Button onClick={() => { setSelectedArticle(null); setIsEditing(false); setArticleModalOpen(true); }}>Tambah Artikel</Button>
        </div>
         <div className="space-y-4">
            {articles.map(article => (
                <div key={article.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-gray-500">Oleh {article.author} - {new Date(article.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-x-2">
                        <Button onClick={() => handleEditArticle(article)} size="sm" variant="secondary">Edit</Button>
                        <Button onClick={() => handleDeleteArticle(article.id)} size="sm" variant="danger">Hapus</Button>
                    </div>
                </div>
            ))}
        </div>
      </Card>
    );
    
    const renderPurchaseManagement = () => (
        <Card>
            <h2 className="text-xl font-bold mb-4">Riwayat Pembelian Perangkat</h2>
            <div className="space-y-3">
                {purchases.length > 0 ? purchases.map(p => (
                    <div key={p.purchaseId} className="p-4 border rounded-lg">
                        <p className="font-semibold">{p.userName} membeli {p.packageName}</p>
                        <p className="text-sm text-gray-500">Tanggal: {new Date(p.date).toLocaleString()}</p>
                        <div className="mt-2 flex items-center space-x-2">
                            <span>Status:</span>
                            <StatusBadge status={p.status} />
                        </div>
                    </div>
                )) : <p>Belum ada pembelian perangkat.</p>}
            </div>
        </Card>
    );

    return (
        <div>
            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('users')} className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Manajemen User</button>
                <button onClick={() => setActiveTab('articles')} className={`py-2 px-4 ${activeTab === 'articles' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Manajemen Artikel</button>
                 <button onClick={() => setActiveTab('purchases')} className={`py-2 px-4 ${activeTab === 'purchases' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Pembelian Perangkat</button>
            </div>
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'articles' && renderArticleManagement()}
            {activeTab === 'purchases' && renderPurchaseManagement()}
            
            {/* User Detail & Verification Modal */}
            <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)} title={`Detail Pengguna: ${selectedUser?.name}`}>
                {selectedUser && (
                    <div className="space-y-4">
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>NIK:</strong> {selectedUser.nik}</p>
                        <p><strong>Domisili:</strong> {selectedUser.domicile}</p>
                        <p><strong>Umur:</strong> {selectedUser.age}</p>
                        {selectedUser.role === Role.FARMER && (
                            <>
                                <hr/>
                                <h3 className="font-semibold">Status Petani</h3>
                                <div className="flex items-center space-x-2">
                                    <StatusBadge status={selectedUser.farmerStatus!} />
                                </div>
                                <h4 className="font-semibold mt-4">Ubah Status:</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" onClick={() => handleUpdateFarmerStatus(selectedUser.id, FarmerStatus.SHIPPING)} disabled={selectedUser.farmerStatus !== FarmerStatus.PENDING_SHIPMENT}>Verifikasi Pengiriman</Button>
                                    <Button size="sm" onClick={() => handleUpdateFarmerStatus(selectedUser.id, FarmerStatus.DELIVERED)} disabled={selectedUser.farmerStatus !== FarmerStatus.SHIPPING}>Barang Telah Sampai</Button>
                                    <Button size="sm" onClick={() => handleUpdateFarmerStatus(selectedUser.id, FarmerStatus.ACTIVE)} disabled={selectedUser.farmerStatus !== FarmerStatus.DELIVERED}>Pemasangan Selesai</Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
            
            {/* Article Create/Edit Modal */}
            <Modal isOpen={isArticleModalOpen} onClose={() => setArticleModalOpen(false)} title={isEditing ? 'Edit Artikel' : 'Tambah Artikel Baru'}>
                <form onSubmit={handleSaveArticle} className="space-y-4">
                    <Input id="articleTitle" label="Judul" defaultValue={selectedArticle?.title || ''} required />
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Konten</label>
                        <textarea id="content" name="content" rows={5} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" defaultValue={selectedArticle?.content || ''} required></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setArticleModalOpen(false)}>Batal</Button>
                        <Button type="submit">Simpan</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const FinancialDashboard = () => {
    const [inputs, setInputs] = useState<FinancialInput>({
        seeds: 0,
        fertilizer: 0,
        labor: 0,
        others: 0,
        harvestAmount: 0,
        marketPrice: 0
    });
    const [report, setReport] = useState<FinancialReport | null>(null);

    const calculateFinancials = () => {
        const totalCost = inputs.seeds + inputs.fertilizer + inputs.labor + inputs.others;
        const estimatedRevenue = inputs.harvestAmount * inputs.marketPrice;
        const profit = estimatedRevenue - totalCost;
        
        // Break-even calculations
        const breakEvenPoint = totalCost / inputs.marketPrice;
        // Assume 120 days for typical harvest cycle
        const breakEvenDays = (breakEvenPoint / inputs.harvestAmount) * 120;

        setReport({
            totalCost,
            estimatedRevenue,
            profit,
            breakEvenPoint,
            breakEvenDays
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: Number(value) || 0
        }));
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4">Dashboard Keuangan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Input Biaya Produksi</h3>
                    
                    <div>
                        <label className="block text-sm text-gray-600">Biaya Benih</label>
                        <Input
                            type="number"
                            name="seeds"
                            value={inputs.seeds}
                            onChange={handleInputChange}
                            placeholder="Rp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600">Biaya Pupuk</label>
                        <Input
                            type="number"
                            name="fertilizer"
                            value={inputs.fertilizer}
                            onChange={handleInputChange}
                            placeholder="Rp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600">Biaya Tenaga Kerja</label>
                        <Input
                            type="number"
                            name="labor"
                            value={inputs.labor}
                            onChange={handleInputChange}
                            placeholder="Rp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600">Biaya Lain-lain</label>
                        <Input
                            type="number"
                            name="others"
                            value={inputs.others}
                            onChange={handleInputChange}
                            placeholder="Rp"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-lg mb-2">Estimasi Pendapatan</h3>
                        
                        <div>
                            <label className="block text-sm text-gray-600">Perkiraan Hasil Panen (kg)</label>
                            <Input
                                type="number"
                                name="harvestAmount"
                                value={inputs.harvestAmount}
                                onChange={handleInputChange}
                                placeholder="kg"
                            />
                        </div>

                        <div className="mt-2">
                            <label className="block text-sm text-gray-600">Harga Pasar per kg</label>
                            <Input
                                type="number"
                                name="marketPrice"
                                value={inputs.marketPrice}
                                onChange={handleInputChange}
                                placeholder="Rp/kg"
                            />
                        </div>
                    </div>

                    <Button onClick={calculateFinancials} className="w-full">
                        Hitung Proyeksi
                    </Button>
                </div>

                {/* Results Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Hasil Analisis Keuangan</h3>
                    
                    {report ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-white rounded-md">
                                <p className="text-sm text-gray-600">Total Biaya Produksi</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(report.totalCost)}</p>
                            </div>

                            <div className="p-3 bg-white rounded-md">
                                <p className="text-sm text-gray-600">Estimasi Pendapatan</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(report.estimatedRevenue)}</p>
                            </div>

                            <div className="p-3 bg-white rounded-md">
                                <p className="text-sm text-gray-600">Proyeksi Keuntungan</p>
                                <p className={`text-xl font-bold ${report.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(report.profit)}
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Break-even Point (BEP)</h4>
                                <p className="text-sm text-gray-600">
                                    Anda perlu menjual minimal {report.breakEvenPoint.toFixed(1)} kg untuk mencapai BEP
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Perkiraan waktu mencapai BEP: {report.breakEvenDays.toFixed(0)} hari
                                </p>
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                                * Perhitungan ini adalah estimasi dan dapat berbeda dengan hasil aktual
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            Isi form di sebelah kiri dan klik "Hitung Proyeksi" untuk melihat analisis
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

// Fungsi untuk menghitung Eco-Score
const calculateEcoScore = ({
  debit_air_L_per_menit,
  durasi_pompa_menit,
  flow_rate_L_per_detik,
  durasi_sprayer_detik,
  pupuk_digunakan,
  pestisida_digunakan,
  energi_kWh,
  limbah_kg,
  ideal_air_L = 5000, // Default nilai ideal
  pupuk_ideal = 5,
  pestisida_ideal = 2,
  co2_ideal = 10, // Energi dalam kWh
  limbah_ideal = 3,
}) => {
  // Pastikan nilai input tidak terlalu kecil
  pupuk_digunakan = Math.max(pupuk_digunakan, 0.1);
  pestisida_digunakan = Math.max(pestisida_digunakan, 0.1);
  energi_kWh = Math.max(energi_kWh, 0.1);
  limbah_kg = Math.max(limbah_kg, 0.1);

  // Hitung total penggunaan air
  const total_air = (debit_air_L_per_menit * durasi_pompa_menit) + (flow_rate_L_per_detik * durasi_sprayer_detik);

  // Hitung skor masing-masing kategori (0-100) menggunakan rasio logaritmik
  const skor_air = Math.max(0, 100 - (Math.abs(total_air - ideal_air_L) / ideal_air_L) * 100);
  const skor_pupuk = Math.max(0, 100 - (Math.abs(Math.log10(pupuk_digunakan / pupuk_ideal)) * 100));
  const skor_pestisida = Math.max(0, 100 - (Math.abs(Math.log10(pestisida_digunakan / pestisida_ideal)) * 100));
  const skor_energi = Math.max(0, 100 - (Math.abs(Math.log10(energi_kWh / co2_ideal)) * 100));
  const skor_limbah = Math.max(0, 100 - (Math.abs(Math.log10(limbah_kg / limbah_ideal)) * 100));

  // Hitung total Eco-Score (rata-rata tertimbang)
  const eco_score_total = (
    skor_air * 0.25 +
    skor_pupuk * 0.20 +
    skor_pestisida * 0.20 +
    skor_energi * 0.20 +
    skor_limbah * 0.15
  );

  return {
    eco_score_total: +eco_score_total.toFixed(2),
    skor_air: +skor_air.toFixed(2),
    skor_pupuk: +skor_pupuk.toFixed(2),
    skor_pestisida: +skor_pestisida.toFixed(2),
    skor_energi: +skor_energi.toFixed(2),
    skor_limbah: +skor_limbah.toFixed(2),
  };
};

const FarmerDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [ecoInput, setEcoInput] = useState({
  pupuk_digunakan: 0,
  pestisida_digunakan: 0,
  energi_kWh: 0,
  limbah_kg: 0,
});
  // Fungsi untuk interpretasi skor Eco-Score
const interpretEcoScore = (score: number) => {
  if (score <= 30) {
    return {
      category: 'Buruk',
      description: 'Dampak negatif terhadap lingkungan sangat tinggi.',
      recommendation: 'Kurangi penggunaan pupuk dan pestisida kimia. Tingkatkan efisiensi penggunaan air dan energi.',
    };
  } else if (score <= 60) {
    return {
      category: 'Sedang',
      description: 'Masih ada ruang untuk perbaikan.',
      recommendation: 'Optimalkan penggunaan sumber daya dan kurangi limbah untuk meningkatkan keberlanjutan.',
    };
  } else {
    return {
      category: 'Baik',
      description: 'Praktik pertanian Anda ramah lingkungan.',
      recommendation: 'Pertahankan praktik ini dan terus tingkatkan efisiensi.',
    };
  }
};
  // Tambahkan state untuk fitur Smart Mist Sprayer
const [sprayerStatus, setSprayerStatus] = useState(false); // ON/OFF status
const [sprayerMode, setSprayerMode] = useState<'manual' | 'auto'>('manual'); // Mode sprayer
const [humidityTarget, setHumidityTarget] = useState({ min: 60, max: 70 }); // Target kelembapan
const [sprayHistory, setSprayHistory] = useState<{ date: string; duration: number }[]>([]); // Riwayat penyemprotan

// Logika untuk mode otomatis
useEffect(() => {
  const currentHumidity = sensorData.length > 0 ? sensorData[sensorData.length - 1].humidity : null;
  if (sprayerMode === 'auto' && !sprayerStatus && currentHumidity !== null && currentHumidity < humidityTarget.min) {
    setSprayerStatus(true); // Aktifkan sprayer
    const duration = 5; // Durasi penyemprotan (detik)
    setTimeout(() => {
      setSprayerStatus(false); // Matikan sprayer setelah durasi
      setSprayHistory(prev => [
        ...prev,
        { date: new Date().toLocaleString(), duration },
      ]); // Tambahkan ke riwayat
    }, duration * 1000);
  }
}, [sprayerMode, sprayerStatus, sensorData, humidityTarget]);


  const [chatbotHistory, setChatbotHistory] = useState<{ user: string; bot: string }[]>([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isChatbotLoading, setChatbotLoading] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orders, setOrders] = useState<ProduceOrder[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- NEW state for requested features ---
  const [ecoScore, setEcoScore] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [forecastResult, setForecastResult] = useState<string | null>(null);
  const [forecastChartData, setForecastChartData] = useState<number[] | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Form to input historical harvests for forecasting
  const [forecastForm, setForecastForm] = useState({
    commodity: '',
    months: [
      { label: 'Bulan -2', value: '' },
      { label: 'Bulan -1', value: '' },
      { label: 'Bulan Saat Ini', value: '' },
    ],
  });

  // Marketplace mock (store products in localStorage)
  const MARKETPLACE_KEY = `temantani_marketplace_${user?.id || 'anon'}`;
  const [myProducts, setMyProducts] = useState<Product[]>(() => {
    try {
      const raw = localStorage.getItem(MARKETPLACE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '', imageUrl: '' });

  // canvas ref for forecast chart
  const forecastCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (user?.location) {
      weatherService.getWeather(user.location.lat, user.location.lon).then(setWeather);
    }
    if (user?.id) {
      mockApiService.getOrdersForFarmer(user.id).then(setOrders);
    }
  }, [user]);

  // Sensor polling (only when DEVICE_ONLINE)
  useEffect(() => {
    if (user?.farmerStatus === FarmerStatus.DEVICE_ONLINE) {
      const interval = setInterval(() => {
        setSensorData(prev => {
          const newPoint = {
            timestamp: new Date(),
            humidity: +(40 + Math.random() * 30).toFixed(1), // 40-70%
            temperature: +(20 + Math.random() * 10).toFixed(1), // 20-30
          };
          const next = [...prev.slice(-59), newPoint]; // keep last 60 points
          return next;
        });
      }, 5000); // every 5s
      return () => clearInterval(interval);
    }
  }, [user?.farmerStatus]);

  // Chatbot
  const handleChatbotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatbotInput.trim()) return;
    const prompt = chatbotInput.trim();
    setChatbotInput('');
    setChatbotLoading(true);
    try {
      const reply = await chatbotService.getReply(prompt); // existing service
      setChatbotHistory(prev => [...prev, { user: prompt, bot: reply }]);
    } catch (err) {
      setChatbotHistory(prev => [...prev, { user: prompt, bot: 'Gagal mendapatkan jawaban AI.' }]);
    } finally {
      setChatbotLoading(false);
    }
  };

  // Device purchase flow
  const handleDevicePurchase = () => setPaymentModalOpen(true);
  const onPaymentSuccess = async () => {
    if (!user) return;
    await mockApiService.purchaseDevice(user.id, user.name);
    refreshUser();
  };

  // Connect device with loading simulation
  const handleConnectDevice = async () => {
    if (!user) return;
    setIsConnecting(true);
    // simulate network/device pairing
    setTimeout(async () => {
      await mockApiService.updateFarmerStatus(user.id, FarmerStatus.DEVICE_ONLINE);
      await refreshUser();
      setIsConnecting(false);
    }, 2500);
  };

  // Orders
  const handleUpdateOrderStatus = async (orderId: string, status: ProduceOrderStatus) => {
    await mockApiService.updateProduceOrderStatus(orderId, status);
    const updated = await mockApiService.getOrdersForFarmer(user!.id);
    setOrders(updated);
  };

  // Pump toggle with simulated water data when ON
  useEffect(() => {
    let pumpInterval: any = null;
    if (pumpStatus) {
      pumpInterval = setInterval(() => {
        // add "virtual" sensor point with small humidity increase due to watering
        setSensorData(prev => {
          const last = prev[prev.length - 1];
          const newH = last ? Math.min(100, last.humidity + (0.2 + Math.random() * 0.8)) : 50;
          const newPoint = {
            timestamp: new Date(),
            humidity: +newH.toFixed(1),
            temperature: last ? last.temperature : 25,
          };
          return [...prev.slice(-59), newPoint];
        });
      }, 3000);
    }
    return () => clearInterval(pumpInterval);
  }, [pumpStatus]);

  // Fungsi untuk menghitung Eco-Score berdasarkan data sensor dan input manual
const computeEcoScore = () => {
  if (sensorData.length === 0) {
    alert('Data sensor belum tersedia.');
    return;
  }

  const lastSensor = sensorData[sensorData.length - 1];
  const result = calculateEcoScore({
  debit_air_L_per_menit: 5, // Debit air lebih realistis
  durasi_pompa_menit: pumpStatus ? 10 : 0, // Durasi pompa lebih singkat
  flow_rate_L_per_detik: 0.5, // Flow rate mist sprayer tetap
  durasi_sprayer_detik: sprayerStatus ? 60 : 0, // Durasi sprayer tetap
  pupuk_digunakan: ecoInput.pupuk_digunakan,
  pestisida_digunakan: ecoInput.pestisida_digunakan,
  energi_kWh: ecoInput.energi_kWh,
  limbah_kg: ecoInput.limbah_kg,
});

  setEcoScore(result.eco_score_total.toFixed(2)); // Simpan total Eco-Score
  console.log('Detail Eco-Score:', result); // Debugging
};

  // Download "report" (mock) as a file (named .pdf for demo, content is plain text)
  const downloadSustainabilityReport = () => {
    const lines = [
      `Laporan Keberlanjutan - Teman Tani`,
      `Petani: ${user?.name || '-'}`,
      `Tanggal: ${new Date().toLocaleString()}`,
      `Eco-Score: ${ecoScore || '-'}`,
      '',
      'Ringkasan (mock):',
      '- Eco-score dihitung berdasarkan input pengguna & histori panen (mock).',
      '- Rekomendasi: Pertahankan praktik organik, kurangi pupuk kimia.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_keberlanjutan_${user?.id || 'anon'}.pdf`; // mock .pdf
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // --- Forecasting logic (simple linear extrapolation from last N months) ---
  const canRunForecast = () => {
    if (!forecastForm.commodity) return false;
    return forecastForm.months.every(m => m.value !== '' && !isNaN(Number(m.value)));
  };

  const runForecast = () => {
    if (!canRunForecast()) {
      alert('Isi semua field histori panen (angka) sebelum menjalankan prediksi.');
      return;
    }
    setForecastLoading(true);
    setTimeout(() => {
      // Simple model: average growth rate from the available months, then predict 3 months ahead
      const values = forecastForm.months.map(m => Number(m.value));
      // compute month-to-month growth rates (simple)
      const rates: number[] = [];
      for (let i = 1; i < values.length; i++) {
        const prev = values[i - 1];
        const cur = values[i];
        if (prev === 0) {
          rates.push(0);
        } else {
          rates.push((cur - prev) / prev);
        }
      }
      const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
      // forecast next 3 months
      const last = values[values.length - 1];
      const forecasts = [];
      let cur = last;
      for (let i = 1; i <= 3; i++) {
        cur = +(cur * (1 + avgRate)).toFixed(3);
        forecasts.push(cur);
      }
      const resultText = `Perkiraan hasil panen ${forecastForm.commodity} untuk 3 bulan ke depan: ${forecasts
        .map((v, i) => `Bulan +${i + 1}: ${v} ton/ha`)
        .join(' • ')}`;
      setForecastResult(resultText);

      // prepare chart data: historical + forecast
      const chartData = [...values, ...forecasts];
      setForecastChartData(chartData);
      setForecastLoading(false);
    }, 1200);
  };

  // draw forecast chart into canvas when chart data updates
  useEffect(() => {
    const canvas = forecastCanvasRef.current;
    if (!canvas || !forecastChartData) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const padding = 24;
    const w = 600;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    // clear
    ctx.clearRect(0, 0, w, h);
    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const max = Math.max(...forecastChartData) || 1;
    const min = Math.min(...forecastChartData) || 0;
    const range = max - min || 1;

    // axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // plot points
    const n = forecastChartData.length;
    const stepX = (w - padding * 2) / (n - 1 || 1);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#10b981'; // green
    ctx.beginPath();
    forecastChartData.forEach((val, i) => {
      const x = padding + stepX * i;
      const y = padding + ((max - val) / range) * (h - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // draw points
    ctx.fillStyle = '#10b981';
    forecastChartData.forEach((val, i) => {
      const x = padding + stepX * i;
      const y = padding + ((max - val) / range) * (h - padding * 2);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // labels (simple)
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Min: ${min}`, padding, h - 4);
    ctx.fillText(`Max: ${max}`, w - padding - 60, h - 4);
  }, [forecastChartData]);

  // Marketplace CRUD (localStorage-backed)
  const persistProducts = (next: Product[]) => {
    setMyProducts(next);
    try {
      localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleAddProduct = async () => {
    const { name, price, stock, imageUrl } = productForm;
    if (!name || !price || !stock) {
        alert('Isi nama, harga, dan stok produk.');
        return;
    }
    
    const newProduct = await mockApiService.createProduct({
        name,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`,
        farmerId: user?.id || 'anon',
        farmerName: user?.name || 'Anda',
        description: '',
    });
    
    setMyProducts([...myProducts, newProduct]);
    setProductForm({ name: '', price: '', stock: '', imageUrl: '' });
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, price: String(p.price), stock: String(p.stock), imageUrl: p.imageUrl || '' });
  };

  const handleSaveEditedProduct = () => {
    if (!editingProduct) return;
    const next = myProducts.map(p => (p.id === editingProduct.id ? { ...p, name: productForm.name, price: Number(productForm.price), stock: Number(productForm.stock), imageUrl: productForm.imageUrl } : p));
    persistProducts(next);
    setEditingProduct(null);
    setProductForm({ name: '', price: '', stock: '', imageUrl: '' });
  };

  const handleDeleteProduct = (id: string) => {
    if (!window.confirm('Hapus produk?')) return;
    persistProducts(myProducts.filter(p => p.id !== id));
  };

  // --- RENDER functions ---
  if (!user || !user.farmerStatus) return <Spinner />;

  if (user.farmerStatus === FarmerStatus.REGISTERED) {
    return (
      <Card className="text-center">
        <h2 className="text-2xl font-bold">Selamat Datang, Petani {user.name}!</h2>
        <p className="mt-4 text-gray-600">Langkah pertama Anda untuk menjadi petani cerdas adalah dengan memiliki perangkat IoT Teman Tani.</p>
        <div className="mt-6 border-t pt-6">
          <h3 className="text-xl font-semibold">Paket Perangkat Tahunan</h3>
          <p className="text-3xl font-bold my-4">Rp 350.000/bulan</p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <li>🌾 Paket Langganan TemanTani – Rp 350.000/bulan.<br></br>
            💻 Semua kebutuhan pertanian pintar dalam satu paket:</li>
            <li>✓ Sensor Kelembapan Tanah & Suhu</li>
            <li>✓ Pompa irigasi otomatis</li>
            <li>✓ Automatic Mist System / IoT Fogging Module</li>
            <li>✓ Modul Kontrol Pompa Otomatis</li>
            <li>✓ Garansi Perangkat 1 Tahun</li>
            <li>✓ Akses Penuh ke Dashboard</li>
            <li>📅 Tanpa biaya awal besar!
Hanya Rp 350.000 per bulan untuk seluruh solusi IoT pertanian modern.
Garansi perangkat dan pembaruan software termasuk selama masa langganan.</li>
          </ul>
          <Button onClick={handleDevicePurchase} className="mt-8">Beli dan Pasang Sekarang</Button>
        </div>
        <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} onPaymentSuccess={onPaymentSuccess} amount={350000} />
      </Card>
    );
  }

  if ([FarmerStatus.PENDING_PAYMENT, FarmerStatus.PENDING_SHIPMENT, FarmerStatus.SHIPPING, FarmerStatus.DELIVERED].includes(user.farmerStatus)) {
    const statuses = [FarmerStatus.PENDING_SHIPMENT, FarmerStatus.SHIPPING, FarmerStatus.DELIVERED, FarmerStatus.ACTIVE];
    const currentStatusIndex = statuses.indexOf(user.farmerStatus);
    return (
      <Card>
        <h2 className="text-2xl font-bold text-center mb-8">Status Pemasangan Perangkat Anda</h2>
        <ol className="relative border-l border-gray-200">
          {statuses.map((status, index) => (
            <li key={status} className="mb-10 ml-6">
              <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-8 ring-white ${index <= currentStatusIndex ? 'bg-green-500' : 'bg-gray-300'}`}>
                {index <= currentStatusIndex && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
              </span>
              <h3 className={`font-semibold ${index <= currentStatusIndex ? 'text-gray-900' : 'text-gray-400'}`}>{status}</h3>
              <p className="text-sm text-gray-500">Menunggu konfirmasi dari tim kami.</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-gray-600">Kami akan segera menghubungi Anda. Terima kasih telah bersabar.</p>
      </Card>
    );
  }

  // Active farmer dashboard
  const renderDashboardOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Sensor Data */}
      <Card className="lg:col-span-2">
        <h3 className="font-bold text-lg mb-4">Monitoring Lahan (Real-time)</h3>
        {user.farmerStatus === FarmerStatus.DEVICE_ONLINE ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-500">Kelembapan</p>
                <p className="text-3xl font-bold">{sensorData.length > 0 ? sensorData[sensorData.length - 1].humidity.toFixed(1) : '-'}%</p>
              </div>
              <div>
                <p className="text-gray-500">Suhu Tanah</p>
                <p className="text-3xl font-bold">{sensorData.length > 0 ? sensorData[sensorData.length - 1].temperature.toFixed(1) : '-'}°C</p>
              </div>
            </div>

            {/* small history sparkline (simple inline svg) */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Riwayat Kelembapan (terakhir)</p>
              <div className="w-full h-24 bg-white border rounded-md p-2">
                {sensorData.length > 0 ? (
                  <svg viewBox="0 0 300 50" className="w-full h-full">
                    {(() => {
                      const values = sensorData.slice(-30).map(s => s.humidity);
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      const range = max - min || 1;
                      const stepX = 300 / (values.length - 1 || 1);
                      return values.map((v, i) => {
                        const x = i * stepX;
                        const y = 50 - ((v - min) / range) * 48;
                        return <circle key={i} cx={x} cy={y} r={1.2} fill="#10b981" />;
                      });
                    })()}
                  </svg>
                ) : <p className="text-sm text-gray-400">Belum ada data sensor.</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            {isConnecting ? (
              <div className="flex flex-col items-center">
                <Spinner />
                <p className="text-gray-600 mt-2">Menghubungkan perangkat...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">Perangkat Anda belum terhubung ke sistem.</p>
                <Button onClick={handleConnectDevice}>Hubungkan Perangkat</Button>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Weather */}
      <Card>
        <h3 className="font-bold text-lg mb-4">Cuaca Hari Ini</h3>
        {weather ? (
          <div className="text-center">
            <p className="text-4xl font-bold">{weather.main.temp.toFixed(1)}°C</p>
            <p className="capitalize">{weather.weather[0].description}</p>
            <p className="text-sm text-gray-500">{weather.name}</p>
          </div>
        ) : <Spinner />}
      </Card>

      {/* Pump Control */}
      <Card>
        <h3 className="font-bold text-lg mb-4">Kontrol Pompa Irigasi</h3>
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-lg font-semibold ${pumpStatus ? 'text-green-600' : 'text-gray-500'}`}>{pumpStatus ? 'NYALA' : 'MATI'}</span>
          <button onClick={() => setPumpStatus(prev => !prev)} disabled={user.farmerStatus !== FarmerStatus.DEVICE_ONLINE} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${pumpStatus ? 'bg-green-600' : 'bg-gray-200'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${pumpStatus ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {pumpStatus && (
          <p className="text-sm text-blue-600 mt-2">
            Debit air: {(10 + Math.random() * 5).toFixed(2)} L/menit
          </p>
        )}
      </Card>

      {/* Smart Mist Sprayer Panel */}
<Card>
  <h3 className="font-bold text-lg mb-4">Smart Mist Sprayer</h3>
  <div className="grid grid-cols-2 gap-4 text-center">
    <div>
      <p className="text-gray-500">Kelembapan Udara</p>
      <p className="text-3xl font-bold">
  {sensorData.length > 0 ? sensorData[sensorData.length - 1].humidity.toFixed(1) : '-'}%
</p>
    </div>
    <div>
      <p className="text-gray-500">Status Sprayer</p>
      <p className={`text-lg font-semibold ${sprayerStatus ? 'text-green-600' : 'text-gray-500'}`}>
        {sprayerStatus ? 'Aktif' : 'Tidak Aktif'}
      </p>
    </div>
  </div>

  {/* Mode dan Kontrol */}
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700">Mode Sprayer</label>
    <select
      value={sprayerMode}
      onChange={e => setSprayerMode(e.target.value as 'manual' | 'auto')}
      className="mt-1 block w-full px-3 py-2 border rounded-md"
    >
      <option value="manual">Manual</option>
      <option value="auto">Otomatis</option>
    </select>
  </div>

  {/* Target Kelembapan */}
  {sprayerMode === 'auto' && (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Target Kelembapan (%)</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={humidityTarget.min}
          onChange={e => setHumidityTarget(prev => ({ ...prev, min: +e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Min"
        />
        <input
          type="number"
          value={humidityTarget.max}
          onChange={e => setHumidityTarget(prev => ({ ...prev, max: +e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Max"
        />
      </div>
    </div>
  )}

  {/* Tombol Manual */}
  {sprayerMode === 'manual' && (
    <div className="mt-4 flex items-center justify-center space-x-4">
      <span className={`text-lg font-semibold ${sprayerStatus ? 'text-green-600' : 'text-gray-500'}`}>
        {sprayerStatus ? 'NYALA' : 'MATI'}
      </span>
      <button
        onClick={() => setSprayerStatus(prev => !prev)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
          sprayerStatus ? 'bg-green-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            sprayerStatus ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )}

  {/* Riwayat Penyemprotan */}
  <div className="mt-6">
    <h4 className="font-semibold text-lg mb-2">Riwayat Penyemprotan</h4>
    <ul className="space-y-2 text-sm text-gray-600">
      {sprayHistory.length > 0 ? (
        sprayHistory.map((entry, index) => (
          <li key={index} className="flex justify-between">
            <span>{entry.date}</span>
            <span>{entry.duration} detik</span>
          </li>
        ))
      ) : (
        <li className="text-gray-400">Belum ada riwayat.</li>
      )}
    </ul>
  </div>
</Card>

      {/* Eco-Score */}
<Card>
  <h3 className="font-bold text-lg mb-4">Eco-Score Keberlanjutan</h3>
  {ecoScore ? (
    <div className="text-center">
      <p className="text-5xl font-bold text-green-600">{ecoScore}</p>
      <p className="text-sm text-gray-600 mt-2">Skor dihitung berdasarkan data LCA.</p>

      {/* Interpretasi Skor */}
      {(() => {
        const { category, description, recommendation } = interpretEcoScore(Number(ecoScore));
        return (
          <div className="mt-4 text-left">
            <p className="text-lg font-semibold">Interpretasi: <span className="text-green-600">{category}</span></p>
            <p className="text-sm text-gray-600 mt-2">{description}</p>
            <p className="text-sm text-gray-600 mt-2"><strong>Rekomendasi:</strong> {recommendation}</p>
          </div>
        );
      })()}

      <div className="mt-4 flex justify-center gap-2">
        <Button onClick={() => setEcoScore(null)} variant="secondary">Reset</Button>
        <Button onClick={downloadSustainabilityReport}>Unduh Laporan Keberlanjutan (PDF)</Button>
      </div>
    </div>
  ) : (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-4">Hitung Eco-Score untuk melihat laporan keberlanjutan.</p>
      <Button onClick={computeEcoScore}>Hitung Eco-Score</Button>
    </div>
  )}

{/* Input Manual untuk Eco-Score */}
<div className="mt-4">
  <h4 className="font-semibold text-lg mb-2">Input Manual</h4>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm text-gray-600">Pupuk (kg/hari)</label>
      <input
        type="number"
        step="any"
        value={ecoInput.pupuk_digunakan}
        onChange={e => {
          const value = e.target.value.replace(',', '.'); // Ganti koma dengan titik
          setEcoInput(prev => ({ ...prev, pupuk_digunakan: parseFloat(value) || 0 }));
        }}
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
    <div>
      <label className="block text-sm text-gray-600">Pestisida (kg/hari)</label>
      <input
        type="number"
        step="any"
        value={ecoInput.pestisida_digunakan}
        onChange={e => {
          const value = e.target.value.replace(',', '.'); // Ganti koma dengan titik
          setEcoInput(prev => ({ ...prev, pestisida_digunakan: parseFloat(value) || 0 }));
        }}
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
    <div>
      <label className="block text-sm text-gray-600">Energi (kWh/hari)</label>
      <input
        type="number"
        step="any"
        value={ecoInput.energi_kWh}
        onChange={e => {
          const value = e.target.value.replace(',', '.'); // Ganti koma dengan titik
          setEcoInput(prev => ({ ...prev, energi_kWh: parseFloat(value) || 0 }));
        }}
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
    <div>
      <label className="block text-sm text-gray-600">Limbah (kg/hari)</label>
      <input
        type="number"
        step="any"
        value={ecoInput.limbah_kg}
        onChange={e => {
          const value = e.target.value.replace(',', '.'); // Ganti koma dengan titik
          setEcoInput(prev => ({ ...prev, limbah_kg: parseFloat(value) || 0 }));
        }}
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
  </div>
  <Button onClick={computeEcoScore} className="mt-4">Hitung Eco-Score</Button>
</div>
</Card>

      {/* Forecast AI */}
      <Card className="lg:col-span-3">
        <h3 className="font-bold text-lg mb-4">Prediksi Hasil Panen (AI)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Komoditas</label>
            <input value={forecastForm.commodity} onChange={e => setForecastForm(f => ({ ...f, commodity: e.target.value }))} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="Mis: Padi" />
            <div className="mt-3 space-y-2">
              {forecastForm.months.map((m, idx) => (
                <div key={idx}>
                  <label className="block text-xs text-gray-600">{m.label}</label>
                  <input value={m.value} onChange={e => setForecastForm(f => {
                    const next = f.months.map((mm, i) => i === idx ? { ...mm, value: e.target.value } : mm);
                    return { ...f, months: next };
                  })} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="angka (ton/ha)" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={runForecast} disabled={!canRunForecast() || forecastLoading}>{forecastLoading ? <Spinner /> : 'Jalankan Prediksi'}</Button>
              <Button onClick={() => { setForecastResult(null); setForecastChartData(null); setForecastForm({ commodity: '', months: [{ label: 'Bulan -2', value: '' }, { label: 'Bulan -1', value: '' }, { label: 'Bulan Saat Ini', value: '' }] }); }} variant="secondary">Reset</Button>
            </div>
          </div>
          <div className="md:col-span-2">
            {forecastLoading ? (
              <div className="flex items-center justify-center h-40"><Spinner /></div>
            ) : (
              <>
                {forecastResult ? <p className="mb-3">{forecastResult}</p> : <p className="text-sm text-gray-500">Isi histori panen di kiri lalu jalankan prediksi.</p>}
                <div className="border rounded-md p-2 bg-white">
                  <canvas ref={forecastCanvasRef} />
                  {!forecastChartData && <p className="text-xs text-gray-400 mt-2">Grafik akan tampil setelah prediksi dijalankan.</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* AI Chatbot */}
      <Card className="lg:col-span-3">
        <h3 className="font-bold text-lg mb-4">Asisten AI Pertanian</h3>
        <div className="h-48 overflow-y-auto p-2 border rounded-md mb-2 bg-gray-50">
          {chatbotHistory.map((chat, index) => (
            <div key={index} className="mb-3">
              <p className="text-sm font-semibold text-right text-gray-700">{chat.user}</p>
              <p className="text-sm bg-green-100 p-2 rounded-lg">{chat.bot}</p>
            </div>
          ))}
          {isChatbotLoading && <Spinner />}
        </div>
        <form onSubmit={handleChatbotSubmit} className="flex space-x-2">
          <Input label="" id="chatbot" value={chatbotInput} onChange={e => setChatbotInput(e.target.value)} placeholder="Tanya tentang pertanian..." className="flex-grow" />
          <Button type="submit">Kirim</Button>
        </form>
      </Card>
    </div>
  );

  const renderFarmerMarketplace = () => (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manajemen Produk Marketplace</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 border p-4 rounded-md">
          <h3 className="font-semibold mb-2">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
          <label className="block text-sm text-gray-600">Nama</label>
          <input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className="mt-1 block w-full px-2 py-1 border rounded" />
          <label className="block text-sm text-gray-600 mt-2">Harga (Rp)</label>
          <input value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} className="mt-1 block w-full px-2 py-1 border rounded" />
          <label className="block text-sm text-gray-600 mt-2">Stok</label>
          <input value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} className="mt-1 block w-full px-2 py-1 border rounded" />
          <label className="block text-sm text-gray-600 mt-2">Image URL (opsional)</label>
          <input value={productForm.imageUrl} onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} className="mt-1 block w-full px-2 py-1 border rounded" />
          <div className="mt-3 flex gap-2">
            {editingProduct ? (
              <>
                <Button onClick={handleSaveEditedProduct}>Simpan Perubahan</Button>
                <Button variant="secondary" onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', stock: '', imageUrl: '' }) }}>Batal</Button>
              </>
            ) : (
              <Button onClick={handleAddProduct}>+ Tambah Produk</Button>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-semibold mb-2">Daftar Produk Anda</h3>
          <div className="space-y-3">
            {myProducts.length > 0 ? myProducts.map(p => (
              <div key={p.id} className="p-3 border rounded-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.name} className="w-16 h-12 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-500">Rp {p.price.toLocaleString('id-ID')} • Stok: {p.stock}</div>
                    <div className="text-xs text-gray-400">ID: {p.id}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditProduct(p)} variant="secondary">Edit</Button>
                  <Button size="sm" onClick={() => handleDeleteProduct(p.id)} variant="danger">Hapus</Button>
                </div>
              </div>
            )) : <p>Belum ada produk. Tambahkan hasil panen Anda untuk mulai berjualan.</p>}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderOrderManagement = () => (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manajemen Pesanan Masuk</h2>
      <div className="space-y-4">
        {orders.length > 0 ? orders.map(order => (
          <div key={order.orderId} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Pesanan dari: {order.buyerName}</p>
                <p className="text-sm text-gray-500">ID Pesanan: {order.orderId}</p>
                <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-4">
              <p className="font-semibold">Aksi:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="sm" onClick={() => handleUpdateOrderStatus(order.orderId, ProduceOrderStatus.PROCESSING)} disabled={order.status !== ProduceOrderStatus.PENDING_PAYMENT}>Proses Pesanan</Button>
                <Button size="sm" onClick={() => handleUpdateOrderStatus(order.orderId, ProduceOrderStatus.SHIPPING)} disabled={order.status !== ProduceOrderStatus.PROCESSING}>Kirim Pesanan</Button>
                <Button size="sm" onClick={() => handleUpdateOrderStatus(order.orderId, ProduceOrderStatus.COMPLETED)} disabled={order.status !== ProduceOrderStatus.SHIPPING}>Selesaikan Pesanan</Button>
              </div>
            </div>
          </div>
        )) : <p>Belum ada pesanan masuk.</p>}
      </div>
    </Card>
  );

  const [activeChats, setActiveChats] = useState<{id: string, name: string}[]>([]);
  const [selectedChat, setSelectedChat] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
  if (!user) return;
 
  // Ambil semua chat yang melibatkan petani ini
  mockApiService.getChats(user.id).then(chats => {
    // Ambil semua pembeli unik yang pernah chat dengan petani ini
    const buyers = chats
      .filter(c => c.receiverId === user.id) // pesan yang dikirim ke petani
      .map(c => ({ id: c.senderId, name: c.senderName }));
    // Unik berdasarkan id
    const uniqueBuyers = Array.from(new Map(buyers.map(b => [b.id, b])).values());
    setActiveChats(uniqueBuyers);
  });
}, [user]);

  const renderChats = () => (
      <Card>
          <h2 className="text-xl font-bold mb-4">Chat dengan Pembeli</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChats.map(chat => (
                  <div key={chat.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedChat(chat)}
                  >
                      <p className="font-semibold">{chat.name}</p>
                      <p className="text-sm text-gray-500">Klik untuk chat</p>
                  </div>
              ))}
              {activeChats.length === 0 && (
                  <p>Belum ada chat dari pembeli.</p>
              )}
          </div>
          
          {selectedChat && user && (
              <ChatBox
                  userId={user.id}
                  userName={user.name}
                  partnerId={selectedChat.id}
                  partnerName={selectedChat.name}
                  onClose={() => setSelectedChat(null)}
              />
          )}
      </Card>
  );

  return (
    <div>
  <div className="flex border-b mb-6">
    <button
      onClick={() => setActiveTab('dashboard')}
      className={`py-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
    >
      Dashboard
    </button>
    <button
      onClick={() => setActiveTab('marketplace')}
      className={`py-2 px-4 ${activeTab === 'marketplace' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
    >
      Marketplace
    </button>
    <button
      onClick={() => setActiveTab('orders')}
      className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
    >
      Manajemen Pesanan
    </button>
    <button
      onClick={() => setActiveTab('chats')}
      className={`py-2 px-4 ${activeTab === 'chats' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
    >
      Chat Pembeli
    </button>
    <button
      onClick={() => setActiveTab('financial')}
      className={`py-2 px-4 ${activeTab === 'financial' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
    >
      Keuangan
    </button>
  </div>
  {activeTab === 'dashboard' && renderDashboardOverview()}
  {activeTab === 'marketplace' && renderFarmerMarketplace()}
  {activeTab === 'orders' && renderOrderManagement()}
  {activeTab === 'chats' && renderChats()}
  {activeTab === 'financial' && <FinancialDashboard />}
</div>
  );
};


const BuyerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<ProduceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('marketplace');
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeChatPartner, setActiveChatPartner] = useState<{id: string, name: string} | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [productsData, ordersData] = await Promise.all([
            mockApiService.getProducts(),
            user ? mockApiService.getOrdersForBuyer(user.id) : Promise.resolve([])
        ]);
        setProducts(productsData);
        setOrders(ordersData);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBuyClick = (product: Product) => {
        setSelectedProduct(product);
        setPaymentModalOpen(true);
    };

    const onPaymentSuccess = async () => {
        if (!user || !selectedProduct) return;
        await mockApiService.createProduceOrder(user, selectedProduct);
        fetchData();
        setSelectedProduct(null);
    };

    if (loading) return <Spinner />;

    const renderMarketplace = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <Card key={product.id} className="flex flex-col">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4" />
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500">oleh {product.farmerName}</p>
                    <p className="text-green-600 font-semibold mt-2">Rp {product.price.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-500 mt-1">Stok: {product.stock}</p>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleBuyClick(product)} className="flex-1">Beli</Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => setActiveChatPartner({ id: product.farmerId, name: product.farmerName })}
                            className="flex-1"
                        >
                            Chat Petani
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
    
    const renderOrderHistory = () => (
        <Card>
            <h2 className="text-xl font-bold mb-4">Riwayat Pembelian Anda</h2>
            <div className="space-y-4">
                {orders.length > 0 ? orders.map(order => (
                    <div key={order.orderId} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">Pesanan: {order.items[0].productName}</p>
                                <p className="text-sm text-gray-500">ID Pesanan: {order.orderId}</p>
                                <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</p>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>
                    </div>
                )) : <p>Anda belum melakukan pembelian.</p>}
            </div>
        </Card>
    );

    return (
        <div>
            <div className="flex border-b mb-6">
                <button 
                    onClick={() => setActiveTab('marketplace')} 
                    className={`py-2 px-4 ${activeTab === 'marketplace' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                >
                    Marketplace
                </button>
                <button 
                    onClick={() => setActiveTab('history')} 
                    className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                >
                    Riwayat Pembelian
                </button>
            </div>

            {activeTab === 'marketplace' && renderMarketplace()}
            {activeTab === 'history' && renderOrderHistory()}

            {selectedProduct && (
                <PaymentModal 
                    isOpen={isPaymentModalOpen} 
                    onClose={() => setPaymentModalOpen(false)} 
                    onPaymentSuccess={onPaymentSuccess} 
                    amount={selectedProduct.price}
                />
            )}

            {activeChatPartner && user && (
                <ChatBox
                    userId={user.id}
                    userName={user.name}
                    partnerId={activeChatPartner.id}
                    partnerName={activeChatPartner.name}
                    onClose={() => setActiveChatPartner(null)}
                />
            )}
        </div>
    );
};


// --- APP ROUTER ---
const AppRouter = () => {
    const path = useHashRouter();
    const { user } = useAuth();
    
    if (user) {
        let DashboardComponent: React.FC;
        switch (user.role) {
            case Role.ADMIN: 
                DashboardComponent = AdminDashboard; 
                break;
            case Role.FARMER: 
                DashboardComponent = FarmerDashboard; 
                break;
            case Role.BUYER: 
                DashboardComponent = BuyerDashboard; 
                break;
            default: 
                return <p>Role tidak dikenal</p>;
        }
        return (
            <AppLayout>
                <DashboardComponent />
            </AppLayout>
        );
    }

    // Public routes
    switch (path) {
        case '/login':
            return <LoginPage />;
        case '/register':
            return <RegisterPage />;
        case '/':
        default:
            return (
                <>
                    <Navbar />
                    <HomePage />
                    <Footer />
                </>
            );
    }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;