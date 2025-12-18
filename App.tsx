
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageSlider from './components/ImageSlider';
import MagicLoading from './components/MagicLoading';
import AuthModal from './components/AuthModal';
import { AppState, RestorationItem, User } from './types';
import { restorePhoto } from './geminiService';
import { fileToBase64, applyWatermark, downloadImage } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<RestorationItem[]>([]);
  const [currentRestoration, setCurrentRestoration] = useState<RestorationItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Example placeholder for the slider on landing page
  const exampleBefore = "https://picsum.photos/id/225/800/600";
  const exampleAfter = "https://picsum.photos/id/225/800/600?grayscale"; // Just a mock for landing visual

  useEffect(() => {
    const savedUser = localStorage.getItem('memora_user');
    const savedHistory = localStorage.getItem('memora_history');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAppState(AppState.RESTORING);
      const base64 = await fileToBase64(file);
      const restored = await restorePhoto(base64);

      if (restored) {
        const newItem: RestorationItem = {
          id: Date.now().toString(),
          originalUrl: base64,
          restoredUrl: restored,
          timestamp: Date.now(),
        };
        setCurrentRestoration(newItem);
        setHistory(prev => [newItem, ...prev]);
        localStorage.setItem('memora_history', JSON.stringify([newItem, ...history]));
        setAppState(AppState.RESULT);
      } else {
        alert("Restoration failed. Please try again with a clearer image.");
        setAppState(AppState.LANDING);
      }
    } catch (err) {
      console.error(err);
      setAppState(AppState.LANDING);
    }
  };

  const handleAuthSuccess = (email: string) => {
    const newUser = { email, isSubscribed: false };
    setUser(newUser);
    localStorage.setItem('memora_user', JSON.stringify(newUser));
    setIsAuthOpen(false);
    // If we were on result page, maybe they want to buy now
  };

  const handleFreeDownload = async () => {
    if (!currentRestoration) return;
    const watermarked = await applyWatermark(currentRestoration.restoredUrl);
    downloadImage(watermarked, `memora-restoration-free-${currentRestoration.id}.png`);
  };

  const handlePaidDownload = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!user.isSubscribed) {
      alert("Please subscribe to unlock watermark-free downloads.");
      return;
    }
    if (currentRestoration) {
      downloadImage(currentRestoration.restoredUrl, `memora-restoration-pro-${currentRestoration.id}.png`);
    }
  };

  const handleUpgrade = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const updatedUser = { ...user, isSubscribed: true };
    setUser(updatedUser);
    localStorage.setItem('memora_user', JSON.stringify(updatedUser));
    alert("Subscription activated! Enjoy unlimited restorations.");
  };

  return (
    <div className="min-h-screen pt-20 pb-12 overflow-x-hidden">
      <Header 
        onGoToLanding={() => setAppState(AppState.LANDING)} 
        onGoToDashboard={() => setAppState(AppState.DASHBOARD)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={!!user}
      />

      <main className="max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {appState === AppState.LANDING && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-16 items-center py-12"
            >
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Advanced AI Restoration</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-serif leading-[1.1] text-white">
                  For the moments <br />
                  <span className="text-rose-500 italic">time forgot.</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-lg">
                  Memories are sacred. Our AI gently heals broken pixels, restores lost colors, and breathes life back into your family heritage.
                </p>

                <div className="relative group w-full max-w-md">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-3xl cursor-pointer bg-zinc-900/40 backdrop-blur-md hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group overflow-hidden">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <i className="fas fa-cloud-upload-alt text-white text-2xl"></i>
                      </div>
                      <p className="mb-2 text-lg font-semibold text-white">Choose photos</p>
                      <p className="text-sm text-zinc-500">or drop them here</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                  </label>
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-6 opacity-40">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">JPG</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">PNG</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">WEBP</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block relative">
                <div className="absolute -inset-10 bg-rose-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                <ImageSlider 
                  before="https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800"
                  after="https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800" 
                />
              </div>
            </motion.div>
          )}

          {appState === AppState.RESTORING && (
             <motion.div 
               key="restoring"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
               <MagicLoading />
             </motion.div>
          )}

          {appState === AppState.RESULT && currentRestoration && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12"
            >
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="w-full lg:w-2/3">
                  <ImageSlider 
                    before={currentRestoration.originalUrl}
                    after={currentRestoration.restoredUrl}
                  />
                </div>
                
                <div className="w-full lg:w-1/3 space-y-8">
                  <div>
                    <h2 className="text-3xl font-serif text-white mb-2">Restoration Complete</h2>
                    <p className="text-zinc-400">Review your enhanced photo. Drag the slider to compare details.</p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleFreeDownload}
                      className="w-full py-4 px-6 bg-zinc-800 text-white rounded-2xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-download text-zinc-400"></i>
                        <span className="font-semibold">Free Download</span>
                      </div>
                      <span className="text-[10px] bg-zinc-900 px-2 py-1 rounded text-zinc-500">Watermarked</span>
                    </button>

                    <button 
                      onClick={user?.isSubscribed ? handlePaidDownload : handleUpgrade}
                      className="w-full py-4 px-6 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-crown text-white group-hover:rotate-12 transition-transform"></i>
                        <span className="font-bold">Pro Quality Download</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-white font-bold">4K No Watermark</span>
                    </button>
                  </div>

                  {!user?.isSubscribed && (
                    <div className="p-6 bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-3xl space-y-4">
                      <p className="text-sm font-semibold text-rose-500">Unlimited restorations for just $4.99/mo</p>
                      <ul className="space-y-2">
                        {['Batch upload up to 50 photos', '4K High-Res output', 'Priority AI processing', 'Dedicated cloud history'].map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                            <i className="fas fa-check text-rose-500 text-[8px]"></i> {f}
                          </li>
                        ))}
                      </ul>
                      <button 
                        onClick={handleUpgrade}
                        className="w-full py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                      >
                        Subscribe Now
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => setAppState(AppState.LANDING)}
                    className="text-sm text-zinc-500 hover:text-white underline underline-offset-4"
                  >
                    Upload another photo
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {appState === AppState.DASHBOARD && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12"
            >
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl font-serif text-white mb-2">My History</h2>
                  <p className="text-zinc-500">You've restored {history.length} memories so far.</p>
                </div>
                {!user?.isSubscribed && (
                  <button onClick={handleUpgrade} className="px-6 py-3 bg-rose-500 rounded-full text-white font-bold text-sm">
                    Upgrade to Pro
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {history.map(item => (
                    <div key={item.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-rose-500/30 transition-all">
                      <img src={item.restoredUrl} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 gap-4">
                        <button 
                          onClick={() => {
                            setCurrentRestoration(item);
                            setAppState(AppState.RESULT);
                          }}
                          className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm"
                        >
                          View Comparison
                        </button>
                        <button 
                          onClick={() => downloadImage(item.restoredUrl, `restoration-${item.id}.png`)}
                          className="w-full py-3 bg-zinc-800 text-white font-bold rounded-xl text-sm border border-zinc-700"
                        >
                          Download Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-500">
                    <i className="fas fa-history text-2xl"></i>
                  </div>
                  <h3 className="text-xl text-white font-semibold">No restorations yet</h3>
                  <button 
                    onClick={() => setAppState(AppState.LANDING)}
                    className="mt-4 text-rose-500 font-bold hover:underline"
                  >
                    Start your first restoration
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
