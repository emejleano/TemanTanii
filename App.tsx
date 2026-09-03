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
};

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
            <img src="./logo.png" alt="Logo SIMANTAP" className="h-12 w-12 object-contain" />
            <span className="ml-2 text-xl font-bold text-green-700">SIMANTAP</span>
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
  <footer className="bg-green-800 text-gray-100" id="contact">
    <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Logo & Deskripsi */}
        <div className="space-y-4">
          <div className="flex items-center">
            <img
              src="./logo.png"
              alt="Logo SIMANTAP"
              className="h-12 w-12 object-contain"
            />
            <span className="ml-2 text-2xl font-bold text-white">SIMANTAP</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Memodernisasi pertanian Indonesia dengan teknologi cerdas — membantu petani
            mengelola lahan, prediksi panen, dan pemasaran hasil dengan efisien.
          </p>
        </div>

        {/* Navigasi */}
        <div className="grid grid-cols-2 gap-8 md:col-span-1">
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Solusi
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition">
                  IoT Monitoring
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition">
                  Marketplace
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition">
                  Analitik AI
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Kontak */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
            Kontak Kami
          </h3>
          <p className="text-gray-300 text-sm">Cilegon, Banten, Indonesia</p>
          <p className="text-gray-300 text-sm">📞 +62 981 234 567</p>
          <p className="text-gray-300 text-sm">✉️ temantani@gmail.com</p>
        </div>
      </div>

      {/* Garis bawah */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center">
        <p className="text-sm text-gray-300">
          &copy; 2025 SIMANTAP. All rights reserved.
        </p>
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

const HomePage = () => (
  <main className="bg-white text-gray-800 font-sans scroll-smooth">
    {/* Hero Section */}
    <section
      className="relative h-[90vh] flex flex-col justify-center bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/1200x/62/d8/1d/62d81d5394fdff21d07134d422fdb0d8.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />


{/* Hero Content */}
<div className="relative z-10 max-w-2xl px-8 md:px-20 mt-12 md:mt-16">
  <h1 className="text-6xl font-extrabold leading-tight">
     
  </h1>
  <h2 className="text-6xl font-extrabold text-green-400">
    Smart Farmer
  </h2>
  <p className="mt-6 text-lg text-gray-100 max-w-lg leading-relaxed">
    Pantau lahan, kelola penyiraman, dan prediksi hasil panen dengan mudah,
    kapan saja dan di mana saja.
  </p>
  <div className="mt-8">
    <Button
      variant="primary"
      onClick={() =>
        document.getElementById('tentang-kami')?.scrollIntoView({ behavior: 'smooth' })
      }
      className="px-8 py-3 text-lg rounded-lg shadow-lg"
    >
      Discover More
    </Button>
  </div>
</div>
    </section>

    {/* Mission Section (Tentang Kami) */}
    <section id="about" className="bg-white py-24 px-8 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-green-700 uppercase tracking-wide">
          Our Mission
        </h2>
        <p className="mt-8 text-gray-700 text-lg leading-relaxed">
          Di SIMANTAP, kami meyakini bahwa solusi bagi tantangan pangan global
          berawal dari pemberdayaan petani lokal. Misi kami adalah menjembatani
          kesenjangan antara pertanian tradisional dan era digital, sehingga petani
          dapat mengakses inovasi tanpa meninggalkan kearifan lokal mereka.
        </p>
      </div>
    </section>

    {/* Solution Section */}
<section className="bg-gray-50 py-24 px-8" id="features">
  <div className="max-w-7xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-green-700 uppercase tracking-wide">
      Our Solution
    </h2>

    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {[
        [
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c4.28 0 7.75 3.47 7.75 7.75 0 3.347-2.066 6.16-5.25 7.292V21a.75.75 0 01-1.5 0v-3.708A7.756 7.756 0 014.25 10c0-4.28 3.47-7.75 7.75-7.75z" />
          </svg>,
          'Smart Irrigation',
          'Penyiraman otomatis & hemat air sesuai kebutuhan.',
        ],
        [
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-green-600">
            <path fillRule="evenodd" d="M10.5 3a.75.75 0 00-.75.75V6h-1a1.5 1.5 0 000 3h1v1.5H8.25a.75.75 0 000 1.5H10.5v1.5h-1a1.5 1.5 0 000 3h1v2.25a.75.75 0 001.5 0V18h1a1.5 1.5 0 000-3h-1v-1.5h2.25a.75.75 0 000-1.5H12v-1.5h1a1.5 1.5 0 000-3h-1V3.75A.75.75 0 0010.5 3z" clipRule="evenodd" />
          </svg>,
          'Agri-Chatbot',
          'Asisten pintar untuk tanya jawab seputar pertanian.',
        ],
        [
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v18h16.5V3H3.75zm3.75 8.25h9v1.5h-9v-1.5zm0 3h9v1.5h-9v-1.5zm0-6h9v1.5h-9v-1.5z" />
          </svg>,
          'Prediction AI',
          'Estimasi hasil panen akurat berbasis data.',
        ],
        [
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-green-600">
            <path d="M3 5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25V18.75A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25zM4.5 6v12h15V6h-15z" />
          </svg>,
          'News & Article',
          'Artikel, panduan, dan berita pertanian terbaru.',
        ],
        [
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
          </svg>,
          'Marketplace',
          'Jual beli benih, pupuk, dan hasil panen secara langsung.',
        ],
        [
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25C8.444 2.25 6.75 5.5 6.75 8.25c0 1.91 1.041 4.226 3.097 7.084a40.78 40.78 0 002.153 2.478.75.75 0 001.1 0 40.78 40.78 0 002.153-2.478C16.209 12.476 17.25 10.16 17.25 8.25c0-2.75-1.694-6-5.25-6z" />
          </svg>,
          'Eco-Score',
          'Nilai ramah lingkungan + tips optimasi.',
        ],
        [
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
          </svg>,
          'Real-time Monitoring Sensor',
          'Pantau tanah & cuaca dengan grafik dan notifikasi.',
        ],
      ].map(([icon, title, desc], i) => (
        <div
          key={i}
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition text-left flex flex-col justify-between"
        >
          <div className="mb-3">{icon}</div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>


    {/* Testimonial Section */}
<section className="bg-white py-24 px-8">
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-green-700 uppercase tracking-wide mb-12">
      What They’re Talking About
    </h2>

    {(() => {
      const testimonials = [
        {
          quote:
            "Dengan SIMANTAP, saya lebih mudah memantau tanah dan cuaca lewat dashboard. Fitur Smart Irrigation sangat membantu menghemat air, sedangkan Prediksi Panen memberi gambaran hasil yang lebih akurat sehingga saya bisa atur strategi jual.",
          name: "Mahfudin",
          role: "Petani Padi, Jawa Barat",
        },
        {
          quote:
            "Prediksi AI di SIMANTAP membantu saya memperkirakan hasil panen dengan lebih tepat. Sekarang saya bisa mengatur jadwal tanam dan distribusi lebih efisien.",
          name: "Sulastri",
          role: "Petani Sayur, Bandung",
        },
        {
          quote:
            "Marketplace-nya praktis! Saya bisa beli pupuk dan benih tanpa ribet, plus baca artikel terbaru soal pertanian modern. SIMANTAP benar-benar bantu petani kecil seperti saya.",
          name: "Rahmat",
          role: "Petani Cabai, Yogyakarta",
        },
      ];

      const [index, setIndex] = useState(0);
      useEffect(() => {
        const timer = setInterval(() => {
          setIndex((prev) => (prev + 1) % testimonials.length);
        }, 3000);
        return () => clearInterval(timer);
      }, []);

      const { quote, name, role } = testimonials[index];

      return (
        <div className="transition-all duration-700 ease-in-out">
          <blockquote className="text-gray-700 text-lg italic leading-relaxed">
            “{quote}”
          </blockquote>
          <p className="mt-6 font-semibold text-green-700 text-lg">
            {name}
            <br />
            <span className="text-gray-600 text-base">{role}</span>
          </p>
        </div>
      );
    })()}
  </div>
</section>

{/* Gallery Section */}
<section className="bg-gray-50 py-24 px-8" id="gallery">
  <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-green-700 uppercase tracking-wide mb-12">
      Our Gallery
    </h2>

    <p className="text-gray-600 max-w-3xl mx-auto mb-12 text-lg">
      Dokumentasi kegiatan tim SIMANTAP dalam pemasangan perangkat IoT,
      eksplorasi ke petani, dan pengujian sistem di lapangan.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {[
        "https://i.pinimg.com/736x/38/0c/ec/380cecab8503d36c3fc541b09e1a6676.jpg",
        "https://i.pinimg.com/736x/70/55/2f/70552ff9dcaafee76d33820a3a19929a.jpg",
        "https://i.pinimg.com/736x/9a/94/91/9a9491e49541bce0e7a0961f774bda46.jpg",
      ].map((url, i) => (
        <div
          key={i}
          className="relative group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <img
            src={url}
            alt={`Gallery ${i + 1}`}
            className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
            <span className="text-white text-lg font-medium">SIMANTAP Activity</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Meet Our Team Section */}
<section className="bg-white py-12 px-8" id="team">
  <div className="max-w-6xl mx-auto text-center">
    <p className="text-gray-500 font-medium text-lg">Powered by : Emejleano Rusmin Nggepo</p>
  </div>
</section>



    {/* Subscribe Section */}
    <section className="bg-green-700 text-white py-20 px-8 text-center">
      <h3 className="text-2xl font-bold mb-6">
        Subscribe to get information, latest news and interesting offers about SIMANTAP
      </h3>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-lg mx-auto">
        <Input placeholder="Your email" className="flex-1" />
        <Button variant="secondary">Subscribe</Button>
      </div>
    </section>

    {/* FAQ Section */}
    <section className="bg-gray-50 py-24 px-8">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-green-700 uppercase tracking-wide">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-gray-600">How Can We Help You?</p>

        <div className="mt-12 text-left space-y-4">
          {[
            'Apa itu SIMANTAP dan siapa yang bisa menggunakannya?',
            'Apakah web ini gratis atau berbayar?',
            'Jika saya tidak punya sensor IoT, apakah saya tetap bisa menggunakan SIMANTAP?',
            'Bagaimana cara kerja irigasi pintar (smart irrigation)?',
            'Apakah penyiraman otomatis bisa diatur sesuai kebutuhan tanaman tertentu?',
            'Seberapa akurat prediksi hasil panen di SIMANTAP?',
            'Apakah web ini bisa diakses lewat HP atau hanya lewat komputer?',
            'Apa itu Eco-Score Dashboard?',
            'Apa fungsi chatbot di SIMANTAP?',
            'Apakah data saya aman dan hanya bisa dilihat oleh saya?',
          ].map((q, i) => (
            <details
              key={i}
              className="group border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
            >
              <summary className="font-semibold text-green-700 cursor-pointer list-none flex justify-between items-center">
                {q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Jawaban akan menyesuaikan dokumentasi resmi SIMANTAP dan pengalaman pengguna.
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  </main>
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
   <img src="./logo.png" alt="Logo SIMANTAP" className="h-20 w-20" />
</div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login ke Akun Anda</h2>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Akun Demo untuk Testing:</p>
        <div className="space-y-2 text-xs text-blue-800">
            <div className="bg-white p-2 rounded">
                <p className="font-medium">👨‍🌾 Petani / Pembudidaya:</p>
                <p>Email: <code className="bg-blue-100 px-1">tani@temantani.com</code></p>
                <p>Password: <code className="bg-blue-100 px-1">password123</code></p>
            </div>
            <div className="bg-white p-2 rounded">
                <p className="font-medium">🛒 Pembeli:</p>
                <p>Email: <code className="bg-blue-100 px-1">pembeli@temantani.com</code></p>
                <p>Password: <code className="bg-blue-100 px-1">password123</code></p>
            </div>
            <div className="bg-white p-2 rounded">
                <p className="font-medium">👤 Admin:</p>
                <p>Email: <code className="bg-blue-100 px-1">admin@temantani.com</code></p>
                <p>Password: <code className="bg-blue-100 px-1">admin123</code></p>
            </div>
        </div>
    </div>
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
   <img src="./logo.png" alt="logo." className="h-20 w-20" />
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
                            <option value={Role.FARMER}>Petani / Pembudidaya</option>
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
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          <img
                            src="./logo.png"
                            alt="Logo SIMANTAP"
                            className="h-8 w-8 object-contain"
                          />
                          <span>Dashboard</span>
                        </h1>
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
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(() => localStorage.getItem('ttm_plan') || 'standard');
  const [pumpStatus, setPumpStatus] = useState(false);
  const [isAutoPumpMode, setIsAutoPumpMode] = useState<boolean>(false);
const [soilTemp, setSoilTemp] = useState<number>(28.0);
const [pumpLogs, setPumpLogs] = useState<{ time: string; message: string }[]>([]);
const [ecoInput, setEcoInput] = useState({
  pupuk_digunakan: 0,
  pestisida_digunakan: 0,
  energi_kWh: 0,
  limbah_kg: 0,
});
const [pestLogs, setPestLogs] = useState<{ time: string; message: string }[]>([]); // Initialize pestLogs
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
const [pestSensorOn, setPestSensorOn] = useState(false); // ON/OFF status for pest sensor
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
  // Simulasi suhu tanah setiap 7 detik (random walk)
useEffect(() => {
  if (sensorData.length > 0) {
    setSoilTemp(sensorData[sensorData.length - 1].temperature);
  }
}, [sensorData]);

// Auto control dengan hysteresis: ON > 30°C, OFF < 27°C
useEffect(() => {
  if (!isAutoPumpMode) return;

  if (!pumpStatus && soilTemp > 30) {
    setPumpStatus(true);
    setPumpLogs(prev => [
      { time: new Date().toLocaleString(), message: `Pompa menyala karena suhu ${soilTemp.toFixed(1)}°C` },
      ...prev,
    ].slice(0, 50));
  } else if (pumpStatus && soilTemp < 27) {
    setPumpStatus(false);
    setPumpLogs(prev => [
      { time: new Date().toLocaleString(), message: `Pompa mati karena suhu ${soilTemp.toFixed(1)}°C` },
      ...prev,
    ].slice(0, 50));
  }
}, [isAutoPumpMode, soilTemp, pumpStatus, setPumpStatus]);
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
  const [selectedPlan, setSelectedPlan] = useState<any>('pertanian');
const [selectedPlanAmount, setSelectedPlanAmount] = useState<number>(350000);

const handleDevicePurchase = (plan: 'pertanian'|'perikanan'|'agromaritim') => {
  setSelectedPlan(plan);
  const amount = plan === 'agromaritim' ? 550000 : 350000;
  setSelectedPlanAmount(amount);
  setPaymentModalOpen(true);
};

const onPaymentSuccess = async () => {
  if (!user) return;
  await mockApiService.purchaseDevice(user.id, user.name);
  localStorage.setItem('ttm_plan', selectedPlan); // simpan paket
  await refreshUser();
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
      `Laporan Keberlanjutan - SIMANTAP (Agromaritim)`,
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

  // --- Forecasting logic (Time-Series Forecast (ARIMA/LSTM simulated)) ---
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
        category: 'Pertanian',
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
      <h2 className="text-2xl font-bold">Selamat Datang, {user.name}! (Produsen)</h2>
      <p className="mt-4 text-gray-600">Pilih paket berlangganan perangkat IoT SIMANTAP:</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Paket Pertanian */}
        <div className="p-4 border rounded-lg text-left bg-white">
          <h3 className="text-xl font-semibold text-green-700">Paket Khusus Pertanian</h3>
          <p className="text-2xl font-bold mt-1">Rp 350.000<span className="text-sm font-normal text-gray-500">/bulan</span></p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Sensor Tanah (Kelembapan, Suhu)</li>
            <li>Pompa Irigasi Otomatis</li>
            <li>Smart Mist Sprayer</li>
            <li>AI Forecasting Cuaca & Lahan</li>
          </ul>
          <Button className="mt-4 w-full" onClick={() => handleDevicePurchase('pertanian')}>Pilih Paket Pertanian</Button>
        </div>

        {/* Paket Perikanan */}
        <div className="p-4 border rounded-lg text-left bg-white">
          <h3 className="text-xl font-semibold text-blue-700">Paket Khusus Perikanan</h3>
          <p className="text-2xl font-bold mt-1">Rp 350.000<span className="text-sm font-normal text-gray-500">/bulan</span></p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Sensor Air (pH, DO, Salinitas)</li>
            <li>Aerator Cerdas Otomatis</li>
            <li>Auto-Feeder (Pemberi Pakan)</li>
            <li>AI Pemantau Kualitas Tambak</li>
          </ul>
          <Button className="mt-4 w-full" onClick={() => handleDevicePurchase('perikanan')}>Pilih Paket Perikanan</Button>
        </div>

        {/* Paket Agromaritim */}
        <div className="p-4 border-2 border-green-500 rounded-lg text-left bg-green-50 shadow-lg relative">
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">TERPOPULER</div>
          <h3 className="text-xl font-semibold text-green-800">Paket Integrasi Agromaritim</h3>
          <p className="text-2xl font-bold mt-1">Rp 550.000<span className="text-sm font-normal text-gray-500">/bulan</span></p>
          <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li className="font-medium">Semua Fitur Pertanian + Perikanan</li>
            <li>Rekomendasi Mina-Padi (Cross-System)</li>
            <li>Deteksi & Usir Hama Otomatis</li>
            <li>Integrasi Manajemen AI Terpusat</li>
          </ul>
          <Button className="mt-4 w-full" onClick={() => handleDevicePurchase('agromaritim')}>Pilih Paket Agromaritim</Button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={onPaymentSuccess}
        amount={selectedPlanAmount}
      />
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
              <p className="text-sm text-gray-500 mt-1">Menunggu konfirmasi dari tim kami.</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-gray-600">Kami akan segera menghubungi Anda. Terima kasih telah bersabar.</p>
      </Card>
    );
  }

  // Active farmer dashboard
  const renderDashboardOverview = () => {
    const activePlan = localStorage.getItem('ttm_plan') || 'agromaritim';
    const showPertanian = activePlan === 'pertanian' || activePlan === 'agromaritim';
    const showPerikanan = activePlan === 'perikanan' || activePlan === 'agromaritim';
    const showAgroMaritim = activePlan === 'agromaritim';
    const currentSensor = sensorData.length > 0 ? sensorData[sensorData.length - 1] : undefined;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hubungkan Perangkat (Jika Offline) */}
        {user.farmerStatus !== FarmerStatus.DEVICE_ONLINE && (
          <Card className="lg:col-span-3 text-center py-8 bg-yellow-50 border-yellow-200">
            {isConnecting ? (
              <div className="flex flex-col items-center">
                <Spinner />
                <p className="text-yellow-800 mt-2">Menghubungkan perangkat ke sistem IoT...</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-yellow-800 mb-2">Perangkat Belum Terhubung</h3>
                <p className="text-yellow-700 mb-4">Sistem belum menerima data dari sensor Anda. Silakan hubungkan perangkat untuk memulai pemantauan real-time.</p>
                <Button onClick={handleConnectDevice}>Hubungkan Perangkat Sekarang</Button>
              </>
            )}
          </Card>
        )}

        {/* Sensor Data Pertanian */}
        {showPertanian && (
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
            <p className="text-gray-400">Menunggu koneksi perangkat...</p>
          </div>
        )}
      </Card>
      )}

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
      {showPertanian && (
      <>
      <Card>
        <h3 className="font-bold text-lg mb-4">Kontrol Pompa Irigasi</h3>

  {/* Row status suhu + status pompa */}
  <div className="grid grid-cols-2 gap-4">
    <div className="p-3 rounded-md border">
      <p className="text-sm text-gray-500">Suhu Tanah (real-time)</p>
<p className="text-3xl font-bold">
  {sensorData.length > 0 ? sensorData[sensorData.length - 1].temperature.toFixed(1) : soilTemp.toFixed(1)}°C
</p>
    </div>
    <div className="p-3 rounded-md border">
      <p className="text-sm text-gray-500">Status Pompa</p>
      <div className="mt-1 inline-flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${pumpStatus ? 'bg-green-500' : 'bg-red-400'}`} />
        <span className={`text-lg font-semibold ${pumpStatus ? 'text-green-700' : 'text-gray-600'}`}>
          {pumpStatus ? 'Aktif (ON)' : 'Nonaktif (OFF)'}
        </span>
      </div>
    </div>
  </div>

  {/* Mode switch */}
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Mode Pompa</label>
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">{isAutoPumpMode ? 'Otomatis' : 'Manual'}</span>
      <button
        type="button"
        onClick={() => setIsAutoPumpMode(v => !v)}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${isAutoPumpMode ? 'bg-green-600' : 'bg-gray-300'}`}
        title="Toggle Manual/Otomatis"
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isAutoPumpMode ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      <span className="text-xs text-gray-500">Otomatis: ON {'>'} 30°C, OFF {'<'} 27°C</span>
    </div>
  </div>

  {/* Kontrol manual */}
  <div className="mt-4">
    <p className="text-sm text-gray-600 mb-2">Kontrol Manual</p>
    <div className="flex items-center gap-3">
      <Button
        onClick={() => setPumpStatus(s => !s)}
        disabled={isAutoPumpMode}
        variant={pumpStatus ? 'secondary' : 'primary'}
        className={`${isAutoPumpMode ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isAutoPumpMode ? 'Nonaktifkan mode otomatis untuk mengontrol manual' : 'Toggle pompa'}
      >
        {pumpStatus ? 'Matikan Pompa' : 'Nyalakan Pompa'}
      </Button>
      {isAutoPumpMode && <span className="text-xs text-gray-500">Matikan mode otomatis untuk kontrol manual.</span>}
    </div>
  </div>

  {/* Riwayat otomatis */}
  <div className="mt-6">
    <h4 className="font-semibold">Riwayat Otomatis</h4>
    <ul className="mt-2 max-h-40 overflow-auto space-y-2 text-sm text-gray-700">
      {pumpLogs.length === 0 ? (
        <li className="text-gray-400">Belum ada aktivitas otomatis.</li>
      ) : (
        pumpLogs.map((l, i) => (
          <li key={i} className="flex justify-between gap-4">
            <span>{l.message}</span>
            <span className="whitespace-nowrap text-gray-500">{l.time}</span>
          </li>
        ))
      )
      }
    </ul>
  </div>
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
      </>
      )}

{/* Deteksi & Usir Hama Otomatis (Premium) */}
{showAgroMaritim && (
<Card>
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-lg">Deteksi & Usir Hama</h3>
    <span className="text-xs px-2 py-0.5 rounded-full border">Paket: {localStorage.getItem('ttm_plan') === 'premium' ? 'Premium' : 'Standard'}</span>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div className="p-3 rounded-md border">
      <p className="text-sm text-gray-500">Status Sensor</p>
      <div className="mt-1 inline-flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${subscriptionPlan==='premium' && pestSensorOn ? 'bg-green-500' : 'bg-red-400'}`} />
        <span className={`text-lg font-semibold ${subscriptionPlan==='premium' && pestSensorOn ? 'text-green-700' : 'text-gray-600'}`}>
          {subscriptionPlan==='premium' && pestSensorOn ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
    </div>
    <div className="p-3 rounded-md border">
      <p className="text-sm text-gray-500">Kontrol Sensor</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPestSensorOn(v => !v)}
          disabled={subscriptionPlan !== 'premium'}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${subscriptionPlan==='premium' && pestSensorOn ? 'bg-green-600' : 'bg-gray-300'} ${subscriptionPlan!=='premium' ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={subscriptionPlan==='premium' ? 'Toggle sensor' : 'Upgrade ke Premium untuk mengaktifkan'}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${subscriptionPlan==='premium' && pestSensorOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>

        {subscriptionPlan !== 'premium' && (
          <Button variant="secondary" onClick={() => { setSubscriptionPlan('premium'); localStorage.setItem('ttm_plan', 'premium'); }}>
            Upgrade ke Premium
          </Button>
        )}
      </div>
    </div>
  </div>

  <div className="mt-6">
    <h4 className="font-semibold">Riwayat Deteksi</h4>
<ul className="mt-2 max-h-40 overflow-auto space-y-2 text-sm text-gray-700">
  {pestLogs.length === 0 ? (
    <li className="text-gray-400">Belum ada deteksi.</li>
  ) : (
    pestLogs.map((l, i) => (
      <li key={i} className="flex justify-between gap-4">
        <span>{l.message}</span>
        <span className="whitespace-nowrap text-gray-500">{l.time}</span>
      </li>
    ))
  )}
</ul>
  </div>

  <div className="mt-4 text-sm">
    {subscriptionPlan !== 'premium' ? (
      <p className="text-gray-600">🔒 Fitur ini hanya tersedia di Paket Premium (Rp 450.000/bulan)</p>
    ) : (
      <p className="text-gray-600">Deteksi terakhir: {'-'}</p>
    )}
  </div>
</Card>
)}

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

      {/* Tambak Monitoring (SIMANTAP) */}
      {showPerikanan && (
      <Card className="lg:col-span-3">
        <h3 className="font-bold text-lg mb-4 mt-2">Monitoring Tambak / Budidaya Ikan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-full"><IconDrop className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Tingkat pH Air</p>
              <p className="text-2xl font-bold">{(currentSensor as any)?.ph || '--'}</p>
              <p className="text-xs text-green-600">Normal (6.5 - 8.5)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-full"><IconDrop className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Oksigen Terlarut (DO)</p>
              <p className="text-2xl font-bold">{(currentSensor as any)?.dissolvedOxygen || '--'} mg/L</p>
              <p className="text-xs text-green-600">Optimal</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-full"><IconDrop className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Salinitas</p>
              <p className="text-2xl font-bold">{(currentSensor as any)?.salinity || '--'} ppt</p>
              <p className="text-xs text-gray-600">Kondisi Stabil</p>
            </div>
          </div>
        </div>
      </Card>
      )}

      {/* Cross Recommendation */}
      {showAgroMaritim && (
      <Card className="lg:col-span-3 bg-emerald-50 border-emerald-200">
        <h4 className="font-bold text-emerald-800 mb-2">🌱 Rekomendasi Cross-Agromaritim SIMANTAP</h4>
        <p className="text-sm text-gray-700">Sistem mendeteksi Anda memiliki lahan pertanian yang dekat dengan perairan. Pertimbangkan skema <strong>Mina-Padi</strong> untuk meningkatkan pendapatan hingga 30% dan menciptakan ekosistem closed-loop ramah lingkungan. Atau gunakan limbah pertanian organik Anda sebagai pakan ikan alternatif.</p>
      </Card>
      )}
      {/* Forecast AI */}
      <Card className="lg:col-span-3">
        <h3 className="font-bold text-lg mb-4">
          Prediksi Cerdas Agromaritim (Model Time-Series ARIMA/LSTM)
          <p className="text-sm text-green-700 font-normal mt-1">* Mendukung prediksi panen lahan (Padi/Sayur) dan hasil budidaya tambak (Ikan/Udang)</p>
        </h3>
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
  };

  const renderFarmerMarketplace = () => (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manajemen Produk Marketplace</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="mt-2">
                        {product.category === 'Perikanan' && <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">Hasil Laut</span>}
                        {product.category === 'Pertanian' && <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Hasil Tani</span>}
                        {product.nutriScore && <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mr-2">Nutri-Score: {product.nutriScore}</span>}
                    </div>
                    {product.traceability && <p className="text-xs text-gray-500 mt-2 truncate">📍 {product.traceability}</p>}
                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleBuyClick(product)} className="flex-1">Beli</Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => setActiveChatPartner({ id: product.farmerId, name: product.farmerName })}
                            className="flex-1"
                        >
                            Chat Produsen
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

