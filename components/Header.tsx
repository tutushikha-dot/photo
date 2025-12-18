
import React from 'react';

interface HeaderProps {
  onGoToLanding: () => void;
  onGoToDashboard: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ onGoToLanding, onGoToDashboard, onOpenAuth, isLoggedIn }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={onGoToLanding}
      >
        <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
          <i className="fas fa-camera-retro text-white"></i>
        </div>
        <span className="text-xl font-bold tracking-tight text-white uppercase">Memora</span>
      </div>

      <nav className="flex items-center gap-6">
        <button onClick={onGoToLanding} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</button>
        <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Help</button>
        {isLoggedIn ? (
          <button 
            onClick={onGoToDashboard}
            className="px-4 py-2 text-sm font-semibold bg-white text-black rounded-full hover:bg-zinc-200 transition-colors"
          >
            My Account
          </button>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="px-4 py-2 text-sm font-semibold bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all hover:scale-105"
          >
            Subscribe
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
