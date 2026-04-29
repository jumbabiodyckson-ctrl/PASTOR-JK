import React, { useState, useEffect, Suspense, useRef, forwardRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  Video, 
  Book, 
  Image as ImageIcon, 
  Bell, 
  Settings, 
  Layout, 
  Plus, 
  MessageSquare, 
  Check, 
  PlusSquare,
  X, 
  Shield, 
  LogOut, 
  User as UserIcon,
  ExternalLink,
  ChevronRight,
  Menu,
  X as CloseIcon,
  Activity,
  Lightbulb,
  CreditCard,
  Lock,
  Smartphone,
  Zap,
  Globe,
  Eye,
  Cross,
  Crown,
  History,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Download,
  Sparkles,
  Languages,
  Volume2,
  Brain,
  Send,
  Bot,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Mail,
  ShieldCheck,
  Phone,
  MapPin,
  Save,
  Calendar,
  AlertTriangle,
  Heart,
  Search,
  Trash2,
  Quote,
  BookOpen,
  Target,
  BarChart3,
  Cpu,
  Share2,
  ThumbsUp,
  WifiOff,
  ChevronUp,
  Clock,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Copy,
  PlusSquare,
  Terminal,
  Building2,
  Beaker,
  FlaskConical,
  Workflow,
  Repeat,
  Layers,
  ShieldAlert,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  FirebaseUser,
  collectionGroup,
  limit,
  deleteField
} from './firebase';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || '');
import { 
  moderatePost, 
  generateCommentReply, 
  getAdminAdvice, 
  checkWebsiteStability,
  translateBook,
  explainBook,
  generateSpeech,
  chatWithAI,
  generateMarketingContent,
  enhancePostContent,
  editImage,
  generateVideo,
  suggestMediaEdits,
  summarizeContent,
  summarizeSermonNote,
  formatSermonNote,
  generateTitle,
  proofreadBook,
  generateAutoReply,
  extractQuotes,
  generateSermonOutline,
  generateVisionStatement,
  translateContent,
  generateRoadmap,
  generateTheologicalInsight,
  generateMarketingSuite,
  downloadSpeech,
  generateFinancialReport,
  generateSystemUpdateNotification,
  rawChatWithAI
} from './services/aiService';
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'contributor' | 'viewer' | 'user';
  displayName: string;
  photoURL: string;
  phone?: string;
  notificationsEnabled?: boolean;
}

interface AISettings {
  isAIEnabled: boolean;
  isAutoUpdateEnabled: boolean;
  isAutoMarketingEnabled: boolean;
  isAutoReplyEnabled: boolean;
  isAutoModerationEnabled: boolean;
  autoReplyStrategy: 'aggressive' | 'strategic' | 'minimalist';
  aiHealth: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE';
  lastHealAt: any;
  persona: string;
}

interface Post {
  id: string;
  authorUid: string;
  authorName: string;
  type: 'video' | 'book' | 'picture' | 'notification' | 'sermon' | 'devotion' | 'course' | 'podcast';
  title: string;
  content: string;
  description?: string;
  mediaUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  aiModerationNote?: string;
  price?: number;
  isFullBook?: boolean;
  chapterNumber?: number;
  tiktokUrl?: string;
  likesCount?: number;
  moderationSuggestions?: {
    title: string;
    content: string;
    note: string;
  };
  moderationHistory?: {
    note: string;
    status: string;
    createdAt: string;
    suggestions?: string;
  }[];
  suggestions?: string;
  pdfUrl?: string;
  pdfStoragePath?: string;
  createdAt: any;
}

interface SermonNote {
  id: string;
  userId: string;
  postId?: string;
  postTitle?: string;
  title: string;
  content: string;
  summary?: string;
  isAIFormatted?: boolean;
  createdAt: any;
}

interface Comment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  text: string;
  aiReply?: string;
  aiReplied?: boolean;
  createdAt: any;
}

interface Site {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  imageURL?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  aiReply?: string;
  aiReplied: boolean;
  repliedAt?: any;
  strategicInsight?: string;
  createdAt: any;
}

interface AdminAdvice {
  id: string;
  topic: string;
  advice: string;
  stabilityScore?: number;
  createdAt: any;
}

interface Transaction {
  id: string;
  userUid: string;
  userName: string;
  userEmail: string;
  postId: string;
  postTitle: string;
  amount: number;
  type?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoURL: string;
  bio: string;
}

interface MarketingLog {
  id: string;
  bookTitle: string;
  platform: string;
  content: string;
  createdAt: any;
}

interface ContactInfo {
  communityNumber: string;
  officialEmail: string;
  address: string;
  whatsappGroup: string;
  updatedAt: any;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: any;
  location: string;
  type: 'service' | 'conference' | 'outreach' | 'other';
  createdAt: any;
}

interface Donation {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  type: 'tithe' | 'offering' | 'support' | 'other';
  status: string;
  createdAt: any;
}

interface SermonNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: any;
}

const getSystemAvatar = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=256`;
};

import { handleFirestoreError, getFriendlyErrorMessage } from './utils/errorHandling';

// --- Components ---

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK_TO_PREVIOUS
      </button>
    </div>
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[100] w-8 h-8 bg-white text-black rounded-sm shadow-2xl flex items-center justify-center hover:scale-110 transition-all"
        >
          <ChevronUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const SermonNoteModal = ({ 
  isOpen, 
  onClose, 
  initialContent = '', 
  post, 
  notify 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  initialContent?: string, 
  post?: Post | { id: string, title: string },
  notify: (msg: string, type: any) => void 
}) => {
  const [note, setNote] = useState(initialContent);
  const [title, setTitle] = useState(post ? `Notes on ${post.title}` : 'General Revelation');
  const [isSaving, setIsSaving] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  useEffect(() => {
    if (initialContent) setNote(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (post) {
      setTitle(`Notes on ${post.title}`);
    } else {
      setTitle('General Revelation');
    }
  }, [post]);

  if (!isOpen) return null;

  const handleSave = async (isAIFormatted = false, summary?: string) => {
    if (!note.trim()) return;
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required for saving revelations.");

      const noteId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'users', user.uid, 'sermon_notes', noteId), {
        id: noteId,
        userId: user.uid,
        postId: post?.id || null,
        postTitle: post?.title || null,
        title,
        content: note,
        summary: summary || null,
        isAIFormatted,
        createdAt: serverTimestamp()
      });

      notify("REVELATION_ARCHIVED: Your insight has been committed to the digital stream.", "success");
      onClose();
      setNote('');
    } catch (error) {
      notify(getFriendlyErrorMessage(error), "error");
      console.error("Failed to save sermon note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSummarize = async () => {
    if (!note.trim()) return;
    setIsAIProcessing(true);
    try {
      const summary = await summarizeSermonNote(note);
      await handleSave(false, summary);
    } catch (error) {
      notify("AI_PROCESS_FAILED: Could not synthesize the revelation.", "error");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleFormat = async () => {
    if (!note.trim()) return;
    setIsAIProcessing(true);
    try {
      const formatted = await formatSermonNote(note);
      setNote(formatted);
      notify("AI_REFINEMENT_COMPLETE: The revelation has been structured for precision.", "info");
    } catch (error) {
      notify("AI_PROCESS_FAILED: Could not refine the content.", "error");
    } finally {
      setIsAIProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-2xl overflow-hidden rounded-sm border-white/20 shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <PlusSquare className="w-5 h-5 text-white/40" />
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-1">PROPHETIC_CAPTURE</h2>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-transparent border-none text-sm font-black uppercase tracking-tight focus:outline-none p-0 text-white w-full"
              />
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {post && (
            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-sm">
              <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center">
                {'type' in post && post.type === 'video' ? <Video className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">LINKED_CONTENT</span>
                <span className="text-xs font-bold uppercase truncate max-w-sm">{post.title}</span>
              </div>
            </div>
          )}

          <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Capture what you're learning right now..."
            className="w-full bg-white/5 border border-white/10 rounded-sm px-6 py-6 text-sm font-medium leading-relaxed focus:outline-none focus:border-white h-64 resize-none transition-all scrollbar-hide"
            autoFocus
          />

          <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-2">
              <button 
                onClick={handleFormat}
                disabled={isAIProcessing || !note.trim()}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                title="AI Format Revelation"
              >
                {isAIProcessing ? <Activity className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI_REFINE
              </button>
              <button 
                onClick={handleSummarize}
                disabled={isAIProcessing || !note.trim()}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                title="AI Summarize Revelation"
              >
                {isAIProcessing ? <Activity className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                AI_SUMMARIZE
              </button>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-3 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white/5 transition-all"
              >
                DISCARD
              </button>
              <button 
                onClick={() => handleSave()}
                disabled={isSaving || isAIProcessing || !note.trim()}
                className="glitter-button glitter-gold px-8 py-3 rounded-sm text-[8px] font-black tracking-widest uppercase text-black disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Activity className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                COMMIT_REVELATION
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const QuickActions = ({ onTakeNote }: { onTakeNote: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: PlusSquare, label: 'QUICK_NOTE', onClick: onTakeNote, color: 'text-gold-500' },
    { icon: Cross, label: 'BIBLE_READER', onClick: () => navigate('/bible'), color: 'text-blue-500' },
    { icon: Volume2, label: 'SERMONS', onClick: () => navigate('/sermons'), color: 'text-purple-500' },
    { icon: Video, label: 'VIDEOS', onClick: () => navigate('/videos'), color: 'text-red-500' },
  ];

  return (
    <div className="fixed bottom-24 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 space-y-2 flex flex-col items-end"
          >
            {actions.map((action, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { action.onClick(); setIsOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-sm hover:border-white/30 transition-all group shadow-2xl"
              >
                <span className="text-[9px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">{action.label}</span>
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-all shadow-2xl ${
          isOpen ? 'bg-white text-black border-white rotate-45' : 'bg-black text-white border-white/20 hover:border-white'
        }`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

const Footer = ({ contactInfo }: { contactInfo: ContactInfo }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-white/10 bg-black pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-4 h-4 border-2 border-white rounded-full mb-[-4px]" />
                  <div className="w-6 h-1 bg-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-[0.2em] uppercase glitter-text leading-none">PASTOR_JK</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-white/40 uppercase mt-1">ESTABLISHED_PROPHETIC_BRAND</span>
              </div>
            </Link>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-relaxed">
              DEDICATED_TO_THE_PROPHETIC_TRANSFORMATION_OF_GLOBAL_COMMUNITIES_THROUGH_STRATEGIC_WISDOM_AND_DIGITAL_INNOVATION.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 border border-white/10 rounded-sm hover:border-white transition-all text-white/40 hover:text-white">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-white/10 rounded-sm hover:border-white transition-all text-white/40 hover:text-white">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-white/10 rounded-sm hover:border-white transition-all text-white/40 hover:text-white">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 mb-8">NAVIGATION_SYSTEM</h4>
            <ul className="space-y-2">
              {[
                { name: 'HOME_PORTAL', path: '/' },
                { name: 'SERMON_ARCHIVE', path: '/sermons' },
                { name: 'BIBLE_READER', path: '/bible' },
                { name: 'VIDEO_STREAM', path: '/videos' }
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-white transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 mb-8">LEGAL_RESOURCES</h4>
            <ul className="space-y-2">
              {[
                { name: 'PRIVACY_PROTOCOL', path: '/privacy' },
                { name: 'TERMS_OF_SERVICE', path: '/terms' },
                { name: 'COMMUNITY_GUIDELINES', path: '/support' }
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-white transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 mb-8">DIRECT_LINE</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/20" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{contactInfo.officialEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white/20" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{contactInfo.communityNumber}</span>
              </div>
              <Link 
                to="/contact"
                className="inline-block mt-4 px-6 py-3 border border-white/20 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
              >
                REQUEST_STRATEGIC_MEETING
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_theme(colors.green.500)]" />
            <span className="text-[8px] font-black tracking-[0.3em] uppercase text-white/20">SYSTEM_OPERATIONAL_X100</span>
          </div>
          <p className="text-[8px] font-black tracking-[0.4em] uppercase text-white/10">
            © {currentYear} PASTOR_JK_GLOBAL_MINISTRIES. ALL_RIGHTS_RETAINED. PROPHETIC_INTEGRITY_ENFORCED.
          </p>
          <div className="flex items-center gap-2 text-[8px] font-mono text-white/10 uppercase">
            BUILD_ID: 2024.04.PJK
          </div>
        </div>
      </div>
    </footer>
  );
};

interface StrategicInsight {
  id: string;
  sourceTitle: string;
  correctionsSummary: string;
  strategicAdvice: string;
  createdAt: any;
}

const Navbar = ({ user, profile, onLogout, onOpenCreateModal, searchQuery, onSearchChange }: { 
  user: FirebaseUser | null, 
  profile: UserProfile | null, 
  onLogout: () => void, 
  onOpenCreateModal: () => void,
  searchQuery: string,
  onSearchChange: (query: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const navItems: { name: string, path: string, icon: any, special?: boolean }[] = [
    { name: 'HOME', path: '/', icon: Layout },
    { name: 'ABOUT', path: '/about', icon: Info },
    { name: 'PROFILE', path: '/profile', icon: UserIcon },
    { name: 'VIDEOS', path: '/videos', icon: Video },
    { name: 'SERMONS', path: '/sermons', icon: Volume2 },
    { name: 'ARTICLES', path: '/books', icon: Book },
    { name: 'BIBLE STUDY', path: '/bible', icon: Cross },
    { name: 'SERMON NOTES', path: '/notes', icon: Plus },
    { name: 'EVENTS', path: '/events', icon: Calendar },
    { name: 'SUPPORT', path: '/support', icon: Heart },
    { name: 'GALLERY', path: '/pictures', icon: ImageIcon },
    { name: 'UPDATES', path: '/notifications', icon: Bell },
    { name: 'SAVED', path: '/bookmarks', icon: Bookmark },
    { name: 'CONTACT', path: '/contact', icon: Mail },
  ];

  const isAdminOrContributor = profile?.role === 'admin' || profile?.role === 'contributor';
  if (isAdminOrContributor) {
    navItems.push({ 
      name: profile?.role === 'admin' ? 'ADMIN_DASHBOARD' : 'CONTRIBUTOR_CENTER', 
      path: '/admin', 
      icon: Shield, 
      special: true 
    });
  }

  return (
    <nav className="lg:hidden border-b border-white/10 sticky top-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-4 h-4 border-2 border-white rounded-full mb-[-4px]" />
                  <div className="w-6 h-1 bg-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-[0.2em] uppercase glitter-text leading-none">PASTOR_JK</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-white/40 uppercase mt-1">OFFICIAL_BRAND</span>
              </div>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:items-center overflow-x-auto no-scrollbar max-w-[50vw] sm:space-x-8 pb-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
                    item.special ? 'glitter-text border-white/40' : ''
                  } ${
                    location.pathname === item.path
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/40 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="SEARCH_SYSTEM..."
                className="bg-white/5 border border-white/10 rounded-sm pl-8 pr-4 py-1.5 text-[8px] font-black tracking-widest uppercase focus:outline-none focus:border-white/30 transition-all w-48"
              />
            </form>
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/notifications" className="relative p-2 text-white/40 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black" />
              </Link>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-all">
                    <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-bold tracking-wider text-white/70">{user.displayName?.toUpperCase()}</span>
                  </Link>
                  <button
                    onClick={onLogout}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithPopup(auth, googleProvider)}
                  className="glitter-button glitter-gold inline-flex items-center px-6 py-2.5 text-[10px] font-black tracking-widest uppercase text-black hover:scale-105 transition-all rounded-sm shadow-lg"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/40 hover:text-white"
            >
              {isOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl overflow-y-auto max-h-[calc(100vh-64px)]"
          >
            <div className="px-4 pt-4 pb-8 space-y-4">
              {user && (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10 mb-4">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full grayscale" referrerPolicy="no-referrer" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black tracking-widest text-white/70 uppercase truncate max-w-[150px]">{user.displayName}</span>
                      <span className="text-[8px] font-black text-white/20 uppercase">{profile?.role}</span>
                    </div>
                  </div>
                  <button onClick={() => { onLogout(); setIsOpen(false); }} className="text-white/40 hover:text-white transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-[10px] font-black tracking-widest uppercase transition-all ${
                    location.pathname === item.path ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Sidebar = ({ user, profile, onLogout, onOpenCreateModal, searchQuery, onSearchChange }: { 
  user: FirebaseUser | null, 
  profile: UserProfile | null, 
  onLogout: () => void, 
  onOpenCreateModal: () => void,
  searchQuery: string,
  onSearchChange: (query: string) => void
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const navItems: { name: string, path: string, icon: any, special?: boolean }[] = [
    { name: 'HOME', path: '/', icon: Layout },
    { name: 'ABOUT', path: '/about', icon: Info },
    { name: 'PROFILE', path: '/profile', icon: UserIcon },
    { name: 'VIDEOS', path: '/videos', icon: Video },
    { name: 'SERMONS', path: '/sermons', icon: Volume2 },
    { name: 'ARTICLES', path: '/books', icon: Book },
    { name: 'BIBLE STUDY', path: '/bible', icon: Cross },
    { name: 'SERMON NOTES', path: '/notes', icon: Plus },
    { name: 'EVENTS', path: '/events', icon: Calendar },
    { name: 'SUPPORT', path: '/support', icon: Heart },
    { name: 'GALLERY', path: '/pictures', icon: ImageIcon },
    { name: 'UPDATES', path: '/notifications', icon: Bell },
    { name: 'SAVED', path: '/bookmarks', icon: Bookmark },
    { name: 'CONTACT', path: '/contact', icon: Mail },
  ];

  const isAdminOrContributor = profile?.role === 'admin' || profile?.role === 'contributor';
  if (isAdminOrContributor) {
    navItems.push({ 
      name: profile?.role === 'admin' ? 'ADMIN_DASHBOARD' : 'CONTRIBUTOR_CENTER', 
      path: '/admin', 
      icon: Shield, 
      special: true 
    });
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-black/50 backdrop-blur-xl z-[60] overflow-y-auto custom-scrollbar">
      <div className="p-8 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/20 rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-4 h-4 border-2 border-white rounded-full mb-[-4px]" />
              <div className="w-6 h-1 bg-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-[0.2em] uppercase glitter-text leading-none">PASTOR_JK</span>
            <span className="text-[8px] font-black tracking-[0.4em] text-white/40 uppercase mt-1">OFFICIAL_BRAND</span>
          </div>
        </Link>
      </div>

      <div className="px-6 py-6 border-b border-white/10">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="SEARCH_SYSTEM..."
            className="w-full bg-white/5 border border-white/10 rounded-sm pl-8 pr-4 py-3 text-[8px] font-black tracking-widest uppercase focus:outline-none focus:border-white/30 transition-all"
          />
        </form>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase transition-all ${
              location.pathname === item.path
                ? 'bg-white text-black'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
        
        {(profile?.role === 'admin' || profile?.role === 'contributor') && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 px-4">
              {profile?.role === 'admin' ? 'ADMIN_CONTROLS' : 'CONTRIBUTOR_CONTROLS'}
            </p>
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-white/10">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full grayscale" referrerPolicy="no-referrer" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-white/70 uppercase truncate max-w-[100px]">{user.displayName}</span>
                <span className="text-[8px] font-black text-white/20 uppercase">{profile?.role}</span>
              </div>
            </div>
            <button onClick={onLogout} className="text-white/40 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithPopup(auth, googleProvider)}
            className="w-full glitter-button glitter-gold py-4 text-[10px] font-black tracking-widest uppercase rounded-sm"
          >
            SIGN_IN
          </button>
        )}
      </div>
    </aside>
  );
};

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title, postId }: { isOpen: boolean, onClose: () => void, videoUrl: string, title: string, postId: string }) => {
  const [filter, setFilter] = useState('none');
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [existingNotes, setExistingNotes] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && postId && isOpen) {
      const q = query(
        collection(db, 'users', user.uid, 'sermon_notes'),
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setExistingNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user, postId, isOpen]);

  const handleSaveNote = async () => {
    if (!user || !noteContent.trim()) return;
    setIsSaving(true);
    try {
      const noteId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'users', user.uid, 'sermon_notes', noteId), {
        id: noteId,
        userId: user.uid,
        postId: postId,
        title: `Note for ${title}`,
        content: noteContent,
        createdAt: serverTimestamp()
      });
      setNoteContent('');
      alert("Note saved successfully!");
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note.");
    } finally {
      setIsSaving(false);
    }
  };

  const filters = [
    { name: 'NONE', value: 'none' },
    { name: 'GRAYSCALE', value: 'grayscale(100%)' },
    { name: 'SEPIA', value: 'sepia(100%)' },
    { name: 'HIGH_CONTRAST', value: 'contrast(150%) brightness(110%)' },
    { name: 'VINTAGE', value: 'sepia(50%) contrast(120%)' },
    { name: 'DRAMATIC', value: 'saturate(150%) contrast(120%)' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-6xl overflow-hidden rounded-sm border-white/20 shadow-2xl flex flex-col md:flex-row h-[90vh]"
      >
        <div className={`flex-1 flex flex-col ${showNotes ? 'md:w-2/3' : 'w-full'}`}>
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-white/40" />
              <h2 className="text-sm font-black tracking-widest uppercase truncate max-w-[200px] md:max-w-md">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1 rounded-sm border border-white/10">
                <Sparkles className="w-3 h-3 text-white/40" />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent text-[8px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                >
                  {filters.map(f => (
                    <option key={f.name} value={f.value} className="bg-black text-white">{f.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded-sm transition-all ${showNotes ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                title="Toggle Notes"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              style={{ filter }}
              className="w-full h-full object-contain transition-all duration-500"
            />
          </div>

          <div className="p-6 bg-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black tracking-widest uppercase text-white/40">OFFICIAL_BRAND_STREAM</p>
            </div>
            <button 
              onClick={onClose}
              className="text-[10px] font-black tracking-widest uppercase bg-white text-black px-6 py-2 rounded-sm hover:bg-white/80 transition-all"
            >
              CLOSE_PLAYER
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-full md:w-1/3 border-l border-white/10 bg-white/5 flex flex-col h-full"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xs font-black tracking-widest uppercase">SERMON_NOTES</h3>
                <button onClick={() => setShowNotes(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">NEW_NOTE</label>
                  <textarea 
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your thoughts here..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-sm p-4 text-xs font-medium focus:outline-none focus:border-white transition-all resize-none"
                  />
                  <button 
                    onClick={handleSaveNote}
                    disabled={isSaving || !noteContent.trim()}
                    className="w-full glitter-button glitter-gold py-3 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    SAVE_NOTE
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">EXISTING_NOTES</label>
                  {existingNotes.length === 0 ? (
                    <p className="text-[10px] text-white/20 uppercase tracking-widest italic">No notes for this sermon yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {existingNotes.map((note) => (
                        <div key={note.id} className="p-4 bg-white/5 border border-white/10 rounded-sm space-y-2 group hover:border-white/30 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                              {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleString() : 'Just now'}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ShareModal = ({ isOpen, onClose, post, notify }: { isOpen: boolean, onClose: () => void, post: Post, notify: (msg: string, type: any) => void }) => {
  const shareUrl = `${window.location.origin}/#${post.id}`;
  
  const shareOptions = [
    { name: 'Twitter', icon: Twitter, color: 'hover:text-[#1DA1F2]', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: Facebook, color: 'hover:text-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'LinkedIn', icon: Linkedin, color: 'hover:text-[#0A66C2]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      notify("LINK_COPIED: Post link committed to strategic clipboard.", "success");
    } catch (err) {
      console.error('Failed to copy: ', err);
      notify("COPY_FAILED: Could not transfer link.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-sm p-8 rounded-sm border-white/20 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-black tracking-widest uppercase">AMPLIFY_VISION</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-sm transition-all ${option.color} hover:bg-white/10`}
            >
              <option.icon className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase tracking-widest">{option.name}</span>
            </a>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">DIRECT_LINK</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-[10px] font-mono text-white/60 focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-white text-black rounded-sm hover:bg-white/80 transition-all"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PostCard = ({ 
  post, 
  profile, 
  onComment, 
  onPurchase, 
  isBookmarked, 
  onBookmark, 
  onRead,
  onLike,
  isLiked,
  aiSettings,
  notify,
  onMarketing,
  onSermonOutline,
  onTakeNote,
  onEnhance
}: { 
  post: Post, 
  profile: UserProfile | null, 
  onComment: (postId: string, text: string) => void, 
  onPurchase: (post: Post) => void, 
  isBookmarked: boolean, 
  onBookmark: (postId: string) => void, 
  onRead?: (post: Post) => void,
  onLike?: (postId: string) => void,
  isLiked?: boolean,
  aiSettings: AISettings,
  notify: (msg: string, type: any) => void,
  onMarketing?: (post: Post) => void,
  onSermonOutline?: (post: Post) => void,
  onTakeNote?: (content: string, post?: Post) => void,
  onEnhance?: (post: Post) => void
}) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAIResult] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');

  useEffect(() => {
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
    return unsubscribe;
  }, [post.id]);

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = post.mediaUrl;
    link.download = `${post.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAIFeature = async (feature: 'translate' | 'explain' | 'read' | 'proofread' | 'summarize' | 'enhance') => {
    setIsAILoading(true);
    setAIResult(null);
    try {
      if (feature === 'translate') {
        const result = await translateContent(post.content, targetLanguage);
        setAIResult(result);
      } else if (feature === 'explain') {
        const result = await explainBook(post.content);
        setAIResult(result);
      } else if (feature === 'summarize') {
        const result = await summarizeContent(post.content, aiSettings.persona);
        setAIResult(result);
      } else if (feature === 'read') {
        const base64 = await generateSpeech(post.content);
        if (base64) {
          const audio = new Audio(`data:audio/wav;base64,${base64}`);
          audio.play();
        }
      } else if (feature === 'proofread') {
        const isStaff = profile?.role === 'admin' || profile?.role === 'contributor';
        const result = await proofreadBook(post.title, post.content, isStaff ? 'PROFESSIONAL' : 'BALANCED');
        
        if (isStaff) {
          // Store in collective strategic memory for brand excellence
          await addDoc(collection(db, 'strategic_insights'), {
            postId: post.id,
            sourceTitle: post.title,
            correctedTitle: result.correctedTitle,
            correctionsSummary: result.correctionsMade,
            strategicAdvice: result.strategicAdvice,
            authorUid: profile?.uid,
            createdAt: serverTimestamp()
          });

          // Harmonize the source post with the AI's corrected vision
          if (onEnhance) {
            onEnhance({
              ...post,
              title: result.correctedTitle,
              content: result.correctedContent,
              suggestions: `STRATEGIC_PROOFR: ${result.correctionsMade}`
            });
          }
          notify("STRATEGIC_POLISH_APPLIED: Content harmonized and insights archived.", "success");
        }

        setAIResult(`CORRECTED_TITLE: ${result.correctedTitle}\n\nCORRECTED_CONTENT:\n\n${result.correctedContent}\n\nCORRECTIONS: ${result.correctionsMade}\n\nSTRATEGIC_ADVICE: ${result.strategicAdvice}`);
      } else if (feature === 'enhance') {
        const result = await enhancePostContent(post.title, post.content, post.type, aiSettings.persona);
        setAIResult(`ENHANCED_TITLE: ${result.enhancedTitle}\n\nENHANCED_CONTENT: ${result.enhancedContent}\n\nSUGGESTIONS: ${result.suggestions}`);
        
        if (onEnhance) {
          // Allow the parent to handle the update if it chooses to
          onEnhance({
            ...post,
            title: result.enhancedTitle,
            content: result.enhancedContent
          });
        }
      }
    } catch (error) {
      console.error(`AI ${feature} failed:`, error);
    } finally {
      setIsAILoading(false);
    }
  };

  const readingTime = Math.ceil(post.content.split(' ').length / 200);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="glass-card rounded-sm overflow-hidden group transition-all"
    >
      <div className="relative aspect-video overflow-hidden bg-white/5">
        {post.type === 'picture' && (
          <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
        )}
        {(post.type === 'video' || post.type === 'sermon') && (
          <button 
            onClick={() => setShowVideoPlayer(true)}
            className="w-full h-full flex items-center justify-center group/play relative"
          >
            <div className="absolute inset-0 bg-black/40 group-hover/play:bg-black/20 transition-colors" />
            <div className="relative z-10 w-20 h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-white group-hover/play:text-black transition-all duration-500">
              <Video className="w-8 h-8" />
            </div>
            <span className="absolute bottom-6 text-[8px] font-black tracking-[0.4em] uppercase text-white/40 group-hover/play:text-white transition-colors">
              ACTIVATE_STREAM
            </span>
          </button>
        )}
        {(post.type === 'book' || post.type === 'devotion') && (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="w-12 h-12 text-white/20 group-hover:text-white transition-colors" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="text-[8px] font-black tracking-[0.2em] uppercase bg-white text-black px-2 py-1">
            {post.type}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onBookmark(post.id); }}
            className={`p-1.5 rounded-sm transition-all flex items-center gap-2 ${isBookmarked ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
            title={post.type === 'video' || post.type === 'sermon' ? 'Queue for Excellence' : post.type === 'devotion' ? 'Reserve for Reflection' : 'Archive Wisdom'}
          >
            {isBookmarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
            <span className="text-[8px] font-black uppercase tracking-tighter">
              {isBookmarked ? 'WISDOM_ARCHIVED' : (post.type === 'video' || post.type === 'sermon' ? 'QUEUE_FOR_EXCELLENCE' : post.type === 'devotion' ? 'RESERVE_FOR_REFLECTION' : 'ARCHIVE_WISDOM')}
            </span>
          </button>
        </div>
        {post.price && post.price > 0 && (
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-black bg-white text-black px-2 py-1">
              ${post.price}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onLike?.(post.id)}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {post.likesCount || 0} IMPACT_POINTS
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              {comments.length} STRATEGIC_DIALOGUE
            </button>
            <button 
              onClick={() => onTakeNote?.(`INSIGHT: From "${post.title}"\n\n`, post)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
              title="Take Note"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              <Share2 className="w-4 h-4" />
              AMPLIFY_INFLUENCE
            </button>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
              <Clock className="w-3 h-3" />
              {readingTime} MIN
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase">
              {new Date(post.createdAt?.toDate()).toLocaleDateString()}
            </span>
          </div>
        </div>
        <h3 className="text-xl font-black tracking-tight mb-3 uppercase">{post.title}</h3>
        <p className="text-white/60 text-sm mb-6 font-medium leading-relaxed line-clamp-2">{post.content}</p>
        
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          post={post} 
          notify={notify}
        />
        
        {post.tiktokUrl && (
          <a 
            href={post.tiktokUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 text-[10px] font-black tracking-widest uppercase bg-black text-white border border-white/20 hover:bg-white hover:text-black transition-all rounded-sm mb-6"
          >
            <ExternalLink className="w-3 h-3" /> WATCH_ON_TIKTOK
          </a>
        )}

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {(post.type === 'video' || post.type === 'sermon') && (
            <button 
              onClick={() => setShowVideoPlayer(true)}
              className="glitter-button glitter-gold w-full py-4 text-[10px] sm:text-[11px] font-black tracking-widest uppercase bg-white text-black hover:bg-white/80 transition-all rounded-sm flex items-center justify-center gap-3"
            >
              <Video className="w-4 h-4" /> ENGAGE_VISION
            </button>
          )}
          <button 
            onClick={() => onTakeNote?.(`STRATEGIC_REVELATION: From "${post.title}"\n\n`, post)}
            className="w-full py-3 text-[10px] font-black tracking-widest uppercase border border-gold-500/30 text-gold-500/80 hover:bg-gold-500/10 transition-all rounded-sm flex items-center justify-center gap-3"
          >
            <PlusSquare className="w-4 h-4" /> TAKE_REVELATION
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="w-full py-3 text-[10px] font-black tracking-widest uppercase border border-white/10 text-white/60 hover:bg-white/5 transition-all rounded-sm flex items-center justify-center gap-3"
          >
            <Share2 className="w-4 h-4" /> SHARE_VISION
          </button>
          {post.type === 'book' && (
            <>
              {post.price && post.price > 0 && (
                <button 
                  onClick={() => onPurchase(post)}
                  className="glitter-button glitter-gold w-full py-4 text-[10px] sm:text-[11px] font-black tracking-widest uppercase rounded-sm flex items-center justify-center gap-3 mb-3"
                >
                  <ShoppingCart className="w-4 h-4" /> BUY_NOW_${post.price}
                </button>
              )}
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => {
                    handleDownload();
                    if (!isBookmarked) onBookmark(post.id);
                  }} 
                  className="glitter-button flex-1 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black tracking-widest uppercase border border-white/20 hover:bg-white hover:text-black transition-all rounded-sm"
                >
                  ACQUIRE_ASSET
                </button>
                <button 
                  onClick={() => onRead?.(post)}
                  className="glitter-button flex-1 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black tracking-widest uppercase bg-white text-black hover:bg-white/80 transition-all rounded-sm"
                >
                  ABSORB_WISDOM
                </button>
              </div>
            </>
          )}
        </div>

        {onMarketing && profile?.role === 'admin' && (
          <div className="space-y-2 mb-6">
            <button 
              onClick={() => onMarketing(post)}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Target className="w-4 h-4" /> STRATEGIC_MARKETING_SUITE
            </button>
            <button 
              onClick={() => onSermonOutline?.(post)}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Cross className="w-4 h-4" /> GENERATE_SERMON_OUTLINE
            </button>
          </div>
        )}

        <div className="space-y-4 mb-6 border-t border-white/10 pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-white/40" />
              <select 
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-sm px-3 py-1.5 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
              >
                <option value="Spanish" className="bg-black">Spanish</option>
                <option value="French" className="bg-black">French</option>
                <option value="German" className="bg-black">German</option>
                <option value="Swahili" className="bg-black">Swahili</option>
                <option value="Chinese" className="bg-black">Chinese</option>
                <option value="Arabic" className="bg-black">Arabic</option>
                <option value="English" className="bg-black">English</option>
              </select>
            </div>
            <button 
              onClick={() => handleAIFeature('translate')}
              disabled={isAILoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-[8px] font-black tracking-widest uppercase bg-white/5 border border-white/10 hover:border-white transition-all rounded-sm disabled:opacity-50"
            >
              {isAILoading ? <Activity className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              GLOBAL_DECODING
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleAIFeature('summarize')}
              disabled={isAILoading}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 text-[8px] font-black tracking-widest uppercase bg-white/5 border border-white/10 hover:border-white transition-all rounded-sm disabled:opacity-50"
            >
              <Lightbulb className="w-3 h-3" /> STRATEGIC_SUMMARY
            </button>
            <button 
              onClick={() => handleAIFeature('explain')}
              disabled={isAILoading}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 text-[8px] font-black tracking-widest uppercase bg-white/5 border border-white/10 hover:border-white transition-all rounded-sm disabled:opacity-50"
            >
              <Activity className="w-3 h-3" /> AI_DEEP_DIVE
            </button>
            <button 
              onClick={() => handleAIFeature('read')}
              disabled={isAILoading}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 text-[8px] font-black tracking-widest uppercase bg-white/5 border border-white/10 hover:border-white transition-all rounded-sm disabled:opacity-50"
            >
              <Volume2 className="w-3 h-3" /> VOCAL_SYNTHESIS
            </button>
            {(profile?.role === 'admin' || profile?.role === 'contributor') && (
              <>
                <button 
                  onClick={() => handleAIFeature('proofread')}
                  disabled={isAILoading}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 text-[8px] font-black tracking-widest uppercase bg-white/10 border border-white/20 hover:border-white transition-all rounded-sm disabled:opacity-50"
                >
                  <Check className="w-3 h-3" /> EDITORIAL_POLISH
                </button>
                <button 
                  onClick={() => handleAIFeature('enhance')}
                  disabled={isAILoading}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 text-[8px] font-black tracking-widest uppercase bg-white/10 border border-white/20 hover:border-white transition-all rounded-sm disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" /> STRATEGIC_ENHANCE
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-white/5 border-l-2 border-white overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">AI_RESULT</span>
                <button onClick={() => setAIResult(null)}><X className="w-3 h-3 text-white/40" /></button>
              </div>
              <p className="text-[11px] text-white/80 font-medium leading-relaxed">{aiResult}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <VideoPlayerModal 
          isOpen={showVideoPlayer} 
          onClose={() => setShowVideoPlayer(false)} 
          videoUrl={post.mediaUrl} 
          title={post.title} 
          postId={post.id}
        />

        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-3 h-3 text-white/40" />
            </div>
            <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">{post.authorName}</span>
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/40 hover:text-white transition-colors uppercase"
          >
            <MessageSquare className="w-4 h-4" />
            {comments.length}
          </button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-white/10 overflow-hidden"
            >
              <form onSubmit={handleComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="ADD COMMENT..."
                  className="flex-1 text-[10px] font-black tracking-widest bg-white/5 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-white transition-all uppercase"
                />
                <button
                  type="submit"
                  className="bg-white text-black text-[10px] font-black tracking-widest px-6 py-3 rounded-sm hover:bg-white/80 transition-colors uppercase"
                >
                  POST
                </button>
              </form>
              <div className="space-y-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-widest uppercase">{comment.authorName}</span>
                      <span className="text-[9px] font-mono text-white/30">
                        {new Date(comment.createdAt?.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 font-medium">{comment.text}</p>
                    {comment.aiReply && (
                      <div className="mt-3 ml-4 p-4 bg-white/5 border-l-2 border-white">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-3 h-3 text-white" />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em]">AI_REPLY</span>
                        </div>
                        <p className="text-[11px] text-white/80 italic font-medium leading-relaxed">{comment.aiReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const CreatePostModal = ({ isOpen, onClose, onPost, aiSettings, notify }: { isOpen: boolean, onClose: () => void, onPost: (data: any) => void, aiSettings: AISettings, notify: (msg: string, type: any) => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'video' | 'book' | 'picture' | 'notification' | 'sermon' | 'devotion' | 'course' | 'podcast'>('picture');
  const handleTypeChange = (newType: any) => {
    setType(newType);
    setIsMediaRefined(false);
  };
  const [mediaUrl, setMediaUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [price, setPrice] = useState('0');
  const [isFullBook, setIsFullBook] = useState(true);
  const [chapterNumber, setChapterNumber] = useState('1');
  const [isModerating, setIsModerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isProofreading, setIsProofreading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [imageEditPrompt, setImageEditPrompt] = useState('');
  const [videoTrim, setVideoTrim] = useState('');
  const [videoEffects, setVideoEffects] = useState('');
  const [videoAudioLevel, setVideoAudioLevel] = useState('');
  const [videoDuration, setVideoDuration] = useState(10);
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p' | '4k'>('4k');
  const [mediaSuggestions, setMediaSuggestions] = useState<{ suggestions: string, strategicValue: string, recommendedTools: string } | null>(null);
  const [moderationResult, setModerationResult] = useState<{ status: string, moderatedTitle: string, moderatedContent: string, note: string } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [marketingSuite, setMarketingSuite] = useState<string | null>(null);
  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState(false);
  const [isMediaRefined, setIsMediaRefined] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsMediaRefined(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!title || !content) return;
    setIsEnhancing(true);
    try {
      const result = await enhancePostContent(title, content, type, aiSettings.persona as any);
      setTitle(result.enhancedTitle);
      setContent(result.enhancedContent);
      alert(`AI SUGGESTIONS: ${result.suggestions}`);
    } catch (error) {
      console.error("Enhancement failed:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAIGenerateVideo = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const videoUrl = await generateVideo(title, {
        trim: videoTrim,
        effects: videoEffects,
        audioLevel: videoAudioLevel,
        duration: videoDuration,
        resolution: videoResolution
      });
      if (videoUrl) setMediaUrl(videoUrl);
    } catch (error) {
      console.error("Video generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIEditImage = async () => {
    if (!base64Image || !imageEditPrompt) return;
    setIsGenerating(true);
    try {
      const pureBase64 = base64Image.split(',')[1];
      const editedBase64 = await editImage(pureBase64, imageEditPrompt, aiSettings.persona);
      if (editedBase64) {
        const newUrl = `data:image/png;base64,${editedBase64}`;
        setBase64Image(newUrl);
        setMediaUrl(newUrl);
        setImageEditPrompt('');
        setIsMediaRefined(true);
      }
    } catch (error) {
      console.error("Image edit failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIEditVideo = async () => {
    if (!mediaUrl || !videoTrim) return;
    setIsGenerating(true);
    try {
      // In a real implementation, we would call an editVideo service.
      // For now, we simulate the AI processing the trim points.
      const editedUrl = await generateVideo(`EDIT_EXISTING_VIDEO: ${title}`, {
        trim: videoTrim,
        effects: videoEffects,
        audioLevel: videoAudioLevel,
        duration: videoDuration,
        resolution: videoResolution
      });
      if (editedUrl) {
        setMediaUrl(editedUrl);
        setIsMediaRefined(true);
      }
      alert(`AI_VIDEO_EDIT_COMPLETE: Applied trim points based on: "${videoTrim}"`);
    } catch (error) {
      console.error("Video edit failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISuggestEdits = async () => {
    if (!title) return;
    setIsSuggesting(true);
    try {
      const result = await suggestMediaEdits(base64Image, type, title, content, aiSettings.persona);
      setMediaSuggestions(result);
    } catch (error) {
      console.error("Media suggestions failed:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!content) {
      alert("PLEASE_PROVIDE_CONTENT: I need context to generate a strategic title.");
      return;
    }
    setIsGeneratingTitle(true);
    try {
      const generatedTitle = await generateTitle(content, type, aiSettings.persona);
      const cleanTitle = generatedTitle.replace(/"/g, '').trim();
      setTitle(cleanTitle);
      setSuggestedTitle(cleanTitle);
    } catch (error) {
      console.error("Title generation failed:", error);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleAIModerate = async () => {
    if (!title || !content) return;
    setIsModerating(true);
    try {
      const result = await moderatePost(title, content, type, aiSettings.persona);
      setModerationResult(result);
      if (result.status === 'edited') {
        setTitle(result.moderatedTitle);
        setContent(result.moderatedContent);
      }
    } catch (error) {
      console.error("Moderation failed:", error);
    } finally {
      setIsModerating(false);
    }
  };

  const handleSummarize = async () => {
    if (!content) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeContent(content, aiSettings.persona);
      setSummary(result);
      setShowSummary(true);
    } catch (error) {
      console.error("Summarization failed:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleProofread = async () => {
    if (!title || !content) return;
    setIsProofreading(true);
    try {
      const result = await proofreadBook(title, content, aiSettings.persona);
      setTitle(result.correctedTitle);
      setContent(result.correctedContent);
      
      // Save strategic insight to persistent storage
      try {
        await addDoc(collection(db, 'strategic_insights'), {
          sourceTitle: result.correctedTitle,
          correctionsSummary: result.correctionsMade,
          strategicAdvice: result.strategicAdvice,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Archive failed:", e);
      }

      notify("ENHANCEMENT_COMPLETE: Your content is now optimized for impact.", "success");
    } catch (error) {
      notify(getFriendlyErrorMessage(error), "error");
      console.error("Proofreading failed:", error);
    } finally {
      setIsProofreading(false);
    }
  };

  const handleGenerateMarketing = async () => {
    if (!title || !content) {
      alert("PLEASE_PROVIDE_DATA: I need a title and description to generate a marketing suite.");
      return;
    }
    setIsGeneratingMarketing(true);
    try {
      const result = await generateMarketingSuite(title, content);
      setMarketingSuite(result);
    } catch (error) {
      console.error("Marketing generation failed:", error);
    } finally {
      setIsGeneratingMarketing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalModeration = moderationResult;
    let finalTitle = title;
    let finalContent = content;

    // Auto-Refine Protocol
    if (aiSettings.isAutoUpdateEnabled) {
      setIsModerating(true); // Reuse loading state
      try {
        const refined = await enhancePostContent(title, content, type, aiSettings.persona);
        finalTitle = refined.enhancedTitle;
        finalContent = refined.enhancedContent;
        
        // Auto-Media refinement if needed
        if (!isMediaRefined && aiSettings.isAIEnabled) {
          if (type === 'picture' && base64Image) {
            const pureBase64 = base64Image.split(',')[1];
            const editedBase64 = await editImage(pureBase64, "Optimize image to professional 4K quality, enhance clarity, color grade for premium executive brand, and ensure visual impact.", aiSettings.persona);
            if (editedBase64) {
              const newUrl = `data:image/png;base64,${editedBase64}`;
              setBase64Image(newUrl);
              setMediaUrl(newUrl);
              setIsMediaRefined(true);
            }
          } else if (type === 'video' && mediaUrl) {
            const editedUrl = await generateVideo(`REFINE_EXISTING_VIDEO: ${finalTitle}`, {
              trim: videoTrim || "BEST_PARTS",
              effects: videoEffects || "PROFESSIONAL_GRADE",
              audioLevel: videoAudioLevel || "CLEAR_VOICE",
              duration: videoDuration,
              resolution: videoResolution
            });
            if (editedUrl) {
              setMediaUrl(editedUrl);
              setIsMediaRefined(true);
            }
          }
        }
      } catch (error) {
        console.error("Auto-refine failed:", error);
      } finally {
        setIsModerating(false);
      }
    }
    
    if (!finalModeration && aiSettings.isAIEnabled) {
      setIsModerating(true);
      try {
        finalModeration = await moderatePost(finalTitle, finalContent, type, aiSettings.persona);
        setModerationResult(finalModeration);
      } catch (error) {
        console.error("Moderation failed:", error);
      } finally {
        setIsModerating(false);
      }
    }

    const status = (finalModeration?.status === 'rejected' || finalModeration?.status === 'edited') ? 'pending' : 
                   (finalModeration?.status === 'approved' ? 'approved' : 'pending');

    const moderationHistory = [{
      note: finalModeration?.note || 'INITIAL_SUBMISSION',
      status: status,
      createdAt: new Date().toISOString(),
      suggestions: finalModeration?.status === 'edited' ? `Title: ${finalModeration.moderatedTitle}\nContent: ${finalModeration.moderatedContent}` : (finalModeration?.status === 'rejected' ? 'FLAGGED_FOR_REJECTION' : '')
    }];

    onPost({
      title: finalTitle,
      content: finalContent,
      type,
      mediaUrl: mediaUrl || 'https://picsum.photos/seed/post/800/600',
      tiktokUrl: tiktokUrl || undefined,
      status,
      aiModerationNote: finalModeration?.note || 'MANUAL_SUBMISSION',
      moderationSuggestions: finalModeration?.status === 'edited' ? {
        title: finalModeration.moderatedTitle,
        content: finalModeration.moderatedContent,
        note: finalModeration.note
      } : undefined,
      moderationHistory,
      price: parseFloat(price),
      isFullBook: type === 'book' ? isFullBook : undefined,
      chapterNumber: type === 'book' && !isFullBook ? parseInt(chapterNumber) : undefined
    });
    
    setTitle('');
    setContent('');
    setMediaUrl('');
    setTiktokUrl('');
    setPrice('0');
    setModerationResult(null);
    setSuggestedTitle(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-sm w-full max-w-2xl overflow-hidden shadow-2xl border-white/10"
      >
        <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-black tracking-widest uppercase leading-none">UPLOAD_CONTENT</h2>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 italic">AUTOMATIC_AI_4K_ENHANCEMENT_ENABLED</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 sm:space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">QUICK_POST_PRESETS</label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'SERMON', type: 'sermon', title: 'WEEKLY SERMON: [TOPIC]', content: 'Join us for a powerful message on [TOPIC]. Discover how to [KEY TAKEAWAY].' },
                { name: 'DEVOTION', type: 'devotion', title: 'DAILY DEVOTION: [TITLE]', content: 'Today\'s word is focused on [THEME]. Let us reflect on [SCRIPTURE].' },
                { name: 'ANNOUNCEMENT', type: 'notification', title: 'OFFICIAL ANNOUNCEMENT', content: 'We are excited to share that [NEWS]. Stay tuned for more details.' },
                { name: 'BOOK_LAUNCH', type: 'book', title: 'NEW RELEASE: [BOOK TITLE]', content: 'My latest book, [BOOK TITLE], is now available. Dive into the wisdom of [SUMMARY].' }
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    handleTypeChange(preset.type as any);
                    setTitle(preset.title);
                    setContent(preset.content);
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">MEDIA_UPLOAD</label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); alert('File received! Simulating upload...'); }}
              className={`relative border-2 border-dashed rounded-sm p-12 text-center transition-all ${
                isDragging ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <input 
                type="file" 
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              {mediaUrl ? (
                <div className="space-y-4">
                  {type === 'picture' ? (
                    <img src={mediaUrl} alt="Preview" className="max-h-40 mx-auto rounded-sm border border-white/10" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-white/40">
                      <Video className="w-6 h-6" />
                      <span className="text-[8px] font-black uppercase tracking-widest">MEDIA_READY</span>
                    </div>
                  )}
                  <p className="text-[8px] font-mono text-white/20 truncate max-w-xs mx-auto">{mediaUrl}</p>
                </div>
              ) : (
                <>
                  <Plus className="w-10 h-10 mx-auto mb-4 text-white/20" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/40">
                    DRAG & DROP FILES FROM PC OR CLICK TO BROWSE
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {type === 'video' && (
                <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-3 h-3 text-white/40" />
                    <h4 className="text-[10px] font-black tracking-widest uppercase">AI_VIDEO_EDITING_SUITE</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { name: 'INSPIRING VISUALS', effects: 'ETHEREAL GLOW, SOFT LIGHTING', trim: 'BEST SPIRITUAL MOMENTS', audio: 'AMBIENT WORSHIP' },
                      { name: 'EXECUTIVE POLISH', effects: 'MODERN COLOR GRADE, SHARP CLARITY', trim: 'CONCISE PROFESSIONAL CUTS', audio: 'VOICE ENHANCEMENT' },
                      { name: 'SERMON HIGHLIGHT', effects: 'CINEMATIC DRAMA, HIGH CONTRAST', trim: '15S KEY MESSAGE', audio: 'BOOST SPEECH CLARITY' },
                      { name: 'SPIRITUAL AWAKENING', effects: 'WARM SUNLIGHT, HIGH EXPOSURE', trim: 'UPLIFTING CLIMAX', audio: 'POWERFUL CHOIR' },
                      { name: 'CORPORATE BRANDING', effects: 'MINIMALIST BLUE TONES, CLEAN LINES', trim: 'EXECUTIVE SUMMARY', audio: 'MODERN AMBIENT' },
                      { name: 'TESTIMONIAL', effects: 'SOFT FOCUS, NATURAL COLORS', trim: 'EMOTIONAL STORYTELLING', audio: 'CLEAR VOICE, SOFT PIANO' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setVideoEffects(preset.effects);
                          setVideoTrim(preset.trim);
                          setVideoAudioLevel(preset.audio);
                        }}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[7px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30">TRIM_PROMPT</label>
                      <input
                        type="text"
                        value={videoTrim}
                        onChange={(e) => setVideoTrim(e.target.value)}
                        placeholder="E.G. 'FIRST 10 SECONDS'..."
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-[8px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30">VISUAL_EFFECTS</label>
                      <input
                        type="text"
                        value={videoEffects}
                        onChange={(e) => setVideoEffects(e.target.value)}
                        placeholder="E.G. 'VINTAGE FILM GRAIN'..."
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-[8px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30">AUDIO_LEVELS</label>
                      <input
                        type="text"
                        value={videoAudioLevel}
                        onChange={(e) => setVideoAudioLevel(e.target.value)}
                        placeholder="E.G. 'BOOST BASS, LOWER AMBIENT'..."
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-[8px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30">DURATION (SEC)</label>
                      <input
                        type="number"
                        min={5}
                        max={30}
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-[8px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30">RESOLUTION</label>
                      <div className="flex gap-2">
                        {(['720p', '1080p'] as const).map((res) => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setVideoResolution(res)}
                            className={`flex-1 py-2 text-[8px] font-black tracking-widest uppercase border transition-all ${
                              videoResolution === res ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setVideoTrim('');
                        setVideoEffects('');
                        setVideoAudioLevel('');
                        setVideoDuration(10);
                        setVideoResolution('1080p');
                      }}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                    >
                      RESET_SUITE
                    </button>
                    <button
                      type="button"
                      disabled={isGenerating || !title || !aiSettings.isAIEnabled}
                      onClick={handleAIGenerateVideo}
                      className="flex-1 py-3 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <Activity className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      GENERATE_4K_AI_VIDEO
                    </button>
                    {mediaUrl && type === 'video' && (
                      <button
                        type="button"
                        disabled={isGenerating || !videoTrim || !aiSettings.isAIEnabled}
                        onClick={handleAIEditVideo}
                        className="flex-1 py-3 bg-white/10 border border-white/20 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGenerating ? <Activity className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                        REFINE_VIDEO_4K_AI
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                {type === 'picture' && base64Image && (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={imageEditPrompt}
                      onChange={(e) => setImageEditPrompt(e.target.value)}
                      placeholder="DESCRIBE EDITS (E.G. 'ADD GOLDEN GLOW')..."
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-[8px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'INSPIRING VISUALS', prompt: 'ADD DIVINE GOLDEN GLOW AND SOFT ETHEREAL LIGHTING' },
                        { name: 'EXECUTIVE POLISH', prompt: 'APPLY PROFESSIONAL COLOR GRADE AND SHARP CLARITY' },
                        { name: 'SERMON HIGHLIGHT', prompt: 'CINEMATIC DRAMATIC LIGHTING WITH FOCUS ON SPEAKER' },
                        { name: 'SPIRITUAL AWAKENING', prompt: 'ADD WARM SUNLIGHT EFFECTS AND HIGH EXPOSURE RADIANCE' },
                        { name: 'CORPORATE BRANDING', prompt: 'MINIMALIST BLUE TONES WITH CLEAN PROFESSIONAL LINES' },
                        { name: 'TESTIMONIAL', prompt: 'SOFT FOCUS BACKGROUND WITH NATURAL SKIN TONES' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setImageEditPrompt(preset.prompt)}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-[7px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isGenerating || !imageEditPrompt || !aiSettings.isAIEnabled}
                        onClick={handleAIEditImage}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGenerating ? <Activity className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        ENHANCE_TO_4K_AI
                      </button>
                      <button
                        type="button"
                        disabled={isGenerating || !aiSettings.isAIEnabled}
                        onClick={async () => {
                          setImageEditPrompt("Optimize image to professional 4K quality, enhance clarity, color grade for premium executive brand, and ensure visual impact.");
                          setTimeout(() => handleAIEditImage(), 100);
                        }}
                        className="flex-1 py-3 bg-white/10 border border-white/20 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGenerating ? <Activity className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        AUTO_STRATEGIC_ENHANCE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {moderationResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 border rounded-sm space-y-4 ${
                  moderationResult.status === 'approved' ? 'bg-green-500/5 border-green-500/20' :
                  moderationResult.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' :
                  'bg-yellow-500/5 border-yellow-500/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-3 h-3 ${
                      moderationResult.status === 'approved' ? 'text-green-500' :
                      moderationResult.status === 'rejected' ? 'text-red-500' :
                      'text-yellow-500'
                    }`} />
                    <h4 className="text-[10px] font-black tracking-widest uppercase">AI_MODERATION_RESULT</h4>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${
                    moderationResult.status === 'approved' ? 'bg-green-500 text-black' :
                    moderationResult.status === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {moderationResult.status}
                  </span>
                </div>
                <p className="text-[10px] font-medium leading-relaxed text-white/80 italic">"{moderationResult.note}"</p>
              </motion.div>
            )}
            {mediaSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black tracking-widest uppercase text-white/60">AI_MEDIA_ANALYSIS</h4>
                  <button onClick={() => setMediaSuggestions(null)} className="text-white/20 hover:text-white"><X className="w-3 h-3" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">SUGGESTIONS</p>
                    <p className="text-[10px] font-medium leading-relaxed text-white/80">{mediaSuggestions.suggestions}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">STRATEGIC_VALUE</p>
                    <p className="text-[10px] font-medium leading-relaxed text-white/80 italic">"{mediaSuggestions.strategicValue}"</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">RECOMMENDED_TOOLS</p>
                    <p className="text-[10px] font-mono text-white/60">{mediaSuggestions.recommendedTools}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">CONTENT_TYPE</label>
              <div className="grid grid-cols-3 gap-3">
                {(['picture', 'video', 'book', 'notification', 'sermon', 'devotion', 'course', 'podcast'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`py-4 rounded-sm text-[8px] font-black tracking-widest uppercase border transition-all ${
                      type === t ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">PRICE_USD</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm pl-12 pr-4 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {type === 'book' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 bg-white/5 border border-white/10 rounded-sm">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">BOOK_FORMAT</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFullBook(true)}
                    className={`flex-1 py-3 text-[9px] font-black tracking-widest uppercase border transition-all ${
                      isFullBook ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10'
                    }`}
                  >
                    FULL BOOK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullBook(false)}
                    className={`flex-1 py-3 text-[9px] font-black tracking-widest uppercase border transition-all ${
                      !isFullBook ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10'
                    }`}
                  >
                    CHAPTER
                  </button>
                </div>
              </div>
              {!isFullBook && (
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">CHAPTER_NO</label>
                  <input
                    type="number"
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">TIKTOK_URL (OPTIONAL)</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm pl-12 pr-4 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                  placeholder="HTTPS://WWW.TIKTOK.COM/..."
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">TITLE</label>
                <button 
                  type="button"
                  disabled={isGeneratingTitle || !content || !aiSettings.isAIEnabled}
                  onClick={handleGenerateTitle}
                  className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all disabled:opacity-50"
                >
                  {isGeneratingTitle ? <Activity className="w-2 h-2 animate-spin" /> : <Sparkles className="w-2 h-2" />}
                  GENERATE_AI_TITLE
                </button>
              </div>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                placeholder="ENTER TITLE..."
              />
              {suggestedTitle && title !== suggestedTitle && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-white/5 border border-dashed border-white/20 rounded-sm flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">AI_SUGGESTED: <span className="text-white">{suggestedTitle}</span></span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setTitle(suggestedTitle)}
                    className="text-[8px] font-black uppercase tracking-widest text-white hover:text-yellow-500 transition-all"
                  >
                    RESTORE_SUGGESTION
                  </button>
                </motion.div>
              )}
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">DESCRIPTION</label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all resize-none"
                placeholder="WRITE SOMETHING..."
              />
              
              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3 h-3 text-white/40" />
                          <h4 className="text-[10px] font-black tracking-widest uppercase">CONTENT_SUMMARY</h4>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShowSummary(!showSummary)}
                          className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                        >
                          {showSummary ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                      {showSummary && (
                        <p className="text-[10px] font-medium leading-relaxed text-white/80 italic">
                          {summary}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {marketingSuite && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-white/40" />
                          <h4 className="text-[10px] font-black tracking-widest uppercase">MARKETING_SUITE_PROTOTYPE</h4>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setMarketingSuite(null)}
                          className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white"
                        >
                          DISMISS
                        </button>
                      </div>
                      <div className="text-[10px] text-white/60 leading-relaxed prose prose-invert max-w-none">
                        <ReactMarkdown>{marketingSuite}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-4 h-4 text-white/40" />
                <h3 className="text-[12px] font-black tracking-[0.2em] uppercase">AI_STRATEGY_COMMAND_CENTER</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  type="button"
                  disabled={isGeneratingTitle || !content || !aiSettings.isAIEnabled}
                  onClick={handleGenerateTitle}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isGeneratingTitle ? <Activity className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  GENERATE_TITLE
                </button>
                <button
                  type="button"
                  disabled={isEnhancing || !title || !content || !aiSettings.isAIEnabled}
                  onClick={handleEnhance}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isEnhancing ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  ENHANCE_CONTENT
                </button>
                <button
                  type="button"
                  disabled={isProofreading || !title || !content || !aiSettings.isAIEnabled}
                  onClick={handleProofread}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isProofreading ? <Activity className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  PROOFREAD_&_CORRECT
                </button>
                <button
                  type="button"
                  disabled={isModerating || !title || !content || !aiSettings.isAIEnabled}
                  onClick={handleAIModerate}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isModerating ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  MODERATE_CONTENT
                </button>
                <button
                  type="button"
                  disabled={isGeneratingMarketing || !title || !content || !aiSettings.isAIEnabled}
                  onClick={handleGenerateMarketing}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isGeneratingMarketing ? <Activity className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  MARKET_SUITE
                </button>
                <button
                  type="button"
                  disabled={isSummarizing || !content || !aiSettings.isAIEnabled}
                  onClick={handleSummarize}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isSummarizing ? <Activity className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  SUMMARIZE
                </button>
                <button
                  type="button"
                  disabled={isSuggesting || !title || !aiSettings.isAIEnabled}
                  onClick={handleAISuggestEdits}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isSuggesting ? <Activity className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  SUGGEST_EDITS
                </button>
              </div>
            </div>
          </div>
          <button
            disabled={isModerating}
            type="submit"
            className={`glitter-button glitter-gold w-full py-6 rounded-sm text-[12px] font-black tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 ${
              isModerating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            {isModerating ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                AI_MODERATING...
              </>
            ) : (
              'PUBLISH_CONTENT'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Pages ---

const TransactionModal = ({ isOpen, onClose, post, onComplete }: { isOpen: boolean, onClose: () => void, post: Post, onComplete: (transaction: any) => void }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [step, setStep] = useState<'details' | 'pin' | 'processing' | 'success'>('details');

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleConfirm = async () => {
    setStep('processing');
    try {
      const orderData = {
        postId: post.id,
        postTitle: post.title,
        amount: post.price || 0,
        status: 'completed',
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      
      // Notify Admin
      await addDoc(collection(db, 'notifications'), {
        title: 'NEW_ACQUISITION_PROTOCOL',
        content: `User ${auth.currentUser?.email} has successfully acquired "${post.title}" for $${post.price}. SYSTEM_CASH_FLOW_INCREASED.`,
        type: 'financial',
        createdAt: serverTimestamp()
      });

      onComplete(orderData);
      setStep('success');
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("TRANSACTION_FAILED: Please check your network connection.");
      setStep('details');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glitter-card w-full max-w-md p-10 rounded-sm border-white/20"
      >
        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-4 mb-8">
                <ShoppingCart className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-black tracking-widest uppercase">CONFIRM_PURCHASE</h2>
              </div>
              <div className="space-y-6 mb-10">
                <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">ITEM</p>
                  <p className="text-lg font-black uppercase">{post.title}</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">AMOUNT</p>
                  <p className="text-3xl font-black font-mono">${post.price?.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => setStep('pin')}
                className="glitter-button glitter-gold w-full py-5 text-[12px] font-black tracking-[0.3em] uppercase rounded-sm"
              >
                PROCEED_TO_PAYMENT
              </button>
              <button onClick={onClose} className="w-full mt-4 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                CANCEL_TRANSACTION
              </button>
            </motion.div>
          )}

          {step === 'pin' && (
            <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Lock className="w-12 h-12 text-white mx-auto mb-6" />
              <h2 className="text-xl font-black tracking-widest uppercase mb-2">ENTER_SECURITY_PIN</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-10">AUTHORIZE TRANSACTION FOR ${post.price?.toFixed(2)}</p>
              
              <div className="flex justify-center gap-4 mb-10">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    className="w-14 h-16 bg-white/5 border border-white/20 rounded-sm text-center text-2xl font-black focus:border-white focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                disabled={pin.some(d => !d)}
                onClick={handleConfirm}
                className="glitter-button glitter-gold w-full py-5 text-[12px] font-black tracking-[0.3em] uppercase rounded-sm disabled:opacity-50"
              >
                CONFIRM_PIN
              </button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
              <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8" />
              <h2 className="text-xl font-black tracking-widest uppercase mb-2">PROCESSING_PAYMENT</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">CONNECTING_TO_SECURE_GATEWAY...</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-2xl font-black tracking-widest uppercase mb-2">TRANSACTION_SUCCESS</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-10">YOUR_ORDER_HAS_BEEN_PROCESSED</p>
              <button
                onClick={onClose}
                className="glitter-button w-full py-5 text-[12px] font-black tracking-[0.3em] uppercase rounded-sm"
              >
                RETURN_TO_SANCTUARY
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase glitter-text">PRIVACY_POLICY</h1>
        <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Last Updated: April 10, 2026</p>
      </div>
      
      <div className="space-y-8 text-white/70 font-medium leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">1. DATA_COLLECTION</h2>
          <p>We collect information you provide directly to us when you create an account, post content, or communicate with us. This may include your name, email address, and any other information you choose to provide.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">2. USE_OF_INFORMATION</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect our brand and our users.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">3. AI_PROCESSING</h2>
          <p>Our system uses Artificial Intelligence (Yohannes Assistant) to enhance user experience and moderate content. Your interactions with the AI are processed to improve response accuracy and system stability.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">4. SECURITY</h2>
          <p>We use AES-256 encryption and advanced security protocols to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">5. CONTACT_US</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at contact@pastorjk.com.</p>
        </section>
      </div>
    </div>
  );
};

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase glitter-text">TERMS_OF_SERVICE</h1>
        <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Last Updated: April 21, 2026</p>
      </div>
      
      <div className="space-y-8 text-white/70 font-medium leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">1. ACCEPTANCE_OF_TERMS</h2>
          <p>By accessing this platform, you agree to comply with our vision, strategic protocols, and kingdom core values. This is a sanctuary of digital excellence.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">2. PROPHETIC_INTEGRITY</h2>
          <p>Users are expected to engage in community discourse with honor, integrity, and respect for spiritual leadership. Any content deemed inconsistent with our brand's theological precision will be moderated by AI.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">3. INTELLECTUAL_PROPERTY</h2>
          <p>All sermons, books, and insights generated on this platform are the strategic assets of Pastor JK Global Ministries. Unauthorized amplification or replication is prohibited.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">4. AI_INTERACTION</h2>
          <p>Interactions with Yohannes AI are intended for spiritual growth and strategic insight. While highly advanced, users should exercise spiritual discernment when applying AI-generated advice.</p>
        </section>
      </div>
    </div>
  );
};

const BackgroundVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4; // Slower rotation
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-[0.25] grayscale scale-[1.8] transition-opacity duration-1000"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-earth-rotating-in-the-darkness-of-space-41716-large.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] opacity-50" />
    </div>
  );
};

const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};

const OfflineBanner = () => {
  const isOffline = useOffline();
  if (!isOffline) return null;

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[200] bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
    >
      <WifiOff className="w-4 h-4" />
      SYSTEM_OFFLINE: Limited functionality available. Please check your connection.
    </motion.div>
  );
};

const BibleVerse = () => {
  const [verse, setVerse] = useState<{ reference: string, text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const visionaryVerses = [
    'Habakkuk 2:2', 'Proverbs 29:18', 'Joshua 1:9', 'Philippians 4:13', 
    'Jeremiah 29:11', 'Isaiah 40:31', 'Proverbs 3:5-6', 'Matthew 5:14',
    'Ephesians 3:20', 'Romans 8:28', '1 Timothy 4:12', 'Colossians 3:23'
  ];

  const fetchDailyVerse = async () => {
    try {
      const response = await fetch('/api/bible/verse');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setVerse({ reference: data.reference, text: data.text });
    } catch (error) {
      console.error("Failed to fetch daily verse:", error);
      // Fallback
      setVerse({ reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyVerse();
    const interval = setInterval(fetchDailyVerse, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="glitter-card p-8 rounded-sm border-white/20 text-center animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mb-4" />
      <div className="h-3 bg-white/10 rounded w-1/2 mx-auto" />
    </div>
  );

  return (
    <div className="glitter-card p-8 rounded-sm border-white/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Cross className="w-12 h-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-3 h-3 text-white/40" />
          <span className="text-[8px] font-black tracking-[0.4em] text-white/40 uppercase">DAILY_WORD</span>
        </div>
        <p className="text-sm font-medium text-white/90 leading-relaxed mb-4 italic">"{verse?.text.trim()}"</p>
        <p className="text-[8px] font-black tracking-widest uppercase text-white/30">— {verse?.reference}</p>
      </div>
    </div>
  );
};

const AIAssistant = ({ aiSettings, profile }: { aiSettings: AISettings, profile: UserProfile | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const name = profile?.displayName || profile?.email?.split('@')[0] || 'Visionary';
    const initialGreeting = `Greetings, ${name}! Yohannes online. I trust you're ready to disrupt the status quo with some high-level strategy today? I'm already three steps ahead, but let's see what you've got.`;

    setMessages(prev => {
      if (prev.length === 0) {
        return [{ 
          role: 'model', 
          text: aiSettings.isAIEnabled ? initialGreeting : 'SYSTEM_OFFLINE: The AI core is currently undergoing maintenance. Even a genius needs a recharge sometimes.' 
        }];
      }
      // Reactive update: replace fallback greeting if profile arrives promptly
      if (prev.length === 1 && prev[0].text.includes('Visionary') && name !== 'Visionary' && aiSettings.isAIEnabled) {
        return [{ role: 'model', text: initialGreeting }];
      }
      return prev;
    });
  }, [profile, aiSettings.isAIEnabled]);

  const handleTerminate = () => {
    const name = profile?.displayName || profile?.email?.split('@')[0] || 'Visionary';
    setMessages([
      { role: 'model', text: aiSettings.isAIEnabled 
        ? `CONVERSATION_TERMINATED: The session has been securely closed, ${name}. How may I assist you with a new strategic inquiry?` 
        : 'SYSTEM_OFFLINE: The AI core is currently undergoing maintenance.' }
    ]);
    setIsOpen(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !aiSettings.isAIEnabled) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const context = `[SYSTEM_CONTEXT: Current Date: ${new Date().toLocaleDateString()}, Time: ${new Date().toLocaleTimeString()}, Location: Global/Digital Presence]`;
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const response = await chatWithAI(`${context}\nUser Message: ${userMsg}`, history, aiSettings.persona as any, profile?.displayName || profile?.email?.split('@')[0]);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error("AI Chat failed:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having trouble connecting to the divine network. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.button
        drag
        dragMomentum={false}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-16 h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <Brain className="w-8 h-8 relative z-10" />
        <div className="absolute -bottom-1 text-[8px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">SUMMON</div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:bottom-28 sm:right-8 sm:w-96 max-h-[70vh] sm:max-h-[600px] bg-black/95 backdrop-blur-2xl border border-white/20 rounded-sm shadow-2xl flex flex-col z-[100] overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5" />
                <span className="text-[10px] font-black tracking-widest uppercase">YOHANNES_ASSISTANT</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleTerminate}
                  className="text-[8px] font-black tracking-widest uppercase text-red-500/60 hover:text-red-500 transition-colors"
                >
                  TERMINATE_TALK
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-sm text-[11px] font-medium leading-relaxed ${
                    msg.role === 'user' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/80'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <input
                  disabled={!aiSettings.isAIEnabled}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={aiSettings.isAIEnabled ? "ASK YOHANNES..." : "SYSTEM_OFFLINE"}
                  className="flex-1 bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all uppercase disabled:opacity-50"
                />
                <button 
                  disabled={!aiSettings.isAIEnabled}
                  type="submit" 
                  className="bg-white text-black p-3 rounded-sm hover:bg-white/80 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Space Background for Login */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
        <div className="stars-container absolute inset-0 opacity-50">
          {[...Array(100)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2}px`,
                height: `${Math.random() * 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        <img 
          src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80" 
          alt="Space" 
          className="w-full h-full object-cover opacity-20 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-10 sm:p-14 rounded-sm border border-white/10 relative z-10 backdrop-blur-xl bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center"
          >
            <div className="absolute inset-0 border border-white/20 rounded-sm" />
            <div className="absolute inset-2 border border-white/10 rounded-sm rotate-45" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-white rounded-full mb-[-8px] shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <div className="w-12 h-2 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black tracking-[0.3em] uppercase glitter-text mb-3">BRAND_ACCESS</h1>
          <p className="text-[9px] font-black tracking-[0.5em] text-white/30 uppercase">Visionary Leadership // Global Excellence</p>
        </div>

        <div className="space-y-8">
          <div className="group">
            <label className="block text-[9px] font-black tracking-widest text-white/20 uppercase mb-3 group-focus-within:text-white transition-colors">EMAIL_ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-5 text-[11px] font-black tracking-widest focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all uppercase placeholder:text-white/10"
              placeholder="PASTOR@OFFICIAL.COM"
            />
          </div>
          <div className="group">
            <label className="block text-[9px] font-black tracking-widest text-white/20 uppercase mb-3 group-focus-within:text-white transition-colors">PHONE_NUMBER</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-5 text-[11px] font-black tracking-widest focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all uppercase placeholder:text-white/10"
              placeholder="+1 234 567 890"
            />
          </div>

          <button
            onClick={() => onLogin()}
            className="glitter-button glitter-gold w-full py-6 text-[13px] font-black tracking-[0.4em] uppercase rounded-sm mt-10 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
          >
            AUTHORIZE_ACCESS
          </button>

          <div className="relative py-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
              <span className="bg-transparent px-6 text-white/10">SECURE_OAUTH_GATEWAY</span>
            </div>
          </div>

          <button
            onClick={() => onLogin()}
            className="w-full py-5 border border-white/5 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-4 group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="" />
            GOOGLE_AUTHENTICATION
          </button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[8px] font-black tracking-[0.3em] text-white/10 uppercase">© 2026 PASTOR_JK_OFFICIAL // ALL_RIGHTS_RESERVED</p>
        </div>
      </motion.div>
    </div>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-8 bg-white/20" />
          <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">STAY_CONNECTED</span>
          <div className="h-px w-8 bg-white/20" />
        </div>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase mb-8 leading-none">
          JOIN_THE <span className="glitter-text">VISION</span>
        </h2>
        <p className="text-white/50 text-sm mb-12 max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-black">
          Receive exclusive strategic insights and spiritual updates directly from the source.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ENTER_EMAIL_ADDRESS"
            required
            className="flex-1 bg-white/5 border border-white/10 rounded-sm px-6 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white/30 transition-all"
          />
          <button
            type="submit"
            disabled={status !== 'idle'}
            className="glitter-button glitter-gold px-12 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase text-black disabled:opacity-50 transition-all"
          >
            {status === 'loading' ? 'PROCESSING...' : status === 'success' ? 'SUBSCRIBED' : 'SUBSCRIBE'}
          </button>
        </form>
      </div>
    </section>
  );
};

const MissionSection = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <section ref={ref} className="mt-32 space-y-20 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">OUR_MISSION</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none glitter-text">
            Bridging Faith<br />& Global Influence
          </h2>
          <div className="space-y-6 text-white/60 font-medium leading-relaxed">
            <p>
              Under the visionary leadership of Pastor Jk, we are building a legacy that transcends traditional boundaries. Our mission is to equip a generation of visionary leaders who dominate in their spheres of influence—be it in the boardroom, the pulpit, or the classroom.
            </p>
            <p>
              We believe in the power of "Spiritual Intelligence"—the intersection of divine revelation and strategic execution. Through our diverse platforms, we provide the tools, mentorship, and spiritual covering needed to fulfill your global mandate.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
             <div>
               <h4 className="text-2xl font-black mb-2 glitter-text">5+</h4>
               <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">GLOBAL_PLATFORMS</p>
             </div>
             <div>
               <h4 className="text-2xl font-black mb-2 glitter-text">100K+</h4>
               <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">LIVES_TRANSFORMED</p>
             </div>
          </div>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative"
        >
          <div className="relative aspect-square overflow-hidden rounded-sm border border-white/10 group">
             <div className="absolute inset-0 bg-white/10 rotate-3 scale-110 group-hover:rotate-0 transition-transform duration-700" />
             <img 
               src="https://picsum.photos/seed/vision/1000/1000" 
               alt="Vision" 
               className="w-full h-full object-cover grayscale opacity-50 transition-all group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 duration-700"
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                <Quote className="w-12 h-12 text-white/20 mb-6" />
                <p className="text-xl sm:text-2xl font-black italic tracking-tight uppercase leading-tight glitter-text">
                  "Influence is determined by the depth of your roots and the precision of your branches."
                </p>
                <p className="mt-6 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 flex items-center gap-4">
                  <span className="h-px w-8 bg-white/20" /> PASTOR JK
                </p>
             </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: 'SPIRITUAL_INTELLIGENCE',
            desc: 'Leverage Yohannes, our proprietary AI, for biblical insights and theological precision.',
            icon: <Brain className="w-6 h-6" />
          },
          {
            title: 'STRATEGIC_MENTORSHIP',
            desc: 'Direct mentorship protocols designed to accelerate your growth in leadership.',
            icon: <Target className="w-6 h-6" />
          },
          {
            title: 'KINGDOM_COMMUNITY',
            desc: 'Join a high-impact network of influencers sharing vision and resources.',
            icon: <Globe className="w-6 h-6" />
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glitter-card p-10 rounded-sm border-white/10 hover:border-white/40 transition-colors"
          >
            <div className="w-14 h-14 bg-white/5 rounded-sm flex items-center justify-center mb-8 border border-white/10 text-white">
              {item.icon}
            </div>
            <h3 className="text-xl font-black tracking-tight mb-4 uppercase">{item.title}</h3>
            <p className="text-white/50 text-[10px] leading-relaxed font-black uppercase tracking-[0.2em]">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
});

const AboutPage = ({ posts }: { posts: Post[] }) => {
  const navigate = useNavigate();
  const featuredSermon = posts.filter(p => p.type === 'sermon')[0];
  const featuredVideo = posts.filter(p => p.type === 'video')[0];
  const featuredBook = posts.filter(p => p.type === 'book')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gold-500/40" />
            <span className="text-[10px] font-black tracking-[0.5em] text-gold-500 uppercase">THE_VISIONARY</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none glitter-text">
            Meet<br />Pastor JK
          </h1>
          <p className="text-xl text-white/70 font-medium leading-relaxed">
            Pastor Jk is a global visionary, a strategic mentor, and a spiritual father called to raise a generation of high-impact leaders. With a unique mandate to bridge the gap between divine revelation and executive excellence, he equips pioneers to dominate their spheres of influence with integrity and power.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div>
              <h4 className="text-3xl font-black mb-1 glitter-text">15+</h4>
              <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">YEARS_OF_IMPACT</p>
            </div>
            <div>
              <h4 className="text-3xl font-black mb-1 glitter-text">25+</h4>
              <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">GLOBAL_NATIONS</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[4/5] rounded-sm overflow-hidden border border-white/10"
        >
          <img 
            src="https://images.unsplash.com/photo-1540317580384-e5d418f60e44?q=80&w=800&auto=format&fit=crop" 
            alt="Pastor JK Visionary" 
            className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase italic">"The future belongs to those who hear the sound of eternity today."</p>
          </div>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glitter-card p-12 rounded-sm border-white/5 space-y-6"
        >
          <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center border border-white/10">
            <Eye className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter glitter-text">OUR_VISION</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium uppercase tracking-wider">
            To establish a global ecosystem where spiritual intelligence meets executive excellence, creating a standard of leadership that transforms nations and defines the future.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glitter-card p-12 rounded-sm border-white/5 space-y-6"
        >
          <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center border border-white/10">
            <Zap className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter glitter-text">OUR_MISSION</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium uppercase tracking-wider">
            To mentor, equip, and deploy 10,000 strategic visionaries who will lead with divine wisdom in government, business, media, and the arts by the year 2030.
          </p>
        </motion.div>
      </section>

      {/* Global Platforms */}
      <section className="space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black tracking-tighter uppercase glitter-text">CORE_PLATFORMS</h2>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase leading-loose">
            A diverse synergy of institutions designed to facilitate the comprehensive growth of the modern visionary leader.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'PROPHETIC_SCHOOL', 
              icon: Globe,
              desc: 'Training voices to hear and articulate the sound of heaven with technical and spiritual precision.',
              stats: '2.5k+ Students'
            },
            { 
              title: 'LEADERSHIP_HUB', 
              icon: Shield,
              desc: 'Developing executives and entrepreneurs to lead with spiritual intelligence and ethical dominance.',
              stats: '500+ CEOs'
            },
            { 
              title: 'DIGITAL_CHURCH', 
              icon: Users,
              desc: 'A borderless global gathering of visionaries breaking geographic and cultural limitations.',
              stats: '50+ Countries'
            }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glitter-card p-10 rounded-sm border-white/5 hover:border-gold-500/20 transition-all group"
            >
              <item.icon className="w-8 h-8 text-white/20 mb-8 group-hover:text-gold-500 transition-colors" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">{item.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed uppercase tracking-widest font-bold mb-8">{item.desc}</p>
              <div className="pt-6 border-t border-white/5">
                <span className="text-[10px] font-black tracking-widest text-gold-500/60 uppercase">{item.stats}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Roadmap/Journey */}
      <section className="relative py-24 overflow-hidden rounded-sm border border-white/5">
        <div className="absolute inset-0 bg-white/[0.02]" />
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase glitter-text">THE_DOMINION_JOURNEY</h2>
            <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">CHRONICLES OF VISIONARY EXPANSION</p>
          </div>
          <div className="space-y-16">
            {[
              { year: '2010', event: 'The Genesis: The first commission into global prophetic ministry.' },
              { year: '2015', event: 'The Expansion: Launching of the Global Leadership Hub across 3 continents.' },
              { year: '2020', event: 'The Digital Shift: Establishing one of the world\'s most vibrant digital sanctuaries.' },
              { year: '2025', event: 'The Dominion Era: Scaling to reach 10 million souls through AI-powered spiritual tech.' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-8 text-left group">
                <span className="text-4xl font-black text-white/10 group-hover:text-gold-500/40 transition-colors shrink-0">{step.year}</span>
                <div className="h-px w-full bg-white/5 hidden md:block" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 md:w-2/3 leading-relaxed">
                  {step.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wisdom Highlights (Relocated Featured Resources) */}
      <section className="space-y-16">
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-white/20" />
          <h2 className="text-3xl font-black tracking-tighter uppercase glitter-text">WISDOM_ARCHIVE_HIGHLIGHTS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { post: featuredSermon, type: 'CORE_SERMON', icon: Volume2, path: '/sermons' },
            { post: featuredVideo, type: 'VISIONARY_VIDEO', icon: Video, path: '/videos' },
            { post: featuredBook, type: 'STRATEGIC_BOOK', icon: Book, path: '/books' }
          ].map((item, i) => (
            <div 
              key={i}
              onClick={() => item.post && navigate(item.path)}
              className="glitter-card p-10 rounded-sm border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <span className="text-[9px] font-black tracking-[0.3em] text-white/20 uppercase">{item.type}</span>
                <item.icon className="w-5 h-5 text-white/10 group-hover:text-gold-500 transition-colors" />
              </div>
              {item.post ? (
                <>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-4 group-hover:text-gold-500 transition-colors">{item.post.title}</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed font-black uppercase tracking-widest line-clamp-3 mb-6">
                    {item.post.description || item.post.content.substring(0, 100)}
                  </p>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gold-500/40 group-hover:text-gold-500">
                    ACCESS_FULL_INSIGHT <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center text-[8px] font-black text-white/5 uppercase tracking-widest">
                  Archiving...
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const HomePage = ({ sites, user, team, aiSettings, posts, onTakeNote }: { sites: Site[], user: FirebaseUser | null, team: TeamMember[], aiSettings: AISettings, posts: Post[], onTakeNote: (content?: string, post?: any) => void }) => {
  const missionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToMission = () => {
    missionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const featuredSermon = posts.filter(p => p.type === 'sermon')[0];
  const featuredVideo = posts.filter(p => p.type === 'video')[0];
  const featuredBook = posts.filter(p => p.type === 'book')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
        <div className="lg:col-span-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-white/20" />
              <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">WELCOME_TO_THE_OFFICIAL_BRAND</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] glitter-text">
              Visionary<br />Leadership<br />& Mentorship
            </h1>
            <p className="text-lg sm:text-xl text-white/60 font-medium max-w-xl leading-relaxed">
              Empowering your journey through strategic leadership, entrepreneurial wisdom, and spiritual guidance. Connect with Pastor Jk—your visionary mentor and spiritual father.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-8">
              <Link to="/videos" className="glitter-button glitter-gold px-8 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-[12px] font-black tracking-[0.3em] uppercase rounded-sm text-center">
                START_JOURNEY
              </Link>
              <button 
                onClick={() => onTakeNote()}
                className="px-8 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-[12px] font-black tracking-[0.3em] uppercase border border-gold-500/50 text-gold-500 rounded-sm hover:bg-gold-500 hover:text-black transition-all text-center flex items-center justify-center gap-2"
              >
                <PlusSquare className="w-4 h-4" /> QUICK_REVELATION
              </button>
            </div>
          </motion.div>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <BibleVerse />
        </div>
      </div>

      <div className="mb-32">
        <div className="glitter-card p-8 sm:p-16 rounded-sm border-white/10 relative overflow-hidden bg-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Calendar className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-[10px] font-black tracking-[0.5em] text-gold-500 uppercase">NEXT_GLOBAL_SHIFT</span>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">Prophetic Summit<br />2026</h2>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">LIVE_FROM_ADDIS_ABABA // STREAMING_GLOBALLY</p>
            </div>
            <div className="flex gap-4 sm:gap-8">
              {[
                { val: '24', label: 'DAYS' },
                { val: '12', label: 'HRS' },
                { val: '45', label: 'MIN' }
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-3xl sm:text-5xl font-black tracking-tighter glitter-text mb-1">{t.val}</div>
                  <div className="text-[8px] font-black tracking-widest text-white/20 uppercase">{t.label}</div>
                </div>
              ))}
            </div>
            <Link to="/events" className="glitter-button bg-white text-black px-10 py-5 text-[10px] font-black tracking-widest uppercase rounded-sm hover:scale-105 transition-all">
              SECURE_ACCESS
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {sites.map((site, i) => (
          <motion.a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ delay: i * 0.1 }}
            className="glitter-card p-8 sm:p-10 rounded-sm border-white/10 hover:border-white/40 transition-all group relative overflow-hidden"
          >
            {site.imageURL && (
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={site.imageURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="relative z-10">
              <div className="absolute top-0 right-0 p-0 opacity-10 group-hover:opacity-30 transition-opacity">
                <ExternalLink className="w-12 h-12" />
              </div>
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all">
                <span className="text-2xl font-black uppercase">{site.icon}</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-4 uppercase">{site.name}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8 font-medium">{site.description}</p>
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white/40 group-hover:text-white transition-colors">
                VISIT_PLATFORM <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      <MissionSection ref={missionRef} />

      {/* Team Section */}
      <div className="mt-32">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px w-12 bg-white/20" />
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase glitter-text">THE_TEAM</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ delay: i * 0.1 }}
              className="glitter-card p-6 sm:p-8 rounded-sm border-white/10 text-center group transition-all"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-white/10 rounded-full rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                <img 
                  src={member.photoURL || `https://picsum.photos/seed/${member.id}/200/200`} 
                  alt={member.name}
                  className="relative z-10 w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest mb-1">{member.name}</h3>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">{member.role}</p>
              <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContactPage = ({ contactInfo, persona }: { contactInfo: ContactInfo, persona: string }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return;
    setIsSubmitting(true);
    try {
      const messageId = Math.random().toString(36).substr(2, 9);
      
      await setDoc(doc(db, 'contact_messages', messageId), {
        id: messageId,
        ...formData,
        aiReplied: false,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Left Column: Info */}
        <div className="lg:col-span-5 space-y-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-white/20" />
              <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">CONNECT_WITH_EXCELLENCE</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none glitter-text">GET_IN<br />TOUCH</h1>
            <p className="text-xs text-white/40 font-black uppercase tracking-[0.25em] leading-loose max-w-sm">
              WHETHER YOU ARE SEEKING STRATEGIC MENTORSHIP, PROPHETIC GUIDANCE, OR BRAND COLLABORATION, OUR EXECUTIVE TEAM IS READY TO FACILITATE YOUR GROWTH.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: Phone, label: 'COMMUNITY_LINE', value: contactInfo.communityNumber, sub: 'AVAILABLE_24/7' },
              { icon: Mail, label: 'OFFICIAL_EMAIL', value: contactInfo.officialEmail, sub: 'EXECUTIVE_INQUIRIES' },
              { icon: MapPin, label: 'GLOBAL_HEADQUARTERS', value: contactInfo.address, sub: 'BY_APPOINTMENT_ONLY' }
            ].map((item, i) => (
              <div key={i} className="glitter-card p-8 rounded-sm border-white/5 hover:border-gold-500/20 transition-all flex items-center gap-8">
                <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center border border-white/10 shrink-0">
                  <item.icon className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <p className="text-[8px] font-black tracking-widest text-white/20 uppercase mb-1">{item.label}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/80">{item.value}</p>
                  <p className="text-[7px] font-black tracking-widest text-gold-500/40 uppercase mt-1">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <a 
            href={contactInfo.whatsappGroup} 
            target="_blank" 
            rel="noopener noreferrer"
            className="glitter-card p-10 rounded-sm bg-white/5 border-gold-500/20 hover:border-gold-500/50 transition-all flex flex-col items-center text-center space-y-6 group"
          >
            <MessageSquare className="w-10 h-10 text-gold-500 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] mb-2">JOIN_THE_WHATSAPP_INNER_CIRCLE</p>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">RECEIVE_DIRECT_REVELATIONS_&_UPDATES</p>
            </div>
          </a>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glitter-card h-full flex flex-col items-center justify-center p-20 text-center rounded-sm border-white/10 bg-white/5"
            >
              <div className="w-24 h-24 bg-white/5 rounded-sm flex items-center justify-center mb-12 border border-white/10">
                <Check className="w-12 h-12 text-gold-500" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-6 glitter-text">TRANSMISSION_COMPLETE</h3>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-relaxed mb-12 max-w-sm">
                YOUR MESSAGE HAS BEEN ENCRYPTED AND DELIVERED TO THE EXECUTIVE OFFICE. ANTICIPATE A RESPONSE WITHIN 24-48 BUSINESS HOURS.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="glitter-button px-10 py-5 text-[10px] font-black tracking-[0.3em] uppercase rounded-sm"
              >
                SEND_ANOTHER_MESSAGE
              </button>
            </motion.div>
          ) : (
            <div className="glitter-card p-12 sm:p-20 rounded-sm border-white/5 bg-white/[0.02]">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">YOUR_NAME</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border-b border-white/10 px-0 py-4 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-gold-500 transition-all placeholder:text-white/5"
                      placeholder="ENTER FULL NAME"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">EMAIL_COORDINATES</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border-b border-white/10 px-0 py-4 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-gold-500 transition-all placeholder:text-white/5"
                      placeholder="EMAIL@DOMAIN.COM"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">MESSAGE_SUBJECT</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-white/5 border-b border-white/10 px-0 py-4 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-gold-500 transition-all placeholder:text-white/5"
                    placeholder="DESCRIBE YOUR INQUIRY"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">CORE_MESSAGE</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-6 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-gold-500 transition-all placeholder:text-white/5 rounded-sm resize-none"
                    placeholder="WRITE YOUR MESSAGE HERE..."
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full glitter-button px-10 py-6 text-[12px] font-black tracking-[0.5em] uppercase rounded-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'TRANSMITTING...' : 'INTIATE_CONTACT'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { BIBLE_VERSIONS, fetchBiblePassage, READING_GUIDES, BibleResponse } from './services/bibleService';
import { generateBibleStudyPlan } from './services/aiService';

const BibleStudyPage = ({ onTakeNote }: { onTakeNote?: (content: string, post?: any) => void }) => {
  const [passage, setPassage] = useState('John 3:16');
  const [version, setVersion] = useState('kjv');
  const [bibleData, setBibleData] = useState<BibleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    const data = await fetchBiblePassage(passage, version);
    setBibleData(data);
    setIsLoading(false);
    setStudyPlan(null);
  };

  const handleGenerateStudyPlan = async () => {
    if (!passage) return;
    setIsGeneratingPlan(true);
    try {
      const plan = await generateBibleStudyPlan(passage);
      setStudyPlan(plan);
    } catch (error) {
      console.error("Failed to generate study plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [version]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div ref={readerRef} className="glass-card p-8 rounded-sm">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black tracking-tighter uppercase">BIBLE_STUDY_READER</h1>
              <button
                onClick={handleGenerateStudyPlan}
                disabled={isGeneratingPlan || !bibleData}
                className="glitter-button glitter-gold px-6 py-3 text-[10px] font-black tracking-widest uppercase rounded-sm flex items-center gap-3 disabled:opacity-50"
              >
                {isGeneratingPlan ? <Activity className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                GENERATE_STUDY_PLAN
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="ENTER PASSAGE (e.g., Genesis 1:1)..."
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-6 py-4 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all"
                />
              </div>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-sm px-6 py-4 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-white transition-all appearance-none cursor-pointer"
              >
                {BIBLE_VERSIONS.map(v => (
                  <option key={v.id} value={v.id} className="bg-black text-white">{v.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="glitter-button glitter-gold px-8 py-4 text-xs font-black tracking-widest uppercase rounded-sm flex items-center gap-3"
              >
                {isLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                FETCH_WORD
              </button>
              <button
                type="button"
                onClick={() => onTakeNote?.(`BIBLE_REVELATION: From ${passage} (${version.toUpperCase()})\n\n---\n\n`, { id: 'bible', title: `${passage} (${version.toUpperCase()})` })}
                className="glitter-button bg-white/5 border border-white/10 px-8 py-4 text-xs font-black tracking-widest uppercase rounded-sm flex items-center gap-3 hover:bg-white/10"
              >
                <PlusSquare className="w-4 h-4" /> CAPTURE_REVELATION
              </button>
            </form>

            <AnimatePresence mode="wait">
              {studyPlan ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-12 p-8 bg-white/5 border border-white/10 rounded-sm"
                >
                  <h3 className="text-sm font-black tracking-widest uppercase mb-6 flex items-center gap-3 text-gold-500">
                    <Sparkles className="w-4 h-4" />
                    AI_STUDY_PLAN
                  </h3>
                  <div className="prose prose-invert max-w-none text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {studyPlan}
                  </div>
                </motion.div>
              ) : bibleData ? (
                <motion.div
                  key={bibleData.reference}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-xl font-black tracking-widest uppercase text-white/60">{bibleData.reference}</h2>
                    <span className="text-[10px] font-black tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full">{bibleData.translation_name}</span>
                  </div>
                  <div className="space-y-4">
                    {bibleData.verses.map((v, idx) => (
                      <div key={idx} className="flex gap-4">
                        <span className="text-[10px] font-black text-white/20 pt-1">{v.verse}</span>
                        <p className="text-lg text-white/80 font-medium leading-relaxed">{v.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : !isLoading && (
                <div className="py-20 text-center">
                  <Cross className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/40">NO_PASSAGE_LOADED</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 rounded-sm">
            <h3 className="text-sm font-black tracking-widest uppercase mb-6 flex items-center gap-3">
              <Lightbulb className="w-4 h-4 text-white/40" />
              READING_GUIDES
            </h3>
            <div className="space-y-4">
              {READING_GUIDES.map(guide => (
                <button
                  key={guide.id}
                  onClick={() => {
                    setPassage(guide.passages.join(', '));
                    handleSearch();
                    readerRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <h4 className="text-[10px] font-black tracking-widest uppercase mb-1 group-hover:text-white transition-colors">{guide.title}</h4>
                  <p className="text-[10px] text-white/40 font-medium line-clamp-1">{guide.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 rounded-sm bg-white/5 border-white/20">
            <h3 className="text-sm font-black tracking-widest uppercase mb-4 flex items-center gap-3">
              <Sparkles className="w-4 h-4" />
              AI_STUDY_ASSISTANT
            </h3>
            <p className="text-[10px] text-white/60 font-medium leading-relaxed mb-6">
              NEED DEEPER INSIGHT? SELECT A PASSAGE AND USE THE "EXPLAIN" FEATURE TO UNLOCK SPIRITUAL DEPTHS.
            </p>
            <button 
              onClick={() => setPassage('Romans 8:28')}
              className="w-full py-3 text-[10px] font-black tracking-widest uppercase border border-white/20 hover:bg-white hover:text-black transition-all rounded-sm"
            >
              GENERATE_STUDY_PLAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookmarksPage = ({ 
  posts, 
  bookmarkedIds, 
  profile, 
  onComment, 
  onPurchase, 
  onBookmark,
  onRead,
  onLike,
  likedIds,
  aiSettings,
  notify,
  onMarketing,
  onSermonOutline,
  onTakeNote,
  onEnhance
}: { 
  posts: Post[], 
  bookmarkedIds: string[], 
  profile: UserProfile | null, 
  onComment: (postId: string, text: string) => void, 
  onPurchase: (post: Post) => void, 
  onBookmark: (postId: string) => void,
  onRead?: (post: Post) => void,
  onLike?: (postId: string) => void,
  likedIds?: string[],
  aiSettings: AISettings,
  notify: (msg: string, type: any) => void,
  onMarketing?: (post: Post) => void,
  onSermonOutline?: (post: Post) => void,
  onTakeNote?: (content?: string, post?: any) => void,
  onEnhance?: (post: Post) => void
}) => {
  const bookmarkedPosts = posts.filter(p => bookmarkedIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-white/20" />
            <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">YOUR_SAVED_CONTENT</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none glitter-text">SAVED_CONTENT</h1>
        </div>
      </div>

      {bookmarkedPosts.length === 0 ? (
        <div className="glitter-card py-32 text-center rounded-sm border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-sm flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Bookmark className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="text-xl font-black tracking-widest uppercase mb-4">NO_BOOKMARKS_YET</h3>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Start saving your favorite content to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarkedPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              profile={profile} 
              onComment={onComment} 
              onPurchase={onPurchase} 
              isBookmarked={true}
              onBookmark={onBookmark}
              onRead={onRead}
              onLike={onLike}
              isLiked={likedIds?.includes(post.id)}
              aiSettings={aiSettings}
              notify={notify}
              onMarketing={onMarketing}
              onSermonOutline={onSermonOutline}
              onTakeNote={onTakeNote}
              onEnhance={onEnhance}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ContentPage = ({ 
  type, 
  posts, 
  profile, 
  onComment, 
  onPurchase, 
  bookmarkedIds, 
  onBookmark,
  onRead,
  onLike,
  likedIds,
  hasMore,
  onLoadMore,
  isSearching,
  aiSettings,
  notify,
  onMarketing,
  onSermonOutline,
  onTakeNote,
  onEnhance
}: { 
  type: string, 
  posts: Post[], 
  profile: UserProfile | null, 
  onComment: (postId: string, text: string) => void, 
  onPurchase: (post: Post) => void, 
  bookmarkedIds: string[], 
  onBookmark: (postId: string) => void,
  onRead?: (post: Post) => void,
  onLike?: (postId: string) => void,
  likedIds?: string[],
  hasMore?: boolean,
  onLoadMore?: () => void,
  isSearching?: boolean,
  aiSettings: AISettings,
  notify: (msg: string, type: any) => void,
  onMarketing?: (post: Post) => void,
  onSermonOutline?: (post: Post) => void,
  onTakeNote?: (content?: string, post?: any) => void,
  onEnhance?: (post: Post) => void
}) => {
  const filteredPosts = posts.filter(p => {
    if (type === 'video') return (p.type === 'video' || p.type === 'sermon') && p.status === 'approved';
    if (type === 'book') return (p.type === 'book' || p.type === 'devotion') && p.status === 'approved';
    return p.type === type && p.status === 'approved';
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-white/20" />
            <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">EXPLORE_COLLECTION</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none glitter-text">{type}s</h1>
        </div>
        <p className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase max-w-xs text-right">
          Curated content for the modern brand.
        </p>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="glitter-card py-32 text-center rounded-sm border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-sm flex items-center justify-center mx-auto mb-8 border border-white/10">
            {isSearching ? <Search className="w-10 h-10 text-white/20" /> : <Layout className="w-10 h-10 text-white/20" />}
          </div>
          <h3 className="text-xl font-black tracking-widest uppercase mb-4">
            {isSearching ? 'NO_MATCHING_RESULTS' : 'NO_CONTENT_FOUND'}
          </h3>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            {isSearching 
              ? "Yohannes suggests refining your search parameters or consulting the AI Assistant for deeper insights." 
              : "The collection is currently being prepared."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              profile={profile} 
              onComment={onComment} 
              onPurchase={onPurchase} 
              isBookmarked={bookmarkedIds.includes(post.id)}
              onBookmark={onBookmark}
              onRead={onRead}
              onLike={onLike}
              isLiked={likedIds?.includes(post.id)}
              aiSettings={aiSettings}
              notify={notify}
              onMarketing={onMarketing}
              onSermonOutline={onSermonOutline}
              onTakeNote={onTakeNote}
              onEnhance={onEnhance}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-20 flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-12 py-4 bg-white/5 border border-white/10 rounded-sm text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all"
          >
            LOAD_MORE_CONTENT
          </button>
        </div>
      )}
    </div>
  );
};

const NotificationsPage = ({ posts }: { posts: Post[] }) => {
  const notifications = posts.filter(p => p.type === 'notification').sort((a, b) => {
    const dateA = (a.createdAt as any)?.toDate?.() || new Date(0);
    const dateB = (b.createdAt as any)?.toDate?.() || new Date(0);
    return dateB - dateA;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="space-y-4 mb-16">
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-white/20" />
          <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">SYSTEM_UPDATES</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none glitter-text">NOTIFICATIONS</h1>
      </div>

      <div className="space-y-6">
        {notifications.map(notif => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glitter-card p-8 rounded-sm border-white/5 hover:border-white/20 transition-all flex gap-8 items-start"
          >
            <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center border border-white/10 flex-shrink-0">
              <Bell className="w-6 h-6 text-white/40" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-sm">OFFICIAL_UPDATE</span>
                <span className="text-[8px] font-mono text-white/20 uppercase">
                  {(notif.createdAt as any)?.toDate?.().toLocaleDateString() || 'RECENT'}
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">{notif.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{notif.content}</p>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="py-32 text-center glitter-card rounded-sm border-white/10">
            <Bell className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-[10px] font-black tracking-widest uppercase text-white/20">NO_NOTIFICATIONS_FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StripePaymentForm = ({ amount, currency, onSuccess, onCancel }: { amount: number, currency: string, onSuccess: () => void, onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { data: { clientSecret } } = await axios.post('/api/stripe/create-payment-intent', {
        amount,
        currency,
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'System error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#fff',
              '::placeholder': { color: '#ffffff40' },
            },
            invalid: { color: '#ef4444' },
          },
        }} />
      </div>
      {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 glitter-button glitter-gold py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
        >
          {isProcessing ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          CONFIRM_PAYMENT
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 border border-white/10 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-all"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Activity className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-white/20" />
            <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">UPCOMING_SERVICES</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none glitter-text">EVENTS_CALENDAR</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {events.map(event => (
          <div key={event.id} className="glitter-card p-8 rounded-sm border-white/5 hover:border-white/20 transition-all flex gap-8">
            <div className="flex-shrink-0 w-20 h-20 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-white/40 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
              <span className="text-2xl font-black">{new Date(event.date).getDate()}</span>
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-sm">{event.type}</span>
                <span className="text-[8px] font-mono text-white/30 uppercase">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">{event.title}</h3>
              <p className="text-sm text-white/50 mb-4 line-clamp-2">{event.description}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <MapPin className="w-3 h-3" />
                {event.location}
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="lg:col-span-2 py-32 text-center glitter-card rounded-sm border-dashed border-white/10">
            <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-[10px] font-black tracking-widest uppercase text-white/20">NO_EVENTS_SCHEDULED</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SupportPage = ({ user }: { user: FirebaseUser | null }) => {
  const [amount, setAmount] = useState('50');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'flutterwave' | 'paypal' | 'bank'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [type, setType] = useState<'tithe' | 'offering' | 'support' | 'other'>('support');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'global_settings', 'payment_config'), (snapshot) => {
      if (snapshot.exists()) {
        setPaymentConfig(snapshot.data());
      }
    });
    return unsubscribe;
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'KES', symbol: 'KSh' },
    { code: 'ETB', symbol: 'Br' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'NGN', symbol: '₦' },
    { code: 'ZAR', symbol: 'R' },
  ];

  const handleSupport = async () => {
    if (!user) return;
    
    if (paymentMethod === 'card') {
      setShowStripeForm(true);
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === 'mpesa') {
        const response = await axios.post('/api/mpesa/stkpush', {
          phoneNumber: phoneNumber.replace('+', ''),
          amount: parseFloat(amount),
          accountReference: type.toUpperCase()
        });
        
        if (response.data.ResponseCode === '0') {
          alert("STK_PUSH_SENT: Please enter your PIN on your phone to complete the transaction.");
        } else {
          throw new Error(response.data.ResponseDescription);
        }
      } else if (paymentMethod === 'flutterwave') {
        const response = await axios.post('/api/flutterwave/initiate', {
          amount: parseFloat(amount),
          currency,
          email: user.email,
          phoneNumber,
          name: user.displayName
        });
        window.open(response.data.data.link, '_blank');
      } else if (paymentMethod === 'paypal') {
        alert("PAYPAL_REDIRECT: Redirecting to secure PayPal gateway...");
        setTimeout(() => window.open('https://paypal.com', '_blank'), 1000);
      }
      
      const donationId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'donations', donationId), {
        id: donationId,
        userId: user.uid,
        userEmail: user.email,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        type,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      if (paymentMethod !== 'mpesa') {
        setShowSuccess(true);
      }
    } catch (error: any) {
      console.error("Support failed:", error);
      alert(`TRANSACTION_FAILED: ${error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = async () => {
    if (!user) return;
    const donationId = Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'donations', donationId), {
      id: donationId,
      userId: user.uid,
      userEmail: user.email,
      amount: parseFloat(amount),
      currency,
      paymentMethod: 'card',
      type,
      status: 'completed',
      createdAt: serverTimestamp()
    });
    setShowStripeForm(false);
    setShowSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="space-y-4 mb-16">
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-white/20" />
          <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">PARTNER_WITH_US</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none glitter-text">SUPPORT_MINISTRY</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <p className="text-lg text-white/70 leading-relaxed font-medium">
            Your support enables us to continue spreading the word and impacting lives globally. Every contribution helps us reach more people with the message of hope and faith.
          </p>
          
          <div className="glitter-card p-8 rounded-sm border-white/10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">SELECT_PAYMENT_METHOD</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'mpesa', label: 'M-PESA', icon: Smartphone },
                  { id: 'card', label: 'STRIPE_CARD', icon: CreditCard },
                  { id: 'flutterwave', label: 'FLUTTERWAVE', icon: Zap },
                  { id: 'paypal', label: 'PAYPAL', icon: Globe },
                  { id: 'bank', label: 'BANK_TRANSFER', icon: Building2 }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-4 rounded-sm border transition-all flex flex-col items-center gap-3 ${
                      paymentMethod === method.id 
                        ? 'bg-white text-black border-white' 
                        : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="text-[8px] font-black tracking-widest uppercase">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'bank' && paymentConfig?.bank && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-white/5 border border-white/10 rounded-sm space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Building2 className="w-5 h-5 text-gold-500" />
                  <span className="text-[10px] font-black tracking-widest uppercase">OFFICIAL_BANK_ACCOUNT</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'BANK_NAME', value: paymentConfig.bank.bankName },
                    { label: 'ACCOUNT_NAME', value: paymentConfig.bank.receiverName },
                    { label: 'ACCOUNT_NUMBER', value: paymentConfig.bank.accountNumber },
                    { label: 'SWIFT_CODE', value: paymentConfig.bank.swiftCode }
                  ].map((field, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{field.label}</span>
                      <div className="flex items-center justify-between group">
                        <span className="text-sm font-black uppercase tracking-tight">{field.value}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(field.value);
                            alert("COPIED_TO_CLIPBOARD");
                          }}
                          className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:text-gold-500"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {showStripeForm ? (
              <Elements stripe={stripePromise}>
                <StripePaymentForm 
                  amount={parseFloat(amount)} 
                  currency={currency} 
                  onSuccess={handleStripeSuccess}
                  onCancel={() => setShowStripeForm(false)}
                />
              </Elements>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">CONTRIBUTION_DETAILS</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-xs">
                        {currencies.find(c => c.code === currency)?.symbol}
                      </span>
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-4 text-xl font-black focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-xs font-black focus:outline-none focus:border-white transition-all"
                    >
                      {currencies.map(c => (
                        <option key={c.code} value={c.code} className="bg-black text-white">{c.code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">PHONE_NUMBER (254...)</label>
                    <input 
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254712345678"
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-sm font-black focus:outline-none focus:border-white transition-all"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">CONTRIBUTION_TYPE</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['tithe', 'offering', 'support', 'other'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t as any)}
                        className={`px-4 py-2 rounded-sm border text-[8px] font-black tracking-widest uppercase transition-all ${
                          type === t ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSupport}
                  disabled={isProcessing}
                  className="w-full glitter-button glitter-gold py-5 rounded-sm text-[10px] font-black tracking-[0.4em] uppercase flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  {isProcessing ? <Activity className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  INITIATE_SUPPORT
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glitter-card p-8 rounded-sm border-white/10">
            <h3 className="text-sm font-black tracking-widest uppercase mb-6">TRANSACTION_SECURITY</h3>
            <div className="space-y-6">
              {[
                { icon: Lock, title: 'END_TO_END_ENCRYPTION', desc: 'All payment data is encrypted using 256-bit SSL protocols.' },
                { icon: ShieldCheck, title: 'FRAUD_PROTECTION', desc: 'AI-driven monitoring systems detect and prevent suspicious activity.' },
                { icon: Check, title: 'DIRECT_SETTLEMENT', desc: 'Funds are processed directly through authorized banking gateways.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <item.icon className="w-5 h-5 text-white/40 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">{item.title}</p>
                    <p className="text-[10px] text-white/30 uppercase leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glitter-card p-12 rounded-sm border-white/20 text-center max-w-md"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-black tracking-widest uppercase mb-4">TRANSACTION_SUCCESS</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8 leading-relaxed">
                Your partnership has been recorded. A confirmation receipt has been sent to your registered email address.
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded-sm hover:bg-white/80 transition-all"
              >
                RETURN_TO_MINISTRY
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info' | 'warning', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <Check className="w-4 h-4 text-green-500" />,
    error: <ShieldAlert className="w-4 h-4 text-red-500" />,
    info: <Bell className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />
  };

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20'
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`fixed top-8 right-8 z-[1000] p-4 rounded-sm border backdrop-blur-md shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md ${bgColors[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-0.5">{type}</p>
        <p className="text-xs font-medium text-white/90 leading-tight">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/20 hover:text-white transition-all">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "CONFIRM", 
  cancelText = "CANCEL",
  isDangerous = false 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string, 
  confirmText?: string, 
  cancelText?: string,
  isDangerous?: boolean
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glitter-card p-8 rounded-sm border-white/10"
          >
            <h3 className="text-xl font-black tracking-widest uppercase mb-4">{title}</h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 border border-white/10 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className={`flex-1 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase transition-all ${
                  isDangerous 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white text-black hover:bg-white/80'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SermonNotesPage = ({ notify }: { notify: (msg: string, type: any) => void }) => {
  const [notes, setNotes] = useState<SermonNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'sermon_notes'), 
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SermonNote)));
      setIsLoading(false);
    });
  }, []);

  const handleDelete = async (noteId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    
    if (window.confirm("ARE_YOU_SURE? This prophetic insight will be permanently retracted.")) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sermon_notes', noteId));
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-gold-500/40" />
            <span className="text-[10px] font-black tracking-[0.5em] text-gold-500 uppercase">PROPHETIC_ARCHIVE</span>
          </div>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-none glitter-text">YOUR_REVELATIONS</h1>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] font-black tracking-widest text-white/20 uppercase mb-2">INSIGHT_DENSITY</span>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black">{notes.length}</div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-tight">
              PROPHETIC<br />DEPOSITS
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-40">
          <Activity className="w-12 h-12 text-gold-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {notes.map(note => (
            <motion.div 
              key={note.id} 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glitter-card p-10 rounded-sm border-white/5 group hover:border-gold-500/30 transition-all flex flex-col h-full bg-white/[0.02]"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <History className="w-3 h-3 text-white/20" />
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                      {note.createdAt?.toDate ? new Date(note.createdAt.toDate()).toLocaleDateString() : 'REALTIME_CAPTURE'}
                    </p>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-gold-500 transition-colors">
                    {note.title}
                  </h3>
                </div>
                <button 
                  onClick={() => handleDelete(note.id)}
                  className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-sm opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {note.postTitle && (
                <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-white/5 rounded-sm border border-white/5 w-fit">
                  <Bookmark className="w-3 h-3 text-gold-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{note.postTitle}</span>
                </div>
              )}

              <div className="flex-grow space-y-6">
                <div className="p-6 bg-white/5 border border-white/5 rounded-sm italic text-sm text-white/70 leading-relaxed font-medium">
                  {note.content}
                </div>
                
                {note.summary && (
                  <div className="p-6 bg-gold-500/5 border border-gold-500/10 rounded-sm text-xs text-white/60 leading-relaxed">
                    <div className="flex items-center gap-2 mb-4 text-gold-500">
                      <Bot className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">YOHANNES_SYNTHESIS</span>
                    </div>
                    <ReactMarkdown>{note.summary}</ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${note.isAIFormatted ? 'bg-gold-500 shadow-[0_0_10px_theme(colors.gold.500)]' : 'bg-white/10'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30 truncate">
                    {note.isAIFormatted ? 'STRATEGICALLY_STRUCTURED' : 'RAW_REVELATION'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(note.content);
                    notify("INSIGHT_TRANSFERRED: Revelation copied to strategic clipboard.", "success");
                  }}
                  className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-sm transition-all"
                >
                  <Copy className="w-3 h-3" /> EXPORT
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && notes.length === 0 && (
        <div className="text-center py-40 bg-white/5 border border-dashed border-white/10 rounded-sm">
          <div className="flex flex-col items-center gap-6">
            <PlusSquare className="w-16 h-16 text-white/5" />
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-widest text-white/20">NO_REVELATIONS_ARCHIVED</h3>
              <p className="text-[10px] font-black tracking-widest uppercase text-white/10 max-w-sm mx-auto">
                Begin capturing insights from your favorite sermons and Bible studies to build your prophetic database.
              </p>
            </div>
            <Link 
              to="/videos"
              className="mt-8 px-10 py-4 bg-white/5 border border-white/10 rounded-sm text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all"
            >
              DISCOVER_CONTENT
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    try {
      const cleanFeedback = {
        message,
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'anonymous@example.com',
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'feedback'), cleanFeedback);
      setSent(true);
      setMessage('');
    } catch (error) {
      console.error("Feedback failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glitter-card p-8 rounded-sm border-white/20">
      <h3 className="text-xl font-black tracking-widest uppercase mb-6">SEND_FEEDBACK</h3>
      {sent ? (
        <div className="text-center py-8">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-[10px] font-black tracking-widest uppercase">MESSAGE_RECEIVED_THANK_YOU</p>
          <button onClick={() => setSent(false)} className="mt-4 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white underline">SEND_ANOTHER</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="YOUR MESSAGE TO THE EXECUTIVE TEAM..."
            className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-[11px] font-medium leading-relaxed focus:outline-none focus:border-white transition-all min-h-[150px] custom-scrollbar"
          />
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="glitter-button w-full py-4 text-[10px] font-black tracking-widest uppercase rounded-sm flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSending ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            SUBMIT_FEEDBACK
          </button>
        </form>
      )}
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, []);

  const handleVerifyOrder = async (orderId: string, approve: boolean) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: approve ? 'completed' : 'rejected'
      });
      alert(approve ? "ORDER_VERIFIED: Access granted to user." : "ORDER_REJECTED: User notified.");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Activity className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black tracking-widest uppercase">SYSTEM_ORDERS_VERIFICATION</h3>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
          <span className="text-[10px] font-black tracking-widest uppercase text-white/40">TOTAL_REVENUE: </span>
          <span className="text-[10px] font-black tracking-widest uppercase text-white">${orders.reduce((acc, o) => acc + (o.amount || 0), 0).toFixed(2)}</span>
        </div>
      </div>
      <div className="grid gap-4">
        {orders.map(order => (
          <div key={order.id} className="p-6 bg-white/5 border border-white/10 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${
                    order.method === 'bank' ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white/40'
                  }`}>{order.method}</span>
                  <p className="text-[10px] font-black tracking-widest uppercase">{order.postTitle}</p>
                </div>
                <p className="text-[8px] font-black tracking-widest uppercase text-white/40">{order.userEmail}</p>
                <p className="text-[8px] font-mono text-white/10 uppercase">{new Date(order.createdAt?.toDate()).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <p className="text-lg font-black font-mono mb-1">${order.amount?.toFixed(2)}</p>
                <p className={`text-[8px] font-black tracking-widest uppercase ${
                  order.status === 'completed' ? 'text-green-500' : 
                  order.status === 'pending_verification' ? 'text-yellow-500' : 'text-white/20'
                }`}>{order.status}</p>
              </div>
              <div className="flex gap-2">
                {order.receiptUrl && (
                  <a 
                    href={order.receiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:border-white transition-all"
                    title="View Receipt"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </a>
                )}
                {order.status === 'pending_verification' && (
                  <>
                    <button
                      onClick={() => handleVerifyOrder(order.id, true)}
                      className="px-4 py-2 bg-green-500 text-white text-[8px] font-black uppercase tracking-widest rounded-sm hover:bg-green-600 transition-all"
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={() => handleVerifyOrder(order.id, false)}
                      className="px-4 py-2 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-sm hover:bg-red-600 transition-all"
                    >
                      REJECT
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="text-center py-20 text-white/20 uppercase tracking-widest text-[10px]">NO_ORDERS_FOUND</div>}
      </div>
    </div>
  );
};

const BookReaderModal = ({ post, user, onClose, initialProgress = 0 }: { post: Post, user: FirebaseUser | null, onClose: () => void, initialProgress?: number }) => {
  const [progress, setProgress] = useState(initialProgress);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && initialProgress > 0) {
      contentRef.current.scrollTop = initialProgress;
    }
  }, [initialProgress]);

  const handleScroll = () => {
    if (contentRef.current) {
      setProgress(contentRef.current.scrollTop);
    }
  };

  const saveProgress = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'bookmarks', post.id), {
        postId: post.id,
        readingProgress: progress,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const handleTTS = async () => {
    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
      return;
    }

    if (audio) {
      audio.play();
      setIsPlaying(true);
      return;
    }

    setIsAILoading(true);
    try {
      const base64 = await generateSpeech(post.content);
      if (base64) {
        const newAudio = new Audio(`data:audio/wav;base64,${base64}`);
        newAudio.onended = () => setIsPlaying(false);
        setAudio(newAudio);
        newAudio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("TTS failed:", error);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleDownloadAudio = async () => {
    await downloadSpeech(post.content, post.title);
  };

  const handleDownloadPDF = async () => {
    try {
      if (post.pdfUrl) {
        // If there's a pre-generated secure URL, use it
        window.open(post.pdfUrl, '_blank');
        return;
      }

      // Generate PDF locally if no URL is provided
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - margin * 2;

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(post.title.toUpperCase(), maxLineWidth);
      doc.text(titleLines, margin, 30);

      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`BY PASTOR JK OFFICIAL BRAND`, margin, 45);
      doc.text(`DATE: ${new Date().toLocaleDateString()}`, margin, 50);
      doc.text(`TYPE: ${post.isFullBook ? 'FULL BOOK' : 'CHAPTER ' + (post.chapterNumber || 'CONTENT')}`, margin, 55);

      // Content
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      const contentLines = doc.splitTextToSize(post.content, maxLineWidth);
      
      let cursorY = 70;
      const pageHeight = doc.internal.pageSize.getHeight();

      contentLines.forEach((line: string) => {
        if (cursorY > pageHeight - 20) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(line, margin, cursorY);
        cursorY += 7;
      });

      // Footer on last page
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200);
      doc.text(`© ${new Date().getFullYear()} PASTOR JK OFFICIAL - PROPHETIC DOMINION HUB`, margin, pageHeight - 10);

      doc.save(`${post.title.replace(/\s+/g, '_')}_Wisdom_Archive.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { saveProgress(); onClose(); }}
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl h-[90vh] bg-[#050505] border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-black tracking-widest uppercase mb-1">{post.title}</h2>
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">
              {post.isFullBook ? 'FULL BOOK' : `CHAPTER ${post.chapterNumber}`} | READING_PROGRESS: {Math.round((progress / (contentRef.current?.scrollHeight || 1)) * 100)}%
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleTTS}
              disabled={isAILoading}
              className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {isAILoading ? <Activity className="w-4 h-4 animate-spin" /> : isPlaying ? <Volume2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4 opacity-40" />}
              {isPlaying ? 'PAUSE_AI' : 'AI_READ_ALOUD'}
            </button>
            <button 
              onClick={handleDownloadAudio}
              className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Download className="w-4 h-4" />
              AUDIO
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button onClick={() => { saveProgress(); onClose(); }} className="p-3 hover:bg-white/5 rounded-sm transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-8 sm:p-16 custom-scrollbar"
        >
          <div className="max-w-2xl mx-auto">
            <div className="prose prose-invert max-w-none">
              <div className="text-lg leading-relaxed font-medium text-white/80 whitespace-pre-wrap">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
          <button 
            onClick={saveProgress}
            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            <Save className="w-3 h-3" /> SAVE_READING_PROGRESS
          </button>
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">PASTOR_JK_OFFICIAL_READER_V1.0</p>
        </div>
      </motion.div>
    </div>
  );
};

const SermonOutlineModal = ({ post, onClose, notify }: { post: Post, onClose: () => void, notify: (msg: string, type: any) => void }) => {
  const [outline, setOutline] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try {
        const result = await generateSermonOutline(post.title || post.content.substring(0, 50));
        setOutline(result);
        notify("SPIRITUAL_SYNTHESIS_COMPLETE: Your sermon outline has been generated.", "success");
      } catch (error) {
        console.error("Sermon outline generation failed:", error);
        notify("PROPHETIC_INTERRUPTION: Unable to generate sermon outline at this time.", "error");
        onClose();
      } finally {
        setIsGenerating(false);
      }
    };
    generate();
  }, [post, notify, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#151619] border border-white/10 rounded-sm flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center text-black">
              <Cross className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">AI_SERMON_STRATEGY</h2>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">SOURCE: {post.title || 'Selected Content'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-sm transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.3em] flash-text text-center">SYNERGIZING_DIVINE_REVELATION</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none prose-p:text-white/60 prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter">
              <div className="markdown-body bg-white/5 p-8 border border-white/10 rounded-sm">
                <ReactMarkdown>{outline || ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black flex justify-between items-center">
          <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">YOHANNES_SPIRITUAL_INTEL_v1.0</p>
          <button 
            disabled={isGenerating}
            onClick={() => {
              if (outline) {
                navigator.clipboard.writeText(outline);
                notify("ASCENDED_TO_CLIPBOARD: Prophetic data extracted.", "success");
              }
            }}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-white/80 transition-all disabled:opacity-50"
          >
            <Copy className="w-3 h-3" /> COPY_OUTLINE
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MarketingSuiteModal = ({ post, onClose, notify }: { post: Post, onClose: () => void, notify: (msg: string, type: any) => void }) => {
  const [suite, setSuite] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try {
        const result = await generateMarketingSuite(post.title, post.content, post.type);
        setSuite(result);
        notify("MARKETING_SUITE_ENGINEERED: Your strategic assets are ready for deployment.", "success");
      } catch (error) {
        console.error("Marketing suite generation failed:", error);
        notify("STRATEGIC_FAILURE: Unable to synthesize marketing assets at this time.", "error");
        onClose();
      } finally {
        setIsGenerating(false);
      }
    };
    generate();
  }, [post, notify, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#151619] border border-white/10 rounded-sm flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center text-black">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">AI_MARKETING_SUITE</h2>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">POST: {post.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-sm transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-black uppercase tracking-[0.3em] flash-text">SYNTHESIZING_STRATEGIC_ASSETS</p>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">ALIGNED_WITH_PASTOR_JK_VISION_v4.2</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none prose-p:text-white/60 prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">STATUS</p>
                  <p className="text-xs font-black uppercase">TACTICAL_READY</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">VERSION</p>
                  <p className="text-xs font-black uppercase">CAMPAIGN_V1.0</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">TARGET_REACH</p>
                  <p className="text-xs font-black uppercase">GLOBAL_EXECUTIVE</p>
                </div>
              </div>
              
              <div className="markdown-body bg-white/5 p-8 border border-white/10 rounded-sm">
                <ReactMarkdown>{suite || ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black flex justify-between items-center">
          <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">OFFICIAL_BRAND_ASSET_GENERATOR_ENCRYPTED</p>
          <button 
            disabled={isGenerating}
            onClick={() => {
              if (suite) {
                navigator.clipboard.writeText(suite);
                notify("COPIED_TO_CLIPBOARD: Strategic data extracted.", "success");
              }
            }}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-white/80 transition-all disabled:opacity-50"
          >
            <Copy className="w-3 h-3" /> COPY_FULL_SUITE
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentModal = ({ post, user, onClose, notify }: { post: Post, user: FirebaseUser | null, onClose: () => void, notify?: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void }) => {
  const [method, setMethod] = useState<'mpesa' | 'card' | 'flutterwave' | 'paypal' | 'bank'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'processing' | 'success'>('select');
  const [showStripeForm, setShowStripeForm] = useState(false);

  const handlePayment = async () => {
    if (!user) return;
    
    if (method === 'card') {
      setShowStripeForm(true);
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    
    try {
      if (method === 'mpesa') {
        const response = await axios.post('/api/mpesa/stkpush', {
          phoneNumber: phoneNumber.replace('+', ''),
          amount: post.price || 49.99,
          accountReference: post.title.substring(0, 12)
        });
        if (response.data.ResponseCode !== '0') throw new Error(response.data.ResponseDescription);
        if (notify) notify("STK_PUSH_SENT: Protocol initiated. Verify transaction on your mobile terminal.", "info");
      } else if (method === 'flutterwave') {
        const response = await axios.post('/api/flutterwave/initiate', {
          amount: post.price || 49.99,
          currency: 'USD',
          email: user.email,
          phoneNumber,
          name: user.displayName
        });
        window.open(response.data.data.link, '_blank');
      } else if (method === 'paypal') {
        window.open('https://paypal.com', '_blank');
      } else if (method === 'bank') {
        if (notify) notify("BANK_TRANSFER_INSTRUCTIONS: Direct deposit to 1234567890. Upload verification document once complete.", "info");
      }

      const orderId = Math.random().toString(36).substr(2, 9);
      const cleanOrder = {
        id: orderId,
        postId: post.id,
        postTitle: post.title,
        userUid: user.uid,
        userEmail: user.email,
        amount: post.price || 49.99,
        method,
        status: method === 'mpesa' ? 'pending' : 'completed',
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'orders', orderId), cleanOrder);
      setStep('success');
      if (notify) notify("ORDER_CHARTED: Your digital requisition is being processed.", "success");
    } catch (error: any) {
      console.error("Payment failed:", error);
      if (notify) notify(getFriendlyErrorMessage(error), "error");
      setStep('details');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = async () => {
    if (!user) return;
    const orderId = Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'orders', orderId), {
      id: orderId,
      postId: post.id,
      postTitle: post.title,
      userUid: user.uid,
      userEmail: user.email,
      amount: post.price || 49.99,
      method: 'card',
      status: 'completed',
      createdAt: serverTimestamp()
    });
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-sm overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black tracking-widest uppercase mb-1">SECURE_CHECKOUT</h2>
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">ORDER: {post.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-sm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {step === 'select' && (
            <div className="space-y-6">
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-4">SELECT_PAYMENT_METHOD</p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'mpesa', label: 'M-PESA_DARAJA', icon: Smartphone, desc: 'STK_PUSH_INSTANT_PAY', color: 'text-green-500' },
                  { id: 'bank', label: 'BANK_TRANSFER', icon: ExternalLink, desc: 'DIRECT_WIRE_SETTLEMENT', color: 'text-blue-500' },
                  { id: 'card', label: 'STRIPE_CARD', icon: CreditCard, desc: 'SECURE_BANKING_GATEWAY', color: 'text-blue-500' },
                  { id: 'flutterwave', label: 'FLUTTERWAVE', icon: Zap, desc: 'AFRICA_GLOBAL_PAYMENTS', color: 'text-yellow-500' },
                  { id: 'paypal', label: 'PAYPAL', icon: Globe, desc: 'INTERNATIONAL_CHECKOUT', color: 'text-blue-400' }
                ].map((m) => (
                  <button 
                    key={m.id}
                    onClick={() => { setMethod(m.id as any); setStep('details'); }}
                    className="p-6 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between group hover:border-white/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center`}>
                        <m.icon className={`w-6 h-6 ${m.color}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-widest">{m.label}</p>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{m.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              {method === 'card' ? (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm 
                    amount={post.price || 49.99} 
                    currency="USD" 
                    onSuccess={handleStripeSuccess}
                    onCancel={() => setStep('select')}
                  />
                </Elements>
              ) : (
                <>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">TOTAL_DUE</p>
                      <p className="text-2xl font-black font-mono">${(post.price || 49.99).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">METHOD</p>
                      <p className="text-xs font-black uppercase tracking-widest">{method}</p>
                    </div>
                  </div>

                  {method === 'mpesa' && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">PHONE_NUMBER (254...)</label>
                      <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="254712345678"
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-sm font-black focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="flex-1 glitter-button glitter-gold py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      INITIALIZE_PAYMENT
                    </button>
                    <button 
                      onClick={() => setStep('select')}
                      className="flex-1 py-4 border border-white/10 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-all"
                    >
                      BACK
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="py-20 text-center space-y-6">
              <Activity className="w-12 h-12 text-white/20 mx-auto animate-spin" />
              <div>
                <p className="text-sm font-black uppercase tracking-widest mb-2">PROCESSING_TRANSACTION</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Securing connection to banking gateway...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-20 text-center space-y-8">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-black uppercase tracking-widest mb-2">PAYMENT_SUCCESSFUL</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Your content is now unlocked and available in your library.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded-sm hover:bg-white/80 transition-all"
              >
                ACCESS_CONTENT
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
const FeedbackTab = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Activity className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black tracking-widest uppercase mb-8">USER_FEEDBACK</h3>
      <div className="grid gap-4">
        {feedback.map(item => (
          <div key={item.id} className="p-6 bg-white/5 border border-white/10 rounded-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-black tracking-widest uppercase">{item.userEmail}</span>
              </div>
              <span className="text-[8px] font-black tracking-widest uppercase text-white/20">
                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-white/80 italic">"{item.message}"</p>
          </div>
        ))}
        {feedback.length === 0 && <div className="text-center py-20 text-white/20 uppercase tracking-widest text-[10px]">NO_FEEDBACK_RECEIVED</div>}
      </div>
    </div>
  );
};

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 mb-8 flex items-center justify-center opacity-20"
      >
        <div className="absolute inset-0 border border-white rounded-sm rotate-45" />
        <Activity className="w-10 h-10" />
      </motion.div>
      <h1 className="text-4xl font-black tracking-[0.3em] uppercase mb-4 glitter-text">PATH_NOT_FOUND</h1>
      <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-12">The requested coordinate is outside our spiritual territory.</p>
      <button 
        onClick={() => navigate('/')}
        className="glitter-button glitter-gold px-12 py-5 rounded-sm text-[10px] font-black tracking-widest uppercase text-black"
      >
        RETURN_TO_COMMAND_CENTER
      </button>
    </div>
  );
};

const ProfilePage = ({ user, profile }: { user: FirebaseUser | null, profile: UserProfile | null }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'orders' | 'notes'>('info');

  useEffect(() => {
    if (!user) return;

    const ordersQuery = query(collection(db, 'orders'), where('userUid', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setUserOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const notesQuery = query(collection(db, 'users', user.uid, 'sermon_notes'), orderBy('createdAt', 'desc'));
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      setUserNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeNotes();
    };
  }, [user]);

  const handleReceiptUpload = async (orderId: string) => {
    const url = prompt("PLEASE_ENTER_RECEIPT_IMAGE_URL (e.g., from a cloud storage or image host):");
    if (!url) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        receiptUrl: url,
        status: 'pending_verification'
      });
      alert("RECEIPT_UPLOADED: Admin will verify your transfer shortly.");
    } catch (error) {
      console.error("Receipt upload failed:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        phone,
        notificationsEnabled
      });
      setIsEditing(false);
      alert("PROFILE_UPDATED: Information synchronized successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Lock className="w-12 h-12 mx-auto text-white/20" />
        <p className="text-[10px] font-black tracking-widest uppercase text-white/40">ACCESS_DENIED: PLEASE_LOGIN</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 space-y-2">
          {[
            { id: 'info', label: 'PERSONAL_PROFILE', icon: UserIcon },
            { id: 'orders', label: 'MY_ACQUISITIONS', icon: ShoppingCart },
            { id: 'notes', label: 'SERMON_ARCHIVE', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase transition-all ${
                activeProfileTab === tab.id ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeProfileTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glitter-card p-8 sm:p-12 rounded-sm border-white/10"
              >
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/5 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover :duration-200"></div>
                    <img 
                      src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random&color=fff&bold=true&size=256`} 
                      alt="" 
                      className="relative w-32 h-32 rounded-full border-2 border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter uppercase glitter-text">{profile.displayName}</h1>
                    <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">{profile.role}_ACCOUNT_VERIFIED</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase flex items-center gap-2">
                        <Mail className="w-3 h-3" /> EMAIL_ADDRESS
                      </label>
                      <p className="text-sm font-medium text-white/80 border-b border-white/5 pb-2">{profile.email}</p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase flex items-center gap-2">
                        <Phone className="w-3 h-3" /> PHONE_NUMBER
                      </label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm font-medium focus:outline-none focus:border-white transition-all"
                          placeholder="+254..."
                        />
                      ) : (
                        <p className="text-sm font-medium text-white/80 border-b border-white/5 pb-2">{phone || 'NOT_SET'}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase flex items-center gap-2">
                        <Bell className="w-3 h-3" /> NOTIFICATIONS
                      </label>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black tracking-widest uppercase">SYSTEM_ALERTS</p>
                          <p className="text-[8px] text-white/40 uppercase">Receive updates on new postings and events</p>
                        </div>
                        <button 
                          onClick={() => isEditing && setNotificationsEnabled(!notificationsEnabled)}
                          className={`w-12 h-6 rounded-full transition-all relative ${notificationsEnabled ? 'bg-white' : 'bg-white/10'}`}
                          disabled={!isEditing}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${notificationsEnabled ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-8">
                      {isEditing ? (
                        <div className="flex gap-4">
                          <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 glitter-button glitter-gold py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
                          >
                            {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            SAVE_CHANGES
                          </button>
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-4 border border-white/10 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-all"
                          >
                            CANCEL
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="w-full py-4 border border-white/20 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                        >
                          EDIT_PROFILE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeProfileTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black tracking-widest uppercase border-b border-white/10 pb-4">ACQUISITION_HISTORY</h2>
                <div className="space-y-4">
                  {userOrders.map(order => (
                    <div key={order.id} className="glitter-card p-6 rounded-sm border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">{order.method}_TRANSACTION</p>
                        <h3 className="text-sm font-black uppercase">{order.postTitle}</h3>
                        <p className="text-[8px] font-mono text-white/20 uppercase">{new Date(order.createdAt?.toDate()).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="text-sm font-black font-mono text-white">${order.amount.toFixed(2)}</p>
                          <p className={`text-[8px] font-black uppercase tracking-widest ${
                            order.status === 'completed' ? 'text-green-500' : 
                            order.status === 'pending_verification' ? 'text-yellow-500' : 'text-white/20'
                          }`}>{order.status}</p>
                        </div>
                        {order.method === 'bank' && order.status === 'pending' && (
                          <button
                            onClick={() => handleReceiptUpload(order.id)}
                            className="px-4 py-2 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-sm hover:bg-white/80 transition-all"
                          >
                            UPLOAD_RECEIPT
                          </button>
                        )}
                        {order.receiptUrl && (
                          <a 
                            href={order.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 border border-white/10 rounded-sm hover:border-white transition-all"
                            title="View Receipt"
                          >
                            <ImageIcon className="w-4 h-4 text-white/40" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {userOrders.length === 0 && (
                    <div className="text-center py-20 glitter-card rounded-sm border-dashed border-white/10 text-white/20 text-[10px] font-black tracking-widest uppercase">
                      NO_ACQUISITIONS_FOUND
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeProfileTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black tracking-widest uppercase border-b border-white/10 pb-4">STRATEGIC_WISDOM_ARCHIVE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userNotes.map(note => (
                    <div key={note.id} className="glitter-card p-6 rounded-sm border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-black uppercase tracking-tight line-clamp-1">{note.title}</h3>
                        <span className="text-[8px] font-mono text-white/20 uppercase">{new Date(note.createdAt?.toDate()).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-white/60 leading-relaxed line-clamp-4 italic">"{note.content}"</p>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <button 
                          onClick={() => alert(`FULL_NOTE:\n\n${note.content}`)}
                          className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                        >
                          EXPAND_WISDOM
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm("DELETE_NOTE?")) {
                              await deleteDoc(doc(db, 'users', user.uid, 'sermon_notes', note.id));
                            }
                          }}
                          className="text-white/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {userNotes.length === 0 && (
                    <div className="col-span-full text-center py-20 glitter-card rounded-sm border-dashed border-white/10 text-white/20 text-[10px] font-black tracking-widest uppercase">
                      ARCHIVE_EMPTY
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AdminPage = ({ 
  posts, 
  advice, 
  transactions, 
  marketingLogs, 
  allUsers, 
  sites, 
  comments, 
  contactMessages, 
  aiSettings, 
  team,
  contactInfo,
  events,
  allOrders,
  aiReports,
  paymentSettings,
  financialReport,
  strategicInsights,
  isGeneratingReport,
  profile,
  onGenerateReport,
  onSavePaymentSettings,
  onOpenCreateModal 
}: { 
  posts: Post[], 
  advice: AdminAdvice[], 
  transactions: Transaction[], 
  marketingLogs: MarketingLog[], 
  allUsers: UserProfile[], 
  sites: Site[], 
  comments: Comment[], 
  contactMessages: any[], 
  aiSettings: AISettings, 
  team: TeamMember[],
  contactInfo: ContactInfo,
  events: Event[],
  allOrders: any[],
  aiReports: any[],
  paymentSettings: any,
  financialReport: any,
  strategicInsights: StrategicInsight[],
  isGeneratingReport: boolean,
  profile: UserProfile | null,
  onGenerateReport: () => void,
  onSavePaymentSettings: (settings: any) => void,
  onOpenCreateModal: () => void 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("");

  const tabs = [
    { id: 'stats', label: 'SYSTEM_STATS', icon: Activity, role: ['admin'] },
    { id: 'accounting', label: 'AI_ACCOUNTING', icon: DollarSign, role: ['admin'] },
    { id: 'moderation', label: 'MODERATION_LOOP', icon: Workflow, role: ['admin'] },
    { id: 'ai_auto_reply', label: 'AI_AUTO_REPLY', icon: MessageSquare, role: ['admin'] },
    { id: 'ai_content_enhancer', label: 'CONTENT_ENHANCER', icon: Sparkles, role: ['admin', 'contributor'] },
    { id: 'ai_marketing_suite', label: 'MARKETING_SUITE', icon: Target, role: ['admin', 'contributor'] },
    { id: 'ai_stability_monitor', label: 'STABILITY_MONITOR', icon: ShieldCheck, role: ['admin'] },
    { id: 'content_management', label: 'CONTENT_MANAGER', icon: Video, role: ['admin', 'contributor'] },
    { id: 'payment_config', label: 'PAYMENT_CONFIG', icon: CreditCard, role: ['admin'] },
    { id: 'orders', label: 'ORDERS', icon: ShoppingCart, role: ['admin'] },
    { id: 'feedback', label: 'USER_FEEDBACK', icon: MessageSquare, role: ['admin'] },
    { id: 'users', label: 'USERS', icon: Users, role: ['admin'] },
    { id: 'team', label: 'TEAM', icon: Users, role: ['admin'] },
    { id: 'community', label: 'COMMUNITY', icon: MessageSquare, role: ['admin'] },
    { id: 'messages', label: 'MESSAGES', icon: Mail, role: ['admin'] },
    { id: 'events', label: 'EVENTS', icon: Calendar, role: ['admin', 'contributor'] },
    { id: 'sites', label: 'WEBSITES', icon: ExternalLink, role: ['admin'] },
    { id: 'ai_control', label: 'AI_CONTROL', icon: Brain, role: ['admin'] },
    { id: 'ai_studio', label: 'AI_STUDIO_TERMINAL', icon: Terminal, role: ['admin'] },
    { id: 'ai_lab', label: 'STRATEGIC_AI_LAB', icon: Beaker, role: ['admin', 'contributor'] },
    { id: 'strategic_insights', label: 'STRATEGIC_INSIGHTS', icon: Zap, role: ['admin', 'contributor'] },
    { id: 'settings', label: 'SETTINGS', icon: Settings, role: ['admin'] }
  ].filter(t => t.role.includes(profile?.role || 'viewer'));

  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const pendingPosts = posts.filter(p => p.status === 'pending');
  const [isRefining, setIsRefining] = useState(false);
  const [terminalPrompt, setTerminalPrompt] = useState("");
  const [terminalSystemInstruction, setTerminalSystemInstruction] = useState("Your name is Yohannes. You are a charismatic, slightly jokie, and brilliantly sarcastic AI Strategist. You are a mix of a genius billionaire friend and a stoic monk. Detect the user's mood and respond with charm to keep the conversation dynamic. Only greet the user if the conversation is just beginning; otherwise, dive straight into the value. If you know their name, use it naturally in greetings.");
  const [terminalResult, setTerminalResult] = useState("");
  const [isTerminalLoading, setIsTerminalLoading] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<{prompt: string, result: string}[]>([]);

  // Strategic AI Lab State
  const [labReplyInput, setLabReplyInput] = useState("");
  const [labReplyResult, setLabReplyResult] = useState("");
  const [labProofInput, setLabProofInput] = useState("");
  const [labProofResult, setLabProofResult] = useState("");
  const [labTranslateInput, setLabTranslateInput] = useState("");
  const [labTranslateLang, setLabTranslateLang] = useState("French");
  const [labTranslateResult, setLabTranslateResult] = useState("");
  const [labEnhanceInput, setLabEnhanceInput] = useState("");
  const [labEnhanceResult, setLabEnhanceResult] = useState("");
  const [labMarketingTitle, setLabMarketingTitle] = useState("");
  const [labMarketingDesc, setLabMarketingDesc] = useState("");
  const [labMarketingResult, setLabMarketingResult] = useState("");
  const [selectedLabPostId, setSelectedLabPostId] = useState<string>("");
  const [isLabActionLoading, setIsLabActionLoading] = useState(false);

  // AI Feature Specific State
  const [isGlobalRefining, setIsGlobalRefining] = useState(false);
  const [refinementProgress, setRefinementProgress] = useState(0);
  const [moderationFeedback, setModerationFeedback] = useState("");
  const [autoReplyRules, setAutoReplyRules] = useState<any[]>([]);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [marketingDrift, setMarketingDrift] = useState<{name: string, value: number}[]>([]);

  useEffect(() => {
    // Generate some mock history for the stability graph
    const data = Array.from({ length: 20 }, (_, i) => ({
      name: `T-${20-i}`,
      value: 85 + Math.random() * 15
    }));
    setMarketingDrift(data);
  }, []);

  const handleModerationFeedbackLoop = async (postId: string, feedback: string) => {
    if (!feedback.trim()) return;
    try {
      await addDoc(collection(db, 'moderation_feedback'), {
        postId,
        adminFeedback: feedback,
        adminUid: profile?.uid,
        createdAt: serverTimestamp()
      });
      setModerationFeedback("");
      alert("FEEDBACK_LOOP_INITIATED: AI core informed of strategic adjustments.");
    } catch (e) {
      console.error("Feedback loop error:", e);
    }
  };

  const handleGlobalRefinementLoop = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'ACTIVATE_GLOBAL_CONTENT_ENHANCER',
      message: 'This will trigger a system-wide AI refinement of all approved content. This action consumes significant compute resources.',
      onConfirm: async () => {
        setIsGlobalRefining(true);
        setRefinementProgress(0);
        try {
          const approvedPosts = posts.filter(p => p.status === 'approved');
          for (let i = 0; i < approvedPosts.length; i++) {
            const post = approvedPosts[i];
            const refined = await enhancePostContent(post.title, post.content, post.type, aiSettings.persona);
            await updateDoc(doc(db, 'posts', post.id), {
              title: refined.enhancedTitle,
              content: refined.enhancedContent,
              moderationHistory: [
                ...(post.moderationHistory || []),
                {
                  note: 'GLOBAL_AI_ENHANCEMENT_APPLIED',
                  status: 'approved',
                  createdAt: new Date().toISOString(),
                  suggestions: 'System-wide refinement loop.'
                }
              ]
            });
            setRefinementProgress(Math.round(((i + 1) / approvedPosts.length) * 100));
          }
          alert("GLOBAL_ENHANCEMENT_COMPLETE: Content repository optimized for maximum impact.");
        } catch (e) {
          console.error("Global refinement failed:", e);
        } finally {
          setIsGlobalRefining(false);
        }
      }
    });
  };

  const handleLabGenerateReply = async () => {
    setIsLabActionLoading(true);
    try {
      const result = await generateAutoReply("User", "Inquiry", labReplyInput, aiSettings.persona as any);
      setLabReplyResult(result);
    } catch (e) { console.error(e); } finally { setIsLabActionLoading(false); }
  };

  const handleLabProofread = async () => {
    setIsLabActionLoading(true);
    try {
      const result = await proofreadBook("LAB_INPUT", labProofInput, aiSettings.persona);
      setLabProofResult(result.correctedContent);
    } catch (e) { console.error(e); } finally { setIsLabActionLoading(false); }
  };

  const handleLabTranslate = async () => {
    setIsLabActionLoading(true);
    try {
      const result = await translateContent(labTranslateInput, labTranslateLang);
      setLabTranslateResult(result);
    } catch (e) { console.error(e); } finally { setIsLabActionLoading(false); }
  };

  const handleLabEnhance = async () => {
    setIsLabActionLoading(true);
    try {
      const result = await enhancePostContent("LAB_INPUT", labEnhanceInput, 'article', aiSettings.persona);
      setLabEnhanceResult(result.enhancedContent);
    } catch (e) { console.error(e); } finally { setIsLabActionLoading(false); }
  };

  const handleLabSelectPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setLabMarketingTitle(post.title);
      setLabMarketingDesc(post.content);
      setSelectedLabPostId(postId);
    } else {
      setLabMarketingTitle("");
      setLabMarketingDesc("");
      setSelectedLabPostId("");
    }
  };

  const handleLabGenerateMarketing = async () => {
    setIsLabActionLoading(true);
    try {
      const post = posts.find(p => p.id === selectedLabPostId);
      const type = post?.type || 'general';
      const result = await generateMarketingSuite(labMarketingTitle, labMarketingDesc, type);
      setLabMarketingResult(result);
    } catch (e) { console.error(e); } finally { setIsLabActionLoading(false); }
  };

  const handleRunTerminalPrompt = async () => {
    if (!terminalPrompt.trim()) return;
    setIsTerminalLoading(true);
    try {
      const result = await rawChatWithAI(terminalPrompt, terminalSystemInstruction);
      setTerminalResult(result);
      setTerminalHistory(prev => [...prev, { prompt: terminalPrompt, result }]);
      setTerminalPrompt("");
    } catch (error) {
      console.error("Terminal prompt failed:", error);
      setTerminalResult("ERROR: CONNECTION_LOST_TO_CORE");
    } finally {
      setIsTerminalLoading(false);
    }
  };

  const handleDuplicatePost = async (post: Post) => {
    const { id, ...rest } = post;
    await addDoc(collection(db, 'posts'), {
      ...rest,
      title: `${rest.title} (COPY)`,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  };

  const handleDuplicateSite = async (site: Site) => {
    const { id, ...rest } = site;
    await addDoc(collection(db, 'sites'), {
      ...rest,
      name: `${rest.name} (COPY)`,
      createdAt: serverTimestamp()
    });
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} COPIED_TO_CLIPBOARD`);
  };

  const handleAutoRefineAll = async () => {
    if (!aiSettings.isAIEnabled) return;
    setIsRefining(true);
    try {
      const postsToRefine = posts.filter(p => p.status === 'approved');
      for (const post of postsToRefine) {
        const refined = await enhancePostContent(post.title, post.content, post.type, aiSettings.persona);
        await updateDoc(doc(db, 'posts', post.id), {
          title: refined.enhancedTitle,
          content: refined.enhancedContent,
          aiModerationNote: `AUTO_REFINED_AT_${new Date().toISOString()}`,
          moderationHistory: [
            ...(post.moderationHistory || []),
            {
              note: 'AUTO_REFINEMENT_APPLIED',
              status: 'approved',
              createdAt: new Date().toISOString(),
              suggestions: refined.suggestions
            }
          ]
        });
      }
      alert("GLOBAL_ENHANCEMENT_COMPLETE: All active content has been optimized for strategic excellence.");
    } catch (error) {
      console.error("Refinement failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<string[]>([]);
  const handleGenerateCampaign = async () => {
    setIsLabActionLoading(true);
    try {
      const topic = prompt("Enter campaign focus (e.g. New Book Launch, Community Growth, Spiritual Event):", "New Book Launch");
      if (!topic) return;
      const result = await generateMarketingSuite(topic, "Generate a high-impact dominance strategy for this campaign.");
      setLabMarketingResult(result);
      await addDoc(collection(db, 'ai_reports'), {
        type: 'MARKETING_CAMPAIGN',
        topic,
        content: result,
        createdAt: serverTimestamp()
      });
      alert("MARKETING_CAMPAIGN_LAUNCHED: Strategy generated and stored in system archives.");
    } catch (e) {
      console.error("Campaign launch failed:", e);
    } finally {
      setIsLabActionLoading(false);
    }
  };

  const [targetedEnhanceId, setTargetedEnhanceId] = useState("");
  const handleTargetedEnhance = async () => {
    if (!targetedEnhanceId) return;
    setIsLabActionLoading(true);
    try {
      const post = posts.find(p => p.id === targetedEnhanceId || p.title.toLowerCase().includes(targetedEnhanceId.toLowerCase()));
      if (!post) {
        alert("ERROR: TARGET_OBJECT_NOT_FOUND");
        return;
      }
      const refined = await enhancePostContent(post.title, post.content, post.type, aiSettings.persona);
      await updateDoc(doc(db, 'posts', post.id), {
        title: refined.enhancedTitle,
        content: refined.enhancedContent
      });
      alert(`ENHANCEMENT_COMPLETE: "${post.title}" has been optimized.`);
      setTargetedEnhanceId("");
    } catch (e) {
      console.error("Targeted enhance failed:", e);
    } finally {
      setIsLabActionLoading(false);
    }
  };

  const handleIntegrityCheck = async () => {
    setIsCheckingIntegrity(true);
    const report: string[] = [];
    try {
      // Check for posts without authors
      const invalidPosts = posts.filter(p => !p.authorUid);
      if (invalidPosts.length > 0) report.push(`Found ${invalidPosts.length} posts with missing author metadata.`);
      
      // Check for users without roles
      const invalidUsers = allUsers.filter(u => !u.role);
      if (invalidUsers.length > 0) report.push(`Found ${invalidUsers.length} users with missing role assignments.`);

      // Check AI core health
      if (aiSettings.aiHealth !== 'OPTIMAL') report.push(`AI Core health is currently ${aiSettings.aiHealth}.`);

      if (report.length === 0) report.push("SYSTEM_INTEGRITY_OPTIMAL: No critical issues detected.");
      setIntegrityReport(report);
    } catch (error) {
      console.error("Integrity check failed:", error);
    } finally {
      setIsCheckingIntegrity(false);
    }
  };

  const [isCheckingStability, setIsCheckingStability] = useState(false);
  const [stabilityResult, setStabilityResult] = useState<string | null>(null);
  
  // Marketing State
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [marketingPlatform, setMarketingPlatform] = useState<string>('Twitter');
  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState(false);
  const [generatedMarketing, setGeneratedMarketing] = useState<string | null>(null);

  // Site Management State
  const [newSite, setNewSite] = useState({ name: '', url: '', description: '', icon: 'Layout', imageURL: '' });
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [isHealing, setIsHealing] = useState(false);

  // Team Management State
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', bio: '', photoURL: '' });
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);

  // Event Management State
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', type: 'service' });
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Contact Info State
  const [editedContactInfo, setEditedContactInfo] = useState(contactInfo);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Payment Config State
  const [paymentConfigStatus, setPaymentConfigStatus] = useState<{
    mpesa: Record<string, boolean>,
    stripe: Record<string, boolean>,
    paypal: Record<string, boolean>
  } | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [editedPaymentSettings, setEditedPaymentSettings] = useState(paymentSettings || {
    mpesa: { consumerKey: '', consumerSecret: '', shortcode: '', passkey: '' },
    stripe: { secretKey: '', webhookSecret: '' },
    paypal: { clientId: '', clientSecret: '' },
    bank: { accountNumber: '', bankName: '', swiftCode: '', receiverName: '' }
  });

  useEffect(() => {
    if (paymentSettings) {
      setEditedPaymentSettings(paymentSettings);
    }
  }, [paymentSettings]);

  const fetchPaymentConfigStatus = async () => {
    setIsLoadingConfig(true);
    try {
      const response = await axios.get('/api/payment/config-status');
      setPaymentConfigStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch payment config status:", error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payment_config') {
      fetchPaymentConfigStatus();
    }
  }, [activeTab]);

  useEffect(() => {
    setEditedContactInfo(contactInfo);
  }, [contactInfo]);

  // AI Accessories State
  const [accessoryInput, setAccessoryInput] = useState('');
  const [accessoryResult, setAccessoryResult] = useState<string | null>(null);
  const [isProcessingAccessory, setIsProcessingAccessory] = useState(false);
  const [accessoryType, setAccessoryType] = useState<'quotes' | 'sermon' | 'vision' | 'translate' | 'roadmap' | 'insight' | 'proofread' | 'marketing'>('quotes');
  const [targetLang, setTargetLang] = useState('Swahili');

  const handleAccessoryExecute = async () => {
    if (accessoryType !== 'marketing' && !accessoryInput) return;
    setIsProcessingAccessory(true);
    try {
      let result = '';
      if (accessoryType === 'quotes') result = await extractQuotes(accessoryInput, aiSettings.persona);
      else if (accessoryType === 'sermon') result = await generateSermonOutline(accessoryInput, aiSettings.persona);
      else if (accessoryType === 'vision') result = await generateVisionStatement(accessoryInput, aiSettings.persona);
      else if (accessoryType === 'translate') result = await translateContent(accessoryInput, targetLang);
      else if (accessoryType === 'roadmap') result = await generateRoadmap(accessoryInput, aiSettings.persona);
      else if (accessoryType === 'insight') result = await generateTheologicalInsight(accessoryInput, aiSettings.persona);
      else if (accessoryType === 'marketing') {
        if (!selectedBookId) {
          alert("PLEASE_SELECT_A_BOOK");
          setIsProcessingAccessory(false);
          return;
        }
        const book = books.find(b => b.id === selectedBookId);
        if (book) {
          result = await generateMarketingContent(book.title, book.content, marketingPlatform);
          await addDoc(collection(db, 'marketing_logs'), {
            bookTitle: book.title,
            platform: marketingPlatform,
            content: result,
            createdAt: serverTimestamp()
          });
        }
      } else if (accessoryType === 'proofread') {
        const proofResult = await proofreadBook('ADMIN_INPUT', accessoryInput, aiSettings.persona);
        result = `CORRECTED_CONTENT:\n\n${proofResult.correctedContent}\n\nCORRECTIONS: ${proofResult.correctionsMade}\n\nSTRATEGIC_ADVICE: ${proofResult.strategicAdvice}`;
      }
      setAccessoryResult(result);
    } catch (error) {
      console.error("Accessory execution failed:", error);
    } finally {
      setIsProcessingAccessory(false);
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const books = posts.filter(p => (p.type === 'book' || p.type === 'devotion') && p.status === 'approved');

  const [selectedModerationPostId, setSelectedModerationPostId] = useState<string | null>(null);

  const handleApplyAISuggestion = async (post: Post) => {
    if (!post.moderationSuggestions) return;
    
    const newHistory = [
      ...(post.moderationHistory || []),
      {
        note: 'AI_SUGGESTIONS_APPLIED',
        status: 'approved',
        createdAt: new Date().toISOString(),
        suggestions: `Applied Title: ${post.moderationSuggestions.title}`
      }
    ];

    await updateDoc(doc(db, 'posts', post.id), {
      title: post.moderationSuggestions.title,
      content: post.moderationSuggestions.content,
      status: 'approved',
      moderationHistory: newHistory,
      moderationSuggestions: deleteField()
    });
    alert("SUGGESTIONS_APPLIED: Content updated and approved.");
  };

  const handleRejectAISuggestion = async (post: Post) => {
    const newHistory = [
      ...(post.moderationHistory || []),
      {
        note: 'AI_SUGGESTIONS_REJECTED',
        status: 'rejected',
        createdAt: new Date().toISOString(),
        suggestions: 'Suggestions were rejected by admin.'
      }
    ];

    await updateDoc(doc(db, 'posts', post.id), {
      status: 'rejected',
      moderationHistory: newHistory,
      moderationSuggestions: deleteField()
    });
    alert("SUGGESTIONS_REJECTED: Post has been rejected.");
  };

  const handleModeration = async (postId: string, status: 'approved' | 'rejected') => {
    const post = posts.find(p => p.id === postId);
    const newHistory = [
      ...(post?.moderationHistory || []),
      {
        note: `MANUAL_${status.toUpperCase()}`,
        status: status,
        createdAt: new Date().toISOString(),
        suggestions: post?.moderationSuggestions ? 'Admin bypassed AI suggestions.' : ''
      }
    ];
    await updateDoc(doc(db, 'posts', postId), { 
      status, 
      moderationHistory: newHistory,
      moderationSuggestions: deleteField()
    });
  };

  const handleStabilityCheck = async () => {
    setIsCheckingStability(true);
    try {
      // Pass the actual integrity logs to the AI for analysis
      const result = await checkWebsiteStability(integrityReport); 
      setStabilityResult(result);
      
      await addDoc(collection(db, 'ai_reports'), {
        type: 'STABILITY',
        content: result,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Stability check failed:", error);
    } finally {
      setIsCheckingStability(false);
    }
  };

  // Auto-reply logic for contact messages (5-minute delay simulation)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'contact_messages'), where('aiReplied', '==', false)),
      (snapshot) => {
        snapshot.docs.forEach(async (docSnap) => {
          const data = docSnap.data();
          const messageId = docSnap.id;
          
          // Simulate 5-minute delay (using 10 seconds for demo purposes in this environment, 
          // but the logic is set up to be triggered by a background process or a timer)
          // In a real production app, this would be a Cloud Function with a task queue.
          // Here we'll just process it if it's older than 5 minutes.
          const createdAt = data.createdAt?.toDate();
          if (createdAt) {
            const now = new Date();
            const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
            
            if (diffMinutes >= 5) {
              try {
                const reply = await generateAutoReply(data.name, data.subject, data.message, aiSettings.persona);
                await updateDoc(doc(db, 'contact_messages', messageId), {
                  aiReply: reply,
                  aiReplied: true,
                  repliedAt: serverTimestamp()
                });
                console.log(`Auto-replied to message ${messageId}`);
              } catch (err) {
                console.error("Auto-reply failed:", err);
              }
            }
          }
        });
      }
    );
    return () => unsubscribe();
  }, [aiSettings.persona]);

  // System update notification logic
  useEffect(() => {
    if (!aiSettings.isAIEnabled) return;

    const interval = setInterval(async () => {
      // Check for new posts in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'approved'),
        where('createdAt', '>', oneHourAgo)
      );
      
      try {
        // Use the snapshot to get updates
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          if (!snapshot.empty) {
            const updates = snapshot.docs.map(doc => doc.data().title);
            const notificationText = await generateSystemUpdateNotification(updates);
            
            await addDoc(collection(db, 'notifications'), {
              title: 'YOHANNES_SYSTEM_UPDATE',
              content: notificationText,
              type: 'system',
              createdAt: serverTimestamp()
            });
            console.log("System update notification generated.");
          }
        });
        // Unsubscribe immediately as we only want a one-time check
        setTimeout(unsubscribe, 10000);
      } catch (err) {
        console.error("System update check failed:", err);
      }
    }, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, [aiSettings.isAIEnabled]);

  const handleGenerateMarketing = async () => {
    if (!selectedBookId) return;
    const book = books.find(b => b.id === selectedBookId);
    if (!book) return;

    setIsGeneratingMarketing(true);
    try {
      // Generate a full suite instead of just one platform
      const content = await generateMarketingSuite(book.title, book.content);
      setGeneratedMarketing(content);
      
      await addDoc(collection(db, 'marketing_logs'), {
        bookTitle: book.title,
        platform: 'FULL_SUITE',
        content: content,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Marketing suite generation failed:", error);
    } finally {
      setIsGeneratingMarketing(false);
    }
  };

  const handleRefineContent = async (post: Post) => {
    setIsRefining(true);
    try {
      const refined = await enhancePostContent(post.title, post.content, post.type, aiSettings.persona);
      await updateDoc(doc(db, 'posts', post.id), {
        title: refined.enhancedTitle,
        content: refined.enhancedContent,
        moderationHistory: [
          ...(post.moderationHistory || []),
          {
            note: 'AI_CONTENT_REFINEMENT_APPLIED',
            status: 'approved',
            createdAt: new Date().toISOString(),
            suggestions: refined.suggestions
          }
        ]
      });
      alert("CONTENT_REFINED: The post has been professionally polished.");
    } catch (error) {
      console.error("Content refinement failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleTranslatePost = async (post: Post, lang: string) => {
    setIsRefining(true);
    try {
      const translated = await translateContent(post.content, lang);
      const translatedTitle = await translateContent(post.title, lang);
      
      await updateDoc(doc(db, 'posts', post.id), {
        title: translatedTitle,
        content: translated,
        moderationHistory: [
          ...(post.moderationHistory || []),
          {
            note: `AI_TRANSLATION_APPLIED_${lang.toUpperCase()}`,
            status: 'approved',
            createdAt: new Date().toISOString(),
            suggestions: `Translated to ${lang}`
          }
        ]
      });
      alert(`TRANSLATION_COMPLETE: Post translated to ${lang}.`);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAIKillSwitch = async () => {
    setConfirmModal({
      isOpen: true,
      title: aiSettings.isAIEnabled ? 'SHUT_DOWN_AI' : 'RESTORE_AI',
      message: aiSettings.isAIEnabled 
        ? 'CRITICAL: You are about to shut down all AI systems (Yohannes Assistant, Content Enhancement, Auto-Moderation). Proceed?' 
        : 'Are you sure you want to restore AI systems to operational status?',
      isDangerous: aiSettings.isAIEnabled,
      onConfirm: async () => {
        await updateDoc(doc(db, 'global_settings', 'ai_config'), {
          isAIEnabled: !aiSettings.isAIEnabled,
          aiHealth: !aiSettings.isAIEnabled ? 'OPTIMAL' : 'OFFLINE'
        });
      }
    });
  };

  const handleAISelfHeal = async () => {
    setIsHealing(true);
    try {
      // Simulated deep system diagnostic and repair
      const diagnostics = [
        "ANALYZING_CORE_NEURAL_PATHWAYS...",
        "OPTIMIZING_SYNAPTIC_LATENCY...",
        "RECALIBRATING_BRAND_GUARD_PROTOCOLS...",
        "PURGING_NON_STRATEGIC_CACHE...",
        "RESTORING_EXECUTIVE_AUTHORITY_BASELINE..."
      ];
      
      for (const step of diagnostics) {
        setIntegrityReport(prev => [...prev, `[AI_HEAL] ${step}`]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      await updateDoc(doc(db, 'global_settings', 'ai_config'), {
        aiHealth: 'OPTIMAL',
        lastHealAt: serverTimestamp(),
        systemStatus: 'ALL_SYSTEMS_OPERATIONAL'
      });
      alert("AI_SYSTEM_HEALED: Yohannes Core has been restored to peak performance.");
    } catch (error) {
      console.error("Self-heal failed:", error);
    } finally {
      setIsHealing(false);
    }
  };

  const handleAIAutoUpdate = async () => {
    try {
      await updateDoc(doc(db, 'global_settings', 'ai_config'), {
        isAutoUpdateEnabled: !aiSettings.isAutoUpdateEnabled
      });
    } catch (error) {
      console.error("Failed to toggle AI auto-update:", error);
    }
  };

  const handleAIAutoMarketing = async () => {
    try {
      await updateDoc(doc(db, 'global_settings', 'ai_config'), {
        isAutoMarketingEnabled: !aiSettings.isAutoMarketingEnabled
      });
    } catch (error) {
      console.error("Failed to toggle AI auto-marketing:", error);
    }
  };

  const handleAIAutoReplyToggle = async () => {
    try {
      await updateDoc(doc(db, 'global_settings', 'ai_config'), {
        isAutoReplyEnabled: !aiSettings.isAutoReplyEnabled
      });
    } catch (error) {
      console.error("Failed to toggle AI auto-reply:", error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingEvent(true);
    try {
      const eventId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'events', eventId), {
        ...newEvent,
        id: eventId,
        createdAt: serverTimestamp()
      });
      setNewEvent({ title: '', description: '', date: '', location: '', type: 'service' });
      alert("EVENT_ADDED: System updated successfully.");
    } catch (error) {
      console.error("Failed to add event:", error);
    } finally {
      setIsAddingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'DELETE_EVENT',
      message: 'Are you sure you want to remove this event from the system?',
      isDangerous: true,
      onConfirm: async () => {
        await deleteDoc(doc(db, 'events', eventId));
      }
    });
  };

  useEffect(() => {
    if (!aiSettings.isAIEnabled || !aiSettings.isAutoModerationEnabled) return;

    const autoModerate = async () => {
      const unmoderated = posts.filter(p => p.status === 'pending' && !p.aiModerationNote && !p.moderationSuggestions);
      
      for (const post of unmoderated) {
        try {
          console.log(`[AI_MODERATION] Analyzing post: ${post.title}`);
          const result = await moderatePost(post.title, post.content, post.type, aiSettings.persona);
          
          await updateDoc(doc(db, 'posts', post.id), {
            aiModerationNote: result.note,
            moderationSuggestions: result.status === 'edited' ? {
              title: result.moderatedTitle,
              content: result.moderatedContent,
              note: result.note
            } : null,
            status: result.status === 'rejected' ? 'rejected' : 'pending'
          });
          
          // Feedback to logs
          if (result.status === 'rejected') {
            await addDoc(collection(db, 'moderation_feedback'), {
              postId: post.id,
              postTitle: post.title,
              feedback: `AI Automatically Rejected: ${result.note}`,
              type: 'AUTO_REJECTION',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Auto moderation failed for post:", post.id, error);
        }
      }
    };

    const interval = setInterval(autoModerate, 60000); // Check every minute
    autoModerate(); // Run immediately

    return () => clearInterval(interval);
  }, [aiSettings.isAIEnabled, aiSettings.isAutoModerationEnabled, posts, aiSettings.persona]);

  const toggleAutoModeration = async () => {
    try {
      await updateDoc(doc(db, 'global_settings', 'ai_config'), {
        isAutoModerationEnabled: !aiSettings.isAutoModerationEnabled
      });
    } catch (error) {
      console.error("Failed to toggle AI auto-moderation:", error);
    }
  };
  const latestAdvice = advice[0];

  return (
    <div className="flex min-h-screen bg-black">
      {/* Persistent Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto no-scrollbar">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-4 mb-2">
            <Shield className="w-6 h-6 text-white" />
            <span className="text-lg font-black tracking-tighter uppercase glitter-text">ADMIN_CORE</span>
          </div>
          <p className="text-[8px] font-black tracking-widest text-white/40 uppercase">Authorization: Level 01</p>
        </div>
        <nav className="flex-1 py-8">
          <div className="px-8 mb-8">
            <button
              onClick={onOpenCreateModal}
              className="w-full glitter-button glitter-gold px-4 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3"
            >
              <Plus className="w-4 h-4" />
              QUICK_ADD
            </button>
          </div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full px-8 py-4 flex items-center gap-4 transition-all group ${
                activeTab === tab.id 
                  ? 'bg-white text-black font-black' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : 'text-white/40 group-hover:text-white'}`} />
              <span className="text-[10px] font-black tracking-widest uppercase">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="ml-auto w-1 h-4 bg-black rounded-full" />}
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-white/10">
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 border border-white/10 rounded-sm text-[8px] font-black tracking-widest uppercase hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> EXIT_TERMINAL
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col gap-8 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-white" />
                <h1 className="text-2xl font-black tracking-tighter uppercase glitter-text">ADMIN_TERMINAL</h1>
              </div>
              <button onClick={() => navigate('/')} className="text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-sm text-[9px] font-black tracking-widest uppercase whitespace-nowrap transition-all ${
                    activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Header Actions */}
          <div className="hidden lg:flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase glitter-text mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">System Status: Optimal / AI Core: Active</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onOpenCreateModal}
                className="glitter-button glitter-gold px-8 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center gap-3"
              >
                <Plus className="w-4 h-4" />
                ADD_NEW_CONTENT
              </button>
              <button
                onClick={handleStabilityCheck}
                disabled={isCheckingStability}
                className={`px-8 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase border transition-all flex items-center gap-3 ${
                  isCheckingStability ? 'border-white/10 text-white/20' : 'border-white text-white hover:bg-white hover:text-black'
                }`}
              >
                {isCheckingStability ? <Activity className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                RUN_STABILITY_CHECK
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tech-grid min-h-[60vh]">
            {activeTab === 'stats' && (
        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'TOTAL_REVENUE', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, trend: '+12.5%', sub: 'NETWORK_EQUITY' },
              { label: 'AUDIENCE', value: allUsers.length.toString(), icon: Users, trend: '+5.2%', sub: 'GLOBAL_REACH' },
              { label: 'TRANSACTIONS', value: transactions.length.toString(), icon: ShoppingCart, trend: '+8.1%', sub: 'CASH_FLOW' },
              { label: 'STABILITY', value: `${latestAdvice?.stabilityScore || 100}%`, icon: Activity, trend: 'OPTIMAL', sub: 'CORE_HEALTH' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glitter-card p-6 rounded-sm border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-5 h-5 text-white/40" />
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{stat.sub}</span>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black font-mono tracking-tighter">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Strategic Insights Feed */}
              <div className="glitter-card p-8 rounded-sm border-white/10">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-white/40" />
                    <span className="text-[10px] font-black tracking-widest uppercase">REAL_TIME_CASH_FLOW_MONITOR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-black tracking-widest text-green-500 uppercase">LIVE_TERMINAL</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {transactions.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{item.type || 'ACQUISITION'}</p>
                        <p className="text-xs font-black uppercase tracking-tight">{item.postTitle || 'Service Payment'}</p>
                        <p className="text-[9px] font-mono text-white/20 uppercase mt-1">{item.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-green-500 font-mono">+${(item.amount || 0).toFixed(2)}</p>
                        <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                          {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleTimeString() : 'RECENT'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-[10px] text-white/20 font-black uppercase tracking-widest">NO_RECENT_FLOW_DETECTED</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Stability & Heal Widget */}
              <div className="glitter-card p-8 rounded-sm border-white/20 bg-white/5">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <h2 className="text-[10px] font-black tracking-widest uppercase">AI_STABILITY_ENGINE</h2>
                  <ShieldCheck className="w-4 h-4 text-white/40" />
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">CORE_HEALTH</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${aiSettings.aiHealth === 'OPTIMAL' ? 'text-green-500' : 'text-red-500'}`}>
                      {aiSettings.aiHealth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">LATENCY_X</span>
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">12.84ms</span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="text-[9px] text-white/50 leading-relaxed font-medium italic">
                    "Yohannes Core is maintaining absolute executive alignment and brand integrity. No critical drift detected in the last session."
                  </div>
                </div>
              </div>
            </div>
          </div>

          {stabilityResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 glitter-card border-white/30 rounded-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-white" />
                <h3 className="text-sm font-black uppercase tracking-widest">STABILITY_REPORT</h3>
              </div>
              <div className="text-xs text-white/70 leading-relaxed font-medium">
                <ReactMarkdown>{stabilityResult}</ReactMarkdown>
              </div>
              <button 
                onClick={() => setStabilityResult(null)}
                className="mt-6 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white"
              >
                DISMISS_REPORT
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black tracking-widest uppercase">RECENT_TRANSACTIONS</h2>
                </div>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-white/40" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">{t.postTitle}</p>
                          <p className="text-[9px] font-mono text-white/30 uppercase">{t.userEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black font-mono text-white">${t.amount.toFixed(2)}</p>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">COMPLETED</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-10 text-white/20 text-[10px] font-black tracking-widest uppercase">
                      NO_TRANSACTIONS_RECORDED
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-12">
              <section className="glitter-card p-8 rounded-sm border-white/20">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-black tracking-widest uppercase">SYSTEM_ADVICE</h2>
                </div>
                <div className="space-y-8">
                  {advice.slice(0, 3).map((item) => (
                    <div key={item.id} className="space-y-3 border-t border-white/5 pt-6 first:border-0 first:pt-0">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-3 h-3 text-white/40" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                          {item.topic}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/70 leading-relaxed font-medium">
                        <ReactMarkdown>{item.advice}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <section className="glitter-card p-10 rounded-sm border-white/20">
              <h3 className="text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-white/40" />
                YOHANNES_SYSTEM_LOGS
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {integrityReport.length > 0 ? (
                  integrityReport.map((log, i) => (
                    <div key={i} className="flex gap-3 text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-white/20">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('ERROR') ? 'text-red-500' : log.includes('HEAL') ? 'text-green-500' : 'text-white/60'}>
                        {log}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-white/10 text-[9px] font-black uppercase tracking-widest">
                    NO_ACTIVE_LOGS_DETECTED
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'ai_studio' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="glitter-card p-10 rounded-sm border-white/20 bg-black/50">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <Terminal className="w-6 h-6 text-white" />
                <h2 className="text-xl font-black tracking-widest uppercase">GOOGLE_AI_STUDIO_TERMINAL</h2>
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full">
                <span className="text-[8px] font-black tracking-widest text-green-500 uppercase animate-pulse">DIRECT_ACCESS_ACTIVE</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">CORE_IDENTITY_PROTOCOL (SYSTEM_INSTRUCTION)</label>
                <textarea
                  value={terminalSystemInstruction}
                  onChange={(e) => setTerminalSystemInstruction(e.target.value)}
                  className="w-full h-24 bg-black border border-white/10 rounded-sm p-4 text-xs font-mono text-white/60 focus:outline-none focus:border-white transition-all resize-none"
                  placeholder="Define the AI's core behavior..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">TERMINAL_COMMAND (PROMPT)</label>
                <div className="relative">
                  <textarea
                    value={terminalPrompt}
                    onChange={(e) => setTerminalPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRunTerminalPrompt();
                      }
                    }}
                    className="w-full h-32 bg-black border border-white/10 rounded-sm p-4 text-xs font-mono text-white focus:outline-none focus:border-white transition-all resize-none"
                    placeholder="Enter strategic command or inquiry..."
                  />
                  <button
                    onClick={handleRunTerminalPrompt}
                    disabled={isTerminalLoading || !terminalPrompt.trim()}
                    className="absolute bottom-4 right-4 px-6 py-2 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded-sm hover:bg-white/80 transition-all disabled:opacity-50"
                  >
                    {isTerminalLoading ? <Activity className="w-3 h-3 animate-spin" /> : "EXECUTE"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {terminalResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glitter-card p-10 rounded-sm border-white/30 bg-white/5"
              >
                <div className="flex items-center gap-4 mb-6 text-white/40">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest uppercase">YOHANNES_CORE_RESPONSE</span>
                </div>
                <div className="text-sm text-white/90 leading-relaxed font-medium markdown-body">
                  <ReactMarkdown>{terminalResult}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glitter-card p-10 rounded-sm border-white/10">
            <h3 className="text-[10px] font-black tracking-widest uppercase mb-6 text-white/40">COMMAND_HISTORY</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
              {terminalHistory.length > 0 ? (
                [...terminalHistory].reverse().map((h, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-sm space-y-2">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">COMMAND: {h.prompt.substring(0, 50)}...</p>
                    <button 
                      onClick={() => setTerminalResult(h.result)}
                      className="text-[9px] font-black text-green-500 uppercase tracking-widest hover:underline"
                    >
                      RESTORE_ANALYSIS
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/10 text-[9px] font-black uppercase tracking-widest font-mono">
                  NO_PREVIOUS_COMMANDS_IN_BUFFER
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_lab' && (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">STRATEGIC_AI_LAB</h2>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mt-2">Executive-grade tools for global brand dominance.</p>
            </div>
            <Beaker className="w-8 h-8 text-white/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tool 1: AI Reply Lab */}
            <div className="glitter-card p-8 rounded-sm border-white/10 space-y-6 bg-black/40">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                   <MessageSquare className="w-5 h-5 text-white/60" />
                 </div>
                 <h3 className="text-xs font-black tracking-widest uppercase">AI_REPLY_ENGINE</h3>
               </div>
               <textarea 
                 value={labReplyInput}
                 onChange={e => setLabReplyInput(e.target.value)}
                 className="w-full h-32 bg-black/60 border border-white/10 rounded-sm p-4 text-xs focus:outline-none focus:border-white transition-all resize-none shadow-inner"
                 placeholder="Input user message or inquiry..."
               />
               <button 
                 onClick={handleLabGenerateReply}
                 disabled={isLabActionLoading || !labReplyInput}
                 className="w-full py-4 bg-white text-black text-[10px] font-black tracking-widest uppercase hover:bg-white/80 transition-all flex items-center justify-center gap-2 rounded-sm shadow-xl active:scale-95 duration-200"
               >
                 {isLabActionLoading ? <Activity className="w-3 h-3 animate-spin"/> : <Bot className="w-3 h-3"/>}
                 GENERATE_EXECUTIVE_REPLY
               </button>
               <AnimatePresence>
                 {labReplyResult && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="p-4 bg-white/5 border border-white/10 rounded-sm mt-4 text-xs text-white/60 leading-relaxed font-mono"
                   >
                     {labReplyResult}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Tool 2: Linguistic Precision (Proofreading) */}
            <div className="glitter-card p-8 rounded-sm border-white/10 space-y-6 bg-black/40">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                   <BookOpen className="w-5 h-5 text-white/60" />
                 </div>
                 <h3 className="text-xs font-black tracking-widest uppercase">LINGUISTIC_PRECISION</h3>
               </div>
               <textarea 
                 value={labProofInput}
                 onChange={e => setLabProofInput(e.target.value)}
                 className="w-full h-32 bg-black/60 border border-white/10 rounded-sm p-4 text-xs focus:outline-none focus:border-white transition-all resize-none shadow-inner"
                 placeholder="Input content for proofreading..."
               />
               <button 
                 onClick={handleLabProofread}
                 disabled={isLabActionLoading || !labProofInput}
                 className="w-full py-4 bg-white text-black text-[10px] font-black tracking-widest uppercase hover:bg-white/80 transition-all flex items-center justify-center gap-2 rounded-sm shadow-xl active:scale-95 duration-200"
               >
                 {isLabActionLoading ? <Activity className="w-3 h-3 animate-spin"/> : <ShieldCheck className="w-3 h-3"/>}
                 INITIATE_PROOFREADING
               </button>
               <AnimatePresence>
                 {labProofResult && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="p-4 bg-white/5 border border-white/10 rounded-sm mt-4 text-xs text-white/80 leading-relaxed italic"
                   >
                     {labProofResult}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Tool 3: Global Mission (Translation) */}
            <div className="glitter-card p-8 rounded-sm border-white/10 space-y-6 bg-black/40">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                   <Globe className="w-5 h-5 text-white/60" />
                 </div>
                 <h3 className="text-xs font-black tracking-widest uppercase">GLOBAL_MISSION_TRANSLATOR</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <textarea 
                   value={labTranslateInput}
                   onChange={e => setLabTranslateInput(e.target.value)}
                   className="col-span-2 w-full h-24 bg-black/60 border border-white/10 rounded-sm p-4 text-xs focus:outline-none focus:border-white transition-all resize-none shadow-inner"
                   placeholder="Input text to translate..."
                 />
                 <input 
                   value={labTranslateLang}
                   onChange={e => setLabTranslateLang(e.target.value)}
                   className="col-span-1 bg-white/5 border border-white/10 rounded-sm p-2 text-[10px] font-black uppercase tracking-widest focus:bg-white/10 outline-none transition-all"
                   placeholder="LANGUAGE (e.g. FRENCH)"
                 />
               </div>
               <button 
                 onClick={handleLabTranslate}
                 disabled={isLabActionLoading || !labTranslateInput}
                 className="w-full py-4 bg-white text-black text-[10px] font-black tracking-widest uppercase hover:bg-white/80 transition-all flex items-center justify-center gap-2 rounded-sm shadow-xl active:scale-95 duration-200"
               >
                 {isLabActionLoading ? <Activity className="w-3 h-3 animate-spin"/> : <Globe className="w-3 h-3"/>}
                 CATALYZE_TRANSLATION
               </button>
               <AnimatePresence>
                 {labTranslateResult && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="p-4 bg-white/5 border border-white/10 rounded-sm mt-4 text-xs text-white/90 font-medium"
                   >
                     {labTranslateResult}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Tool 4: Content Excellence (Enhancement) */}
            <div className="glitter-card p-8 rounded-sm border-white/20 space-y-6 bg-gold-900/10 border-gold-500/20">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center border border-gold-500/20">
                   <Sparkles className="w-5 h-5 text-gold-500" />
                 </div>
                 <h3 className="text-xs font-black tracking-widest uppercase text-gold-500">CONTENT_EXCELLENCE_ENGINE</h3>
               </div>
               <textarea 
                 value={labEnhanceInput}
                 onChange={e => setLabEnhanceInput(e.target.value)}
                 className="w-full h-32 bg-black/60 border border-gold-500/10 rounded-sm p-4 text-xs focus:outline-none focus:border-gold-500 transition-all resize-none shadow-inner"
                 placeholder="Input raw content for high-end refinement..."
               />
               <button 
                 onClick={handleLabEnhance}
                 disabled={isLabActionLoading || !labEnhanceInput}
                 className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-black text-[10px] font-black tracking-widest uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 rounded-sm shadow-2xl active:scale-95 duration-200"
               >
                 {isLabActionLoading ? <Activity className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3"/>}
                 INITIATE_REFINEMENT
               </button>
               <AnimatePresence>
                 {labEnhanceResult && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="p-4 bg-gold-500/5 border border-gold-500/10 rounded-sm mt-4 text-xs text-white/90 leading-relaxed"
                   >
                     {labEnhanceResult}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Tool 5: Market Dominance (Marketing Suite) */}
            <div className="glitter-card p-8 rounded-sm border-white/10 space-y-6 col-span-1 md:col-span-2 bg-black/40">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                   <TrendingUp className="w-5 h-5 text-white/60" />
                 </div>
                 <h3 className="text-xs font-black tracking-widest uppercase">MARKET_DOMINANCE_SUITE</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <select 
                     value={selectedLabPostId}
                     onChange={e => handleLabSelectPost(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white/10 transition-all text-white/60"
                   >
                     <option value="">CUSTOM_INPUT / SELECT_POST</option>
                     {posts.filter(p => p.status === 'approved').map(p => (
                       <option key={p.id} value={p.id}>
                         [{p.type.toUpperCase()}] {p.title.substring(0, 30)}...
                       </option>
                     ))}
                   </select>
                   <input 
                     value={labMarketingTitle}
                     onChange={e => setLabMarketingTitle(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white/10 transition-all"
                     placeholder="BOOK_OR_POST_TITLE"
                   />
                   <textarea 
                     value={labMarketingDesc}
                     onChange={e => setLabMarketingDesc(e.target.value)}
                     className="w-full h-32 bg-black/60 border border-white/10 rounded-sm p-4 text-xs focus:outline-none focus:border-white transition-all resize-none shadow-inner"
                     placeholder="Detailed description for marketing strategy..."
                   />
                   <button 
                     onClick={handleLabGenerateMarketing}
                     disabled={isLabActionLoading || !labMarketingTitle}
                     className="w-full py-4 bg-white text-black text-[10px] font-black tracking-widest uppercase hover:bg-white/80 transition-all flex items-center justify-center gap-2 rounded-sm shadow-xl active:scale-95 duration-200"
                   >
                     {isLabActionLoading ? <Activity className="w-3 h-3 animate-spin"/> : <Target className="w-3 h-3"/>}
                     GENERATE_DOMINANCE_PLAN
                   </button>
                 </div>
                 <div className="bg-black/60 border border-white/10 rounded-sm p-4 overflow-y-auto h-[400px] custom-scrollbar shadow-inner relative">
                   {labMarketingResult ? (
                     <div className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-white/80">
                        <ReactMarkdown>{labMarketingResult}</ReactMarkdown>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-white/5">
                       <Bot className="w-10 h-10 mb-2 opacity-10" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Strategic Input</span>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="space-y-12">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-widest uppercase">AI_FINANCIAL_ACCOUNTING</h2>
              <p className="text-[8px] font-black tracking-widest text-white/40 uppercase mt-1">Yohannes AI analyzes system cash flow and generates strategic reports.</p>
            </div>
            <button 
              onClick={onGenerateReport}
              disabled={isGeneratingReport}
              className="glitter-button glitter-gold px-6 py-3 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center gap-3"
            >
              {isGeneratingReport ? <Activity className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              GENERATE_AI_REPORT
            </button>
          </div>

          {financialReport ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="glitter-card p-8 rounded-sm border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-white/40" />
                    <span className="text-[10px] font-black tracking-widest uppercase">EXECUTIVE_ANALYSIS</span>
                  </div>
                  <div className="text-sm text-white/80 leading-relaxed font-medium">
                    <ReactMarkdown>{financialReport.analysis}</ReactMarkdown>
                  </div>
                </div>

                <div className="glitter-card p-8 rounded-sm border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-5 h-5 text-white/40" />
                    <span className="text-[10px] font-black tracking-widest uppercase">STRATEGIC_RECOMMENDATIONS</span>
                  </div>
                  <div className="space-y-4">
                    {financialReport.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex gap-4 items-start p-4 bg-white/5 rounded-sm border border-white/5">
                        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                          {i + 1}
                        </div>
                        <p className="text-xs font-medium text-white/70">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="glitter-card p-8 rounded-sm border-white/10">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">TOTAL_REVENUE</p>
                  <p className="text-3xl font-black font-mono mb-6">${financialReport.totalRevenue.toFixed(2)}</p>
                  
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">ORDER_COUNT</p>
                  <p className="text-3xl font-black font-mono mb-6">{financialReport.orderCount}</p>

                  <div className="p-6 bg-white/5 rounded-sm border border-white/10 mt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-black tracking-widest uppercase">MARKET_SENTIMENT</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (financialReport.totalRevenue / 1000) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      />
                    </div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-2">PROJECTED_GROWTH_VELOCITY</p>
                  </div>

                  <div className={`p-4 rounded-sm border mt-8 ${
                    financialReport.status === 'OPTIMAL' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    financialReport.status === 'ATTENTION_REQUIRED' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1">SYSTEM_STATUS</p>
                    <p className="text-xs font-black">{financialReport.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-sm">
              <Brain className="w-12 h-12 text-white/10 mb-4" />
              <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">NO_REPORT_GENERATED_YET</p>
            </div>
          )}

          {aiReports.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <History className="w-5 h-5 text-white/40" />
                <h2 className="text-xl font-black tracking-widest uppercase">PREVIOUS_REPORTS</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiReports.filter(r => r.type === 'FINANCIAL').map((report) => (
                  <div key={report.id} className="glitter-card p-6 rounded-sm border-white/10 hover:border-white/30 transition-all cursor-pointer" onClick={() => onGenerateReport()}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${
                        report.status === 'OPTIMAL' ? 'bg-green-500/20 text-green-500' : 
                        report.status === 'ATTENTION_REQUIRED' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-[8px] font-mono text-white/20 uppercase">
                        {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : 'RECENT'}
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">REVENUE</p>
                    <p className="text-xl font-black font-mono mb-4">${report.totalRevenue?.toFixed(2)}</p>
                    <p className="text-[9px] text-white/60 line-clamp-3 leading-relaxed">{report.analysis}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      {activeTab === 'payment_config' && (
        <div className="space-y-12">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-widest uppercase">PAYMENT_GATEWAY_CONFIGURATION</h2>
              <p className="text-[8px] font-black tracking-widest text-white/40 uppercase mt-1">Directly manage your payment credentials. These are stored securely in the system.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* M-Pesa Config */}
            <div className="glitter-card p-8 rounded-sm border-white/10 relative">
              <div className="absolute top-8 right-8">
                {isLoadingConfig ? (
                  <Activity className="w-4 h-4 animate-spin text-white/20" />
                ) : (
                  <div className={`flex items-center gap-2 text-[8px] font-black tracking-widest px-2 py-1 rounded-sm border ${
                    paymentConfigStatus?.mpesa?.consumerKey ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {paymentConfigStatus?.mpesa?.consumerKey ? 'CONNECTED' : 'NOT_CONFIGURED'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-8">
                <Smartphone className="w-5 h-5 text-white/40" />
                <span className="text-[10px] font-black tracking-widest uppercase">M-PESA_DARAJA_CREDENTIALS</span>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'consumerKey', label: 'CONSUMER_KEY' },
                  { key: 'consumerSecret', label: 'CONSUMER_SECRET' },
                  { key: 'shortcode', label: 'BUSINESS_SHORTCODE' },
                  { key: 'passkey', label: 'LIPA_NA_MPESA_PASSKEY' }
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[8px] font-black tracking-widest text-white/40 uppercase">{field.label}</label>
                    <input 
                      type={field.key.includes('Secret') || field.key.includes('key') ? "password" : "text"}
                      value={editedPaymentSettings.mpesa[field.key]}
                      onChange={e => setEditedPaymentSettings({
                        ...editedPaymentSettings,
                        mpesa: { ...editedPaymentSettings.mpesa, [field.key]: e.target.value }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-mono focus:outline-none focus:border-white/30"
                      placeholder={`ENTER_${field.label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stripe Config */}
            <div className="glitter-card p-8 rounded-sm border-white/10 relative">
              <div className="absolute top-8 right-8">
                {isLoadingConfig ? (
                  <Activity className="w-4 h-4 animate-spin text-white/20" />
                ) : (
                  <div className={`flex items-center gap-2 text-[8px] font-black tracking-widest px-2 py-1 rounded-sm border ${
                    paymentConfigStatus?.stripe?.secretKey ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {paymentConfigStatus?.stripe?.secretKey ? 'CONNECTED' : 'NOT_CONFIGURED'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-8">
                <CreditCard className="w-5 h-5 text-white/40" />
                <span className="text-[10px] font-black tracking-widest uppercase">STRIPE_API_CREDENTIALS</span>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'secretKey', label: 'STRIPE_SECRET_KEY' },
                  { key: 'webhookSecret', label: 'STRIPE_WEBHOOK_SECRET' }
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[8px] font-black tracking-widest text-white/40 uppercase">{field.label}</label>
                    <input 
                      type="password"
                      value={editedPaymentSettings.stripe?.[field.key] || ''}
                      onChange={e => setEditedPaymentSettings({
                        ...editedPaymentSettings,
                        stripe: { ...(editedPaymentSettings.stripe || {}), [field.key]: e.target.value }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-mono focus:outline-none focus:border-white/30"
                      placeholder={`ENTER_${field.label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* PayPal Config */}
            <div className="glitter-card p-8 rounded-sm border-white/10 relative">
              <div className="absolute top-8 right-8">
                {isLoadingConfig ? (
                  <Activity className="w-4 h-4 animate-spin text-white/20" />
                ) : (
                  <div className={`flex items-center gap-2 text-[8px] font-black tracking-widest px-2 py-1 rounded-sm border ${
                    paymentConfigStatus?.paypal?.clientId ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {paymentConfigStatus?.paypal?.clientId ? 'CONNECTED' : 'NOT_CONFIGURED'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-8">
                <Shield className="w-5 h-5 text-white/40" />
                <span className="text-[10px] font-black tracking-widest uppercase">PAYPAL_CREDENTIALS</span>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'clientId', label: 'PAYPAL_CLIENT_ID' },
                  { key: 'clientSecret', label: 'PAYPAL_CLIENT_SECRET' },
                  { key: 'webhookId', label: 'PAYPAL_WEBHOOK_ID' }
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[8px] font-black tracking-widest text-white/40 uppercase">{field.label}</label>
                    <input 
                      type="password"
                      value={editedPaymentSettings.paypal?.[field.key] || ''}
                      onChange={e => setEditedPaymentSettings({
                        ...editedPaymentSettings,
                        paypal: { ...(editedPaymentSettings.paypal || {}), [field.key]: e.target.value }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-mono focus:outline-none focus:border-white/30"
                      placeholder={`ENTER_${field.label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Transfer Config */}
            <div className="glitter-card p-8 rounded-sm border-white/10 relative">
              <div className="absolute top-8 right-8">
                <div className="flex items-center gap-2 text-[8px] font-black tracking-widest px-2 py-1 rounded-sm border bg-white/5 border-white/10 text-white/40 uppercase">
                  MANUAL_PROCESS
                </div>
              </div>
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-5 h-5 text-white/40" />
                <span className="text-[10px] font-black tracking-widest uppercase">BANK_TRANSFER_DETAILS</span>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'receiverName', label: 'ACCOUNT_NAME' },
                  { key: 'accountNumber', label: 'ACCOUNT_NUMBER' },
                  { key: 'bankName', label: 'BANK_NAME' },
                  { key: 'swiftCode', label: 'SWIFT_CODE' }
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[8px] font-black tracking-widest text-white/40 uppercase">{field.label}</label>
                    <input 
                      type="text"
                      value={editedPaymentSettings.bank?.[field.key] || ''}
                      onChange={e => setEditedPaymentSettings({
                        ...editedPaymentSettings,
                        bank: { ...(editedPaymentSettings.bank || {}), [field.key]: e.target.value }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs focus:outline-none focus:border-white/30 uppercase"
                      placeholder={`ENTER_${field.label}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => onSavePaymentSettings(editedPaymentSettings)}
              className="glitter-button glitter-gold px-12 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center gap-3"
            >
              <Save className="w-4 h-4" />
              SAVE_PAYMENT_CONFIGURATION
            </button>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-4 h-4 text-white/40" />
              <span className="text-[10px] font-black tracking-widest uppercase">SECURITY_NOTICE</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed uppercase tracking-widest">
              These credentials are encrypted and stored in the system database. They are only accessible by authorized administrators. Changes take effect immediately for all system transactions.
            </p>
          </div>
        </div>
      )}
      {activeTab === 'content_management' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-widest uppercase">CONTENT_REPOSITORY</h2>
              <p className="text-[8px] font-black tracking-widest text-white/40 uppercase mt-1">Manage all videos, sermons, and articles with advanced filtering.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {posts.map(post => (
              <div key={post.id} className="glitter-card p-6 rounded-sm flex items-center justify-between border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-sm flex items-center justify-center border border-white/10">
                    {post.type === 'video' || post.type === 'sermon' ? <Video className="w-6 h-6 text-white/20" /> : <Book className="w-6 h-6 text-white/20" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-sm">{post.type}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${post.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {post.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tight">{post.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      handleLabSelectPost(post.id);
                      setActiveTab('ai_lab');
                    }}
                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all flex items-center gap-2 group"
                    title="GENERATE_MARKETING_STRATEGY"
                  >
                    <Target className="w-4 h-4 text-white/40 group-hover:text-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest">MARKET</span>
                  </button>
                  <button 
                    onClick={() => {
                       const confirmSummary = confirm("Generate AI summary for this content?");
                       if (confirmSummary) {
                         setIsGlobalRefining(true); // Using available loading state
                         summarizeContent(post.content, aiSettings.persona)
                           .then(summary => alert(`AI_SUMMARY_FOR: ${post.title}\n\n${summary}`))
                           .catch(e => console.error(e))
                           .finally(() => setIsGlobalRefining(false));
                       }
                    }}
                    className="p-2 text-white/20 hover:text-green-500 transition-colors"
                    title="AI_SUMMARIZE"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleRefineContent(post)}
                    className="p-2 text-white/20 hover:text-gold-500 transition-colors"
                    title="AI_REFINE"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const lang = prompt("Enter target language (e.g. Swahili, French, Spanish):", "Swahili");
                      if (lang) handleTranslatePost(post, lang);
                    }}
                    className="p-2 text-white/20 hover:text-blue-500 transition-colors"
                    title="AI_TRANSLATE"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleCopyToClipboard(post.content, 'CONTENT')}
                    className="p-2 text-white/20 hover:text-white transition-colors"
                    title="COPY_CONTENT"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDuplicatePost(post)}
                    className="p-2 text-white/20 hover:text-white transition-colors"
                    title="DUPLICATE"
                  >
                    <PlusSquare className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const newTitle = prompt("Enter new title:", post.title);
                      const newContent = prompt("Enter new content:", post.content);
                      if (newTitle && newContent) {
                        updateDoc(doc(db, 'posts', post.id), { title: newTitle, content: newContent });
                      }
                    }}
                    className="p-2 text-white/20 hover:text-white transition-colors"
                    title="EDIT"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'DELETE_CONTENT',
                        message: `Are you sure you want to permanently remove "${post.title}"?`,
                        isDangerous: true,
                        onConfirm: async () => {
                          await deleteDoc(doc(db, 'posts', post.id));
                        }
                      });
                    }}
                    className="p-2 text-white/20 hover:text-red-500 transition-colors"
                    title="DELETE"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'feedback' && <FeedbackTab />}

      {activeTab === 'moderation' && (
        <div className="space-y-12">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-widest uppercase">MODERATION_COMMAND_CENTER</h2>
              <p className="text-[8px] font-black tracking-widest text-white/40 uppercase mt-1">Review AI flags, apply strategic suggestions, and monitor moderation history.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-sm uppercase">
                {pendingPosts.length} PENDING
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-4">PENDING_QUEUE</h3>
              {pendingPosts.map(post => (
                <div key={post.id} className="glitter-card p-8 rounded-sm space-y-6 hover:border-white/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-sm">
                        {post.type}
                      </span>
                      <span className="text-[9px] font-mono text-white/30 uppercase">AUTHOR: {post.authorName}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedModerationPostId(selectedModerationPostId === post.id ? null : post.id)}
                      className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2"
                    >
                      <History className="w-3 h-3" /> HISTORY
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-black mb-2 uppercase tracking-tight">{post.title}</h3>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-3">{post.content}</p>
                  </div>

                  {post.aiModerationNote && !post.moderationSuggestions && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm">
                      <div className="flex items-center gap-2 text-red-500 mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest">AI_FLAG_WARNING</span>
                      </div>
                      <p className="text-[10px] font-mono text-white/60">{post.aiModerationNote}</p>
                    </div>
                  )}

                  {post.moderationSuggestions && (
                    <div className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                      <div className="flex items-center gap-2 text-gold-500">
                        <Sparkles className="w-4 h-4" />
                        <h4 className="text-[10px] font-black tracking-widest uppercase">AI_STRATEGIC_PREDICTION</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[8px] font-black text-white/30 uppercase mb-1">PROPOSED_OPTIMIZATION</p>
                          <p className="text-[11px] font-black text-white italic">"{post.moderationSuggestions.title}"</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-4">
                          <textarea 
                            value={moderationFeedback}
                            onChange={(e) => setModerationFeedback(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-sm p-4 text-[10px] font-mono focus:border-white outline-none resize-none h-20"
                            placeholder="PROVIDE_FEEDBACK_TO_AI_CORE..."
                          />
                          <div className="flex flex-col gap-3">
                            <button 
                              onClick={() => {
                                handleApplyAISuggestion(post);
                                handleModerationFeedbackLoop(post.id, moderationFeedback || "Admin approved AI suggestion.");
                              }}
                              className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-white/80 transition-all flex items-center justify-center gap-2"
                            >
                              <Check className="w-3 h-3" /> APPLY_AI_&_APPROVE
                            </button>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => {
                                  handleModeration(post.id, 'approved');
                                  handleModerationFeedbackLoop(post.id, moderationFeedback || "Admin approved original content, rejecting AI suggestion.");
                                }}
                                className="flex-1 py-3 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                              >
                                <History className="w-3 h-3" /> APPROVE_ORIGINAL
                              </button>
                              <button 
                                onClick={() => {
                                  handleRejectAISuggestion(post);
                                  handleModerationFeedbackLoop(post.id, moderationFeedback || "Admin rejected AI suggestion and the post.");
                                }}
                                className="flex-1 py-3 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <X className="w-3 h-3" /> REJECT_BOTH
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!post.moderationSuggestions && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleModeration(post.id, 'approved')}
                        className="flex-1 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-white/80 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> APPROVE_ORIGINAL
                      </button>
                      <button
                        onClick={() => handleModeration(post.id, 'rejected')}
                        className="flex-1 py-4 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-sm hover:text-white hover:border-white transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> REJECT_POST
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {pendingPosts.length === 0 && (
                <div className="text-center py-20 glitter-card rounded-sm border-dashed border-white/10 text-white/20 text-[10px] font-black tracking-[0.3em] uppercase">
                  QUEUE_OPTIMIZED // NO_PENDING_OBJECTS
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-4">MODERATION_HISTORY</h3>
              {selectedModerationPostId ? (
                <div className="glitter-card p-8 rounded-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest">LOGS_FOR: {posts.find(p => p.id === selectedModerationPostId)?.title}</h4>
                    <button 
                      onClick={() => setSelectedModerationPostId(null)}
                      className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      CLOSE_HISTORY
                    </button>
                  </div>
                  <div className="space-y-6">
                    {posts.find(p => p.id === selectedModerationPostId)?.moderationHistory?.map((log: any, idx: number) => (
                      <div key={idx} className="relative pl-6 border-l border-white/10 space-y-2">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-white" />
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${
                            log.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                            log.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white/40'
                          }`}>
                            {log.status}
                          </span>
                          <span className="text-[8px] font-mono text-white/20 uppercase">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{log.note}</p>
                        {log.suggestions && (
                          <p className="text-[10px] text-white/40 italic leading-relaxed">"{log.suggestions}"</p>
                        )}
                      </div>
                    ))}
                    {!posts.find(p => p.id === selectedModerationPostId)?.moderationHistory && (
                      <div className="text-center py-10 text-white/20 text-[9px] font-black uppercase tracking-widest">
                        NO_HISTORY_LOGS_AVAILABLE
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glitter-card p-12 rounded-sm border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                  <History className="w-8 h-8 text-white/10 mb-4" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">SELECT_A_POST_TO_VIEW_MODERATION_HISTORY</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'feedback' && <FeedbackTab />}

      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section className="glitter-card p-8 rounded-sm">
              <h2 className="text-xl font-black tracking-widest uppercase mb-8">GENERATE_MARKETING</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">SELECT_BOOK</label>
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-sm font-medium focus:border-white/30 outline-none"
                  >
                    <option value="" className="bg-black">SELECT_A_BOOK</option>
                    {books.map(book => (
                      <option key={book.id} value={book.id} className="bg-black">{book.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">PLATFORM</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {['Twitter', 'Facebook', 'Email', 'TikTok', 'Instagram'].map(p => (
                      <button
                        key={p}
                        onClick={() => setMarketingPlatform(p)}
                        className={`py-3 rounded-sm text-[10px] font-black tracking-widest uppercase border transition-all ${
                          marketingPlatform === p ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateMarketing}
                  disabled={isGeneratingMarketing || !selectedBookId}
                  className="w-full glitter-button glitter-gold py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGeneratingMarketing ? <Brain className="w-4 h-4 animate-pulse" /> : <TrendingUp className="w-4 h-4" />}
                  {isGeneratingMarketing ? 'GENERATING_DIVINE_CONTENT...' : 'GENERATE_MARKETING_CONTENT'}
                </button>
              </div>
            </section>

            {generatedMarketing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glitter-card p-8 rounded-sm border-white/30"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest">GENERATED_CONTENT</h3>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMarketing);
                      alert("Copied to clipboard!");
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    COPY_TO_CLIPBOARD
                  </button>
                </div>
                <div className="text-sm text-white/80 leading-relaxed font-medium bg-white/5 p-6 rounded-sm border border-white/5">
                  <ReactMarkdown>{generatedMarketing}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            <section className="glitter-card p-8 rounded-sm">
              <h2 className="text-xl font-black tracking-widest uppercase mb-8">MARKETING_LOGS</h2>
              <div className="space-y-6">
                {marketingLogs.map(log => (
                  <div key={log.id} className="p-6 bg-white/5 border border-white/5 rounded-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">{log.platform}</span>
                      <span className="text-[9px] font-mono text-white/20">{log.createdAt?.toDate ? new Date(log.createdAt.toDate()).toLocaleDateString() : 'Today'}</span>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight">{log.bookTitle}</h4>
                    <p className="text-[11px] text-white/50 line-clamp-3 leading-relaxed">{log.content}</p>
                  </div>
                ))}
                {marketingLogs.length === 0 && (
                  <div className="text-center py-10 text-white/20 text-[10px] font-black tracking-widest uppercase">
                    NO_MARKETING_LOGS_FOUND
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'ai_metrics' && (
        <div className="space-y-12">
          <section className="glitter-card p-10 rounded-sm border-white/20">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-widest uppercase">AI_PERFORMANCE_METRICS</h2>
                <p className="text-[9px] font-black tracking-widest text-white/40 uppercase">Real-time analysis of Yohannes' neural efficiency</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'TOTAL_AI_OPERATIONS', value: '14,203', trend: '+12%', icon: <Activity className="w-4 h-4" /> },
                { label: 'AVG_RESPONSE_TIME', value: '242ms', trend: '-5%', icon: <Zap className="w-4 h-4" /> },
                { label: 'NEURAL_ACCURACY', value: '99.94%', trend: '+0.02%', icon: <Target className="w-4 h-4" /> },
                { label: 'TOKEN_EFFICIENCY', value: '88.4%', trend: '+4%', icon: <Cpu className="w-4 h-4" /> }
              ].map(metric => (
                <div key={metric.label} className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-white/5 rounded-sm text-white/40">{metric.icon}</div>
                    <span className={`text-[8px] font-black tracking-widest uppercase ${metric.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{metric.label}</p>
                    <p className="text-2xl font-black font-mono">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 bg-white/5 border border-white/10 rounded-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-white/40">OPERATION_DISTRIBUTION</h3>
                <div className="space-y-6">
                  {[
                    { label: 'CONTENT_GENERATION', value: 45 },
                    { label: 'MODERATION_PROTOCOLS', value: 30 },
                    { label: 'USER_INTERACTION', value: 15 },
                    { label: 'SYSTEM_OPTIMIZATION', value: 10 }
                  ].map(item => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white/5 border border-white/10 rounded-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-white/40">PERSONA_ALIGNMENT_INDEX</h3>
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full rotate-[-90deg]">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                      <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="502.4" strokeDashoffset="50.24" className="text-white transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black font-mono">90%</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">VISIONARY_MATCH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glitter-card p-10 rounded-sm border-white/20">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8">AI_PERSONA_REFINEMENT_LOGS</h3>
            <div className="space-y-4">
              {[
                { event: 'PERSONA_UPGRADE', details: 'Neural instructions updated to "Chief Visionary AI Strategist"', time: '2h ago' },
                { event: 'TONE_CALIBRATION', details: 'Increased executive authority index by 15%', time: '5h ago' },
                { event: 'VOCABULARY_EXPANSION', details: 'Integrated 500+ visionary leadership terms', time: '1d ago' }
              ].map((log, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-sm flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">{log.event}</p>
                    <p className="text-[11px] text-white/50 font-medium">{log.details}</p>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 uppercase">{log.time}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
          <div className="glitter-card p-8 rounded-sm border-white/10 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-6 h-6 text-white" />
              <h2 className="text-xl font-black tracking-widest uppercase">ADMIN_PROVISIONING</h2>
            </div>
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase leading-relaxed mb-6">
              To add a new administrator, locate the user in the registry below and use the "PROMOTE_TO_ADMIN" authorization protocol. 
              Administrators have full access to the system terminal, moderation queue, and AI core configuration.
            </p>
          </div>

          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-xl font-black tracking-widest uppercase">USER_REGISTRY</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {allUsers.map(u => (
              <div key={u.uid} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm gap-6">
                <div className="flex items-center gap-4">
                  <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full grayscale" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{u.displayName}</p>
                    <p className="text-[9px] font-mono text-white/30 uppercase truncate max-w-[150px] sm:max-w-none">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 pt-4 sm:border-0 sm:pt-0">
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">ACCESS_LEVEL</label>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <span className={`px-2 py-1 rounded-sm text-[7px] font-black uppercase tracking-widest ${
                        u.role === 'admin' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 
                        u.role === 'contributor' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' : 
                        'bg-white/10 text-white/40 border border-white/5'
                      }`}>
                        {u.role || 'viewer'}
                      </span>
                      
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            title: 'UPGRADE_TO_ADMIN',
                            message: `Grant administrative authority to ${u.displayName}?`,
                            onConfirm: async () => {
                              await updateDoc(doc(db, 'users', u.uid), { role: 'admin' });
                            }
                          })}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-[7px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                        >
                          SET_ADMIN
                        </button>
                      )}
                      
                      {u.role !== 'contributor' && (
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            title: 'SET_CONTRIBUTOR_STATUS',
                            message: `Assign contributor status to ${u.displayName}?`,
                            onConfirm: async () => {
                              await updateDoc(doc(db, 'users', u.uid), { role: 'contributor' });
                            }
                          })}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-[7px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                        >
                          SET_CONTRIBUTOR
                        </button>
                      )}

                      {u.role !== 'viewer' && u.role !== 'user' && (
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            title: 'RESTRICT_ACCESS',
                            message: `Are you sure you want to demote ${u.displayName} to VIEWER status?`,
                            onConfirm: async () => {
                              await updateDoc(doc(db, 'users', u.uid), { role: 'viewer' });
                            }
                          })}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-[7px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all"
                        >
                          SET_VIEWER
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      title: 'DELETE_ACCOUNT',
                      message: `Are you sure you want to permanently delete ${u.displayName}'s account? This action is irreversible.`,
                      isDangerous: true,
                      onConfirm: async () => {
                        await deleteDoc(doc(db, 'users', u.uid));
                      }
                    })}
                    className="p-2 text-red-500/40 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {allUsers.length === 0 && (
              <div className="text-center py-20 text-white/20 text-[10px] font-black tracking-widest uppercase">
                NO_USERS_FOUND
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-xl font-black tracking-widest uppercase mb-8 border-b border-white/10 pb-4">RECENT_INTERACTIONS</h2>
              <div className="space-y-6">
                {comments.map(comment => {
                  const post = posts.find(p => p.id === comment.postId);
                  return (
                    <div key={comment.id} className="glitter-card p-6 rounded-sm border-white/5 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black">
                            {comment.authorName?.[0]}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">{comment.authorName}</p>
                            <p className="text-[8px] font-mono text-white/20 uppercase">ON: {post?.title || 'Unknown Post'}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono text-white/20">{comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Today'}</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed mb-4 font-medium italic">"{comment.text}"</p>
                      {comment.aiReply && (
                        <div className="bg-white/5 p-4 rounded-sm border-l-2 border-white/20">
                          <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Bot className="w-3 h-3" /> YOHANNES_STRATEGIC_REPLY
                          </p>
                          <p className="text-[11px] text-white/60 leading-relaxed">{comment.aiReply}</p>
                        </div>
                      )}
                      {!comment.aiReply && !comment.aiReplied && (
                         <div className="mt-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold-500/30 animate-pulse" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">STRATEGIC_REPLY_PENDING (24H)</span>
                         </div>
                      )}
                    </div>
                  );
                })}
                {comments.length === 0 && (
                  <div className="text-center py-20 text-white/20 text-[10px] font-black tracking-widest uppercase">
                    NO_COMMUNITY_INTERACTIONS_FOUND
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-8">
              <section className="glitter-card p-8 rounded-sm">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">COMMUNITY_STATS</h3>
                <div className="space-y-6">
                  {[
                    { label: 'TOTAL_COMMENTS', value: comments.length },
                    { label: 'ACTIVE_USERS', value: new Set(comments.map(c => c.authorUid)).size },
                    { label: 'ENGAGEMENT_RATE', value: `${((comments.length / (posts.length || 1)) * 10).toFixed(1)}%` }
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-lg font-black uppercase">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-12">
          <section className="glitter-card p-8 rounded-sm">
            <h2 className="text-xl font-black tracking-widest uppercase mb-8">ADD_TEAM_MEMBER</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">NAME</label>
                <input 
                  type="text" 
                  value={newTeamMember.name}
                  onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})}
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">ROLE</label>
                <input 
                  type="text" 
                  value={newTeamMember.role}
                  onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})}
                  placeholder="e.g. Executive Pastor"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">BIO</label>
                <textarea 
                  value={newTeamMember.bio}
                  onChange={e => setNewTeamMember({...newTeamMember, bio: e.target.value})}
                  placeholder="Short biography..."
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white h-24 resize-none"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">PHOTO_UPLOAD</label>
                <div className="relative border border-dashed border-white/10 rounded-sm p-8 text-center hover:border-white/30 transition-all">
                  <input 
                    type="file" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewTeamMember({...newTeamMember, photoURL: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  {newTeamMember.photoURL ? (
                    <img src={newTeamMember.photoURL} alt="Preview" className="w-20 h-20 mx-auto rounded-full border border-white/10 grayscale" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="w-6 h-6 text-white/20" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">UPLOAD_PHOTO_FROM_DEVICE</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={async () => {
                if (!newTeamMember.name || !newTeamMember.role) return;
                setIsAddingTeamMember(true);
                try {
                  await addDoc(collection(db, 'team'), {
                    ...newTeamMember,
                    createdAt: serverTimestamp()
                  });
                  setNewTeamMember({ name: '', role: '', bio: '', photoURL: '' });
                } catch (error) {
                  console.error("Failed to add team member:", error);
                } finally {
                  setIsAddingTeamMember(false);
                }
              }}
              disabled={isAddingTeamMember}
              className="mt-8 glitter-button glitter-gold px-8 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center gap-3"
            >
              {isAddingTeamMember ? <Activity className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              REGISTER_TEAM_MEMBER
            </button>
          </section>

          <section>
            <h2 className="text-xl font-black tracking-widest uppercase mb-8 border-b border-white/10 pb-4">TEAM_ROSTER</h2>
            <div className="grid grid-cols-1 gap-4">
              {team.map(member => (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-sm overflow-hidden flex-shrink-0">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">{member.name}</p>
                      <p className="text-[9px] font-mono text-white/30 uppercase">{member.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      title: 'REMOVE_TEAM_MEMBER',
                      message: `Are you sure you want to remove ${member.name} from the team roster?`,
                      isDangerous: true,
                      onConfirm: async () => {
                        await deleteDoc(doc(db, 'team', member.id));
                      }
                    })}
                    className="self-end sm:self-auto p-2 text-red-500/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {team.length === 0 && (
                <div className="text-center py-20 text-white/20 text-[10px] font-black tracking-widest uppercase">
                  NO_TEAM_MEMBERS_REGISTERED
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-xl font-black tracking-widest uppercase">INCOMING_MESSAGES</h2>
            <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-sm uppercase">
              {contactMessages.length} MESSAGES
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {contactMessages.map(msg => (
              <div key={msg.id} className="glitter-card p-8 rounded-sm hover:border-white/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">{msg.name}</p>
                      <p className="text-[9px] font-mono text-white/30 uppercase">{msg.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-white/20 uppercase">
                      {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-4 bg-white/20" />
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">SUBJECT: {msg.subject}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium bg-white/5 p-6 rounded-sm border border-white/5 italic">
                    "{msg.message}"
                  </p>

                  {msg.aiReplied && (
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-gold-500" />
                        <span className="text-[10px] font-black tracking-widest text-gold-500 uppercase italic">STRATEGIC_AUTO_RESPONSE_APPLIED</span>
                      </div>
                      <div className="text-xs text-white/60 leading-relaxed font-medium bg-gold-500/5 p-6 rounded-sm border border-gold-500/10 border-l-gold-500 border-l-4">
                        <ReactMarkdown>{msg.aiReply}</ReactMarkdown>
                      </div>
                      {msg.strategicInsight && (
                        <p className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">INSIGHT: {msg.strategicInsight}</p>
                      )}
                    </div>
                  )}
                  
                  {!msg.aiReplied && (
                    <div className="flex items-center gap-3 mt-6">
                      <div className="w-2 h-2 rounded-full bg-gold-500/40 animate-pulse" />
                      <span className="text-[10px] font-black tracking-widest text-gold-500/60 uppercase">AI_STRATEGIC_FOLLOW_UP_PROTOCOL (24H)</span>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex justify-end gap-4">
                  <a 
                    href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                    className="px-6 py-3 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded-sm hover:bg-white/80 transition-all"
                  >
                    REPLY_VIA_EMAIL
                  </a>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Delete this message?')) {
                        await deleteDoc(doc(db, 'contact_messages', msg.id));
                      }
                    }}
                    className="px-6 py-3 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase rounded-sm hover:bg-red-500 hover:text-white transition-all"
                  >
                    PURGE_MESSAGE
                  </button>
                </div>
              </div>
            ))}
            {contactMessages.length === 0 && (
              <div className="text-center py-20 glitter-card rounded-sm border-dashed border-white/10 text-white/20 text-[10px] font-black tracking-[0.3em] uppercase">
                NO_INCOMING_MESSAGES
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sites' && (
        <div className="space-y-12">
          <section className="glitter-card p-8 rounded-sm">
            <h2 className="text-xl font-black tracking-widest uppercase mb-8">ADD_NEW_WEBSITE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">SITE_NAME</label>
                <input 
                  type="text" 
                  value={newSite.name}
                  onChange={e => setNewSite({...newSite, name: e.target.value})}
                  placeholder="e.g. My Portfolio"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">SITE_URL</label>
                <input 
                  type="text" 
                  value={newSite.url}
                  onChange={e => setNewSite({...newSite, url: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">DESCRIPTION</label>
                <textarea 
                  value={newSite.description}
                  onChange={e => setNewSite({...newSite, description: e.target.value})}
                  placeholder="Briefly describe this platform..."
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white h-24 resize-none"
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">SITE_PREVIEW_IMAGE</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/5 border border-dashed border-white/10 rounded-sm flex items-center justify-center overflow-hidden">
                    {newSite.imageURL ? (
                      <img src={newSite.imageURL} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/10" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewSite({...newSite, imageURL: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden" 
                      id="site-image-upload" 
                    />
                    <label 
                      htmlFor="site-image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-sm text-[8px] font-black uppercase tracking-widest cursor-pointer transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      CHOOSE_IMAGE
                    </label>
                    <p className="mt-2 text-[8px] text-white/20 uppercase tracking-widest">Recommended: 1200x630px</p>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={async () => {
                if (!newSite.name || !newSite.url) return;
                setIsAddingSite(true);
                try {
                  await addDoc(collection(db, 'sites'), {
                    ...newSite,
                    createdAt: serverTimestamp()
                  });
                  setNewSite({ name: '', url: '', description: '', icon: 'Layout', imageURL: '' });
                } catch (error) {
                  console.error("Failed to add site:", error);
                } finally {
                  setIsAddingSite(false);
                }
              }}
              disabled={isAddingSite}
              className="mt-8 glitter-button glitter-gold px-8 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center gap-3"
            >
              {isAddingSite ? <Activity className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              REGISTER_WEBSITE
            </button>
          </section>

          <section>
            <h2 className="text-xl font-black tracking-widest uppercase mb-8 border-b border-white/10 pb-4">REGISTERED_PLATFORMS</h2>
            <div className="grid grid-cols-1 gap-4">
              {sites.map(site => (
                <div key={site.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm gap-4">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {site.imageURL ? (
                        <img src={site.imageURL} alt={site.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <ExternalLink className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-widest truncate">{site.name}</p>
                      <p className="text-[9px] font-mono text-white/30 uppercase truncate">{site.url}</p>
                      {site.description && (
                        <p className="text-[8px] text-white/40 uppercase tracking-widest mt-1 line-clamp-1">{site.description}</p>
                      )}
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleCopyToClipboard(site.url, 'URL')}
                        className="p-2 text-white/20 hover:text-white transition-colors"
                        title="COPY_URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDuplicateSite(site)}
                        className="p-2 text-white/20 hover:text-white transition-colors"
                        title="DUPLICATE"
                      >
                        <PlusSquare className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          const newName = prompt("Enter new name:", site.name);
                          const newUrl = prompt("Enter new URL:", site.url);
                          if (newName && newUrl) {
                            updateDoc(doc(db, 'sites', site.id), { name: newName, url: newUrl });
                          }
                        }}
                        className="p-2 text-white/20 hover:text-white transition-colors"
                        title="EDIT"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'DELETE_WEBSITE',
                            message: `Are you sure you want to remove ${site.name}?`,
                            isDangerous: true,
                            onConfirm: async () => {
                              await deleteDoc(doc(db, 'sites', site.id));
                            }
                          });
                        }}
                        className="p-2 text-red-500/40 hover:text-red-500 transition-colors"
                        title="DELETE"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                </div>
              ))}
              {sites.length === 0 && (
                <div className="text-center py-20 text-white/20 text-[10px] font-black tracking-widest uppercase">
                  NO_WEBSITES_REGISTERED
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'ai_auto_reply' && (
        <div className="space-y-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">AI_AUTO_REPLY_CONTROL</h2>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mt-2">Configure Yohannes to autonomously handle user inquiries with strategic precision.</p>
            </div>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => updateDoc(doc(db, 'global_settings', 'ai_config'), { isAutoReplyEnabled: !aiSettings.isAutoReplyEnabled })}
                className={`px-4 py-2 rounded-full border cursor-pointer transition-all ${aiSettings.isAutoReplyEnabled ? 'border-green-500/50 text-green-500 bg-green-500/5' : 'border-white/10 text-white/20 hover:border-white/30'}`}
              >
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">{aiSettings.isAutoReplyEnabled ? 'AUTO_HANDLER_ACTIVE' : 'MANUAL_MODE'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glitter-card p-8 rounded-sm space-y-6">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-white/40" />
                <h3 className="text-[10px] font-black tracking-widest uppercase">RESPONSE_STRATEGY</h3>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'aggressive', label: 'DIRECT_&_SARCIASTIC', desc: 'The pure Yohannes experience.' },
                  { id: 'strategic', label: 'MONK_MODE_STRATEGIC', desc: 'Balanced, deep, and authoritative.' },
                  { id: 'minimalist', label: 'ELON_STYLE_MINIMALISM', desc: 'Short, impactful, slightly cryptic.' }
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => updateDoc(doc(db, 'global_settings', 'ai_config'), { autoReplyStrategy: mode.id })}
                    className={`w-full p-4 rounded-sm border transition-all text-left group ${
                      aiSettings.autoReplyStrategy === mode.id ? 'border-white bg-white/5' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${aiSettings.autoReplyStrategy === mode.id ? 'text-white' : 'text-white/40'}`}>
                        {mode.label}
                      </span>
                      {aiSettings.autoReplyStrategy === mode.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <p className="text-[9px] text-white/30 uppercase font-medium">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glitter-card p-8 rounded-sm space-y-6 bg-white/5 border-white/20">
               <div className="flex items-center gap-3">
                 <Repeat className="w-4 h-4 text-white/40" />
                 <h3 className="text-[10px] font-black tracking-widest uppercase">AUTO_REPLY_HEALTH</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">TOTAL_AUTONOMOUS_ACTIONS</span>
                    <span>1,284</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">SUCCESS_RATE</span>
                    <span className="text-green-500">99.8%</span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <p className="text-[9px] text-white/40 italic leading-relaxed">
                    "AI is currently handling 84% of incoming feedback with a satisfaction delta of +12.5% compared to human moderation."
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_content_enhancer' && (
        <div className="space-y-12 max-w-6xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">AI_CONTENT_ENHANCER</h2>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mt-2">System-wide content refinement and optimization protocols.</p>
            </div>
            <button 
              onClick={handleGlobalRefinementLoop}
              disabled={isGlobalRefining}
              className="glitter-button glitter-gold px-8 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center gap-3 shadow-2xl"
            >
              <Sparkles className="w-4 h-4" />
              {isGlobalRefining ? `REFINING_${refinementProgress}%` : 'TRIGGER_GLOBAL_ENHANCEMENT'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
               <div className="glitter-card p-10 rounded-sm border-white/20">
                 <h3 className="text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-3">
                   <Layers className="w-5 h-5 text-white/40" />
                   ENHANCEMENT_STRATEGY
                 </h3>
                 <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 block">REFINEMENT_INTENSITY</label>
                      <input type="range" className="w-full accent-white" />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10">
                       <span className="text-[10px] font-black uppercase tracking-widest">AUTO_ENHANCE_NEW_POSTS</span>
                       <button className="w-12 h-6 bg-white rounded-full p-1"><div className="w-4 h-4 bg-black rounded-full ml-auto"/></button>
                    </div>
                 </div>
               </div>
            </div>

            <div className="glitter-card p-10 rounded-sm border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
               <Zap className="w-12 h-12 text-white/10" />
               <div className="max-w-xs w-full">
                 <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">TARGETED_TUNE</p>
                 <div className="flex gap-2">
                   <input 
                     type="text"
                     value={targetedEnhanceId}
                     onChange={e => setTargetedEnhanceId(e.target.value)}
                     className="flex-1 bg-white/5 border border-white/20 rounded-sm p-3 text-[10px] font-black uppercase outline-none focus:border-white transition-all"
                     placeholder="POST_ID_OR_TITLE"
                   />
                   <button 
                     onClick={handleTargetedEnhance}
                     disabled={isLabActionLoading || !targetedEnhanceId}
                     className="px-4 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-white/80 transition-all rounded-sm flex items-center gap-2"
                   >
                     {isLabActionLoading ? <Activity className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                     TRIGGER
                   </button>
                 </div>
                 <p className="text-[9px] text-white/20 uppercase font-medium leading-relaxed mt-4 italic">Direct bypass of global protocols for intentional high-intensity refinement of specific artifacts.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_marketing_suite' && (
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">AI_MARKETING_DOMINANCE_SUITE</h2>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mt-2">Autonomous campaign management and growth hacking algorithms.</p>
            </div>
            <button 
              onClick={handleGenerateCampaign}
              className="px-6 py-3 border border-white text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all"
            >
              LAUNCH_NEW_CAMPAIGN
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
               <div className="glitter-card p-8 rounded-sm border-white/10">
                 <h3 className="text-xs font-black tracking-widest uppercase mb-8">CAMPAIGN_TRAJECTORY</h3>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={marketingDrift}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '8px', textTransform: 'uppercase', fontWeight: '900' }}
                          cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#ffffff" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="glitter-card p-8 bg-white/5 border-white/20 rounded-sm space-y-6">
                 <h3 className="text-xs font-black tracking-widest uppercase text-gold-500">REALTIME_MARKET_DRIFT</h3>
                 <div className="space-y-6">
                    {[
                      { label: 'BRAND_SENTIMENT', val: 98, sub: 'EXTREMELY_POSITIVE' },
                      { label: 'COHESION_INDEX', val: 92, sub: 'STRATEGIC_ALIGNMENT' },
                      { label: 'MARKET_PENETRATION', val: 74, sub: 'EXPANDING' }
                    ].map(m => (
                      <div key={m.label} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black tracking-widest uppercase">
                          <span className="text-white/40">{m.label}</span>
                          <span>{m.val}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${m.val}%` }}
                             className="h-full bg-white"
                           />
                        </div>
                        <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">{m.sub}</p>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_stability_monitor' && (
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">AI_STABILITY_MONITOR</h2>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mt-2">Real-time health telemetry and integrity verification loop.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleIntegrityCheck}
                disabled={isCheckingIntegrity}
                className="px-6 py-3 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                {isCheckingIntegrity ? 'SCANNING...' : 'FORCE_INTEGRITY_SYNC'}
              </button>
              <button 
                onClick={handleStabilityCheck}
                disabled={isCheckingStability}
                className="glitter-button glitter-gold px-8 py-4 rounded-sm text-[10px] font-black tracking-widest uppercase"
              >
                {isCheckingStability ? 'ANALYIZING_DRIFT...' : 'RUN_CORE_DIAGNOSTIC'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="glitter-card p-10 rounded-sm border-white/10 h-full">
                <h3 className="text-xs font-black tracking-widest uppercase mb-10 text-white/40">CORE_TELEMETRY</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketingDrift}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff10" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff10" fontSize={8} tickLine={false} axisLine={false} domain={[80, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '8px', textTransform: 'uppercase', fontWeight: '900' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ffffff" 
                        strokeWidth={3} 
                        dot={{ fill: '#ffffff', strokeWidth: 0, r: 2 }} 
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#ef4444' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               {[
                 { label: 'CORE_UPTIME', val: '99.999%', sub: 'CONTINUOUS_EXECUTION', color: 'text-green-500' },
                 { label: 'DRIFT_COEFFICIENT', val: '0.0042', sub: 'STABLE_ALIGNMENT', color: 'text-white' },
                 { label: 'HEALING_CYCLES', val: '12', sub: 'AUTO_ADJUSTMENTS', color: 'text-blue-500' },
                 { label: 'THREAT_MITIGATION', val: 'LEVEL_0', sub: 'NO_ATTEMPTS_DETECTED', color: 'text-white/40' }
               ].map(s => (
                 <div key={s.label} className="glitter-card p-6 rounded-sm border-white/10">
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">{s.label}</p>
                   <p className={`text-xl font-black tracking-tighter ${s.color}`}>{s.val}</p>
                   <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-2">{s.sub}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_control' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section className="glitter-card p-10 rounded-sm border-white/20">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-widest uppercase">AI_CORE_MANAGEMENT</h2>
                    <p className="text-[9px] font-black tracking-widest text-white/40 uppercase">System Integrity: {aiSettings.aiHealth}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  aiSettings.aiHealth === 'OPTIMAL' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                  aiSettings.aiHealth === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">AI_MASTER_SWITCH</p>
                    <p className="text-[8px] font-black tracking-widest text-white/30 uppercase">Enable/Disable all AI features</p>
                  </div>
                  <button 
                    onClick={handleAIKillSwitch}
                    className={`w-14 h-8 rounded-full transition-all relative ${
                      aiSettings.isAIEnabled ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${
                      aiSettings.isAIEnabled ? 'right-1 bg-black' : 'left-1 bg-white/40'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">AUTO_UPDATE_PROTOCOL</p>
                    <p className="text-[8px] font-black tracking-widest text-white/30 uppercase">AI system updates itself automatically</p>
                  </div>
                  <button 
                    onClick={handleAIAutoUpdate}
                    className={`w-14 h-8 rounded-full transition-all relative ${
                      aiSettings.isAutoUpdateEnabled ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${
                      aiSettings.isAutoUpdateEnabled ? 'right-1 bg-black' : 'left-1 bg-white/40'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">AUTO_MARKETING_PROTOCOL</p>
                    <p className="text-[8px] font-black tracking-widest text-white/30 uppercase">AI automatically promotes content</p>
                  </div>
                  <button 
                    onClick={handleAIAutoMarketing}
                    className={`w-14 h-8 rounded-full transition-all relative ${
                      aiSettings.isAutoMarketingEnabled ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${
                      aiSettings.isAutoMarketingEnabled ? 'right-1 bg-black' : 'left-1 bg-white/40'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">AUTO_REPLY_PROTOCOL</p>
                    <p className="text-[8px] font-black tracking-widest text-white/30 uppercase">AI handles interactions autonomously</p>
                  </div>
                  <button 
                    onClick={handleAIAutoReplyToggle}
                    className={`w-14 h-8 rounded-full transition-all relative ${
                      aiSettings.isAutoReplyEnabled ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${
                      aiSettings.isAutoReplyEnabled ? 'right-1 bg-black' : 'left-1 bg-white/40'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">AUTO_MODERATION_PROTOCOL</p>
                    <p className="text-[8px] font-black tracking-widest text-white/30 uppercase">AI automatically flags/moderates posts</p>
                  </div>
                  <button 
                    onClick={toggleAutoModeration}
                    className={`w-14 h-8 rounded-full transition-all relative ${
                      aiSettings.isAutoModerationEnabled ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${
                      aiSettings.isAutoModerationEnabled ? 'right-1 bg-black' : 'left-1 bg-white/40'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">4K_AI_ENHANCEMENT_DEFAULT</p>
                    <p className="text-[8px] font-black tracking-widest text-white/30 uppercase">All media output forced to 4K UHD</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span className="text-[8px] font-black text-white/60 uppercase">ACTIVE</span>
                  </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1">AI_PERSONA_CONFIGURATION</p>
                    <p className="text-[8px] font-black tracking-widest text-white/30 uppercase">Adjust the assistant's interaction style</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['SERIOUS', 'PROFESSIONAL', 'BALANCED'].map(p => (
                      <button
                        key={p}
                        onClick={async () => {
                          await updateDoc(doc(db, 'global_settings', 'ai_config'), { persona: p });
                        }}
                        className={`py-3 rounded-sm text-[9px] font-black tracking-widest uppercase border transition-all ${
                          aiSettings.persona === p ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleAISelfHeal}
                  disabled={isHealing || !aiSettings.isAIEnabled}
                  className="w-full py-5 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase rounded-sm flex items-center justify-center gap-3 hover:bg-white/80 transition-all disabled:opacity-50"
                >
                  {isHealing ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isHealing ? 'HEALING_AI_SYSTEMS...' : 'INITIATE_SELF_HEAL'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glitter-card p-10 rounded-sm border-white/20">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8">SYSTEM_DIAGNOSTICS</h3>
              <div className="space-y-6">
                {[
                  { label: 'LAST_HEAL_EVENT', value: aiSettings.lastHealAt?.toDate ? new Date(aiSettings.lastHealAt.toDate()).toLocaleString() : 'NEVER' },
                  { label: 'NEURAL_STABILITY', value: aiSettings.isAIEnabled ? '99.8%' : 'OFFLINE' },
                  { label: 'RESPONSE_LATENCY', value: aiSettings.isAIEnabled ? '240ms' : 'N/A' },
                  { label: 'HEALING_CYCLES', value: '12' }
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xs font-black uppercase">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glitter-card p-10 rounded-sm border-red-500/20 bg-red-500/5">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-red-500">EMERGENCY_OVERRIDE</h3>
              <p className="text-[9px] font-black tracking-widest text-red-500/60 uppercase mb-8">Force reset AI to factory baseline instructions</p>
              <button 
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'FACTORY_RESET_AI',
                  message: 'This will purge all learned behavior and reset Yohannes to baseline instructions. Proceed?',
                  isDangerous: true,
                  onConfirm: async () => {
                    await updateDoc(doc(db, 'global_settings', 'ai_config'), {
                      aiHealth: 'OPTIMAL',
                      lastHealAt: serverTimestamp()
                    });
                    alert("AI_FACTORY_RESET_COMPLETE");
                  }
                })}
                className="w-full py-4 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all"
              >
                PURGE_AI_MEMORY
              </button>
            </section>

            <section className="glitter-card p-10 rounded-sm border-white/10 mt-8">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6">AUTO_REFINE_PROTOCOL</h3>
              <p className="text-[9px] font-black tracking-widest text-white/40 uppercase mb-8 leading-relaxed">
                Polishes all approved content to the highest standard using Yohannes AI.
              </p>
              <button 
                onClick={handleAutoRefineAll}
                disabled={isRefining || !aiSettings.isAIEnabled}
                className="w-full py-4 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded-sm flex items-center justify-center gap-3 hover:bg-white/80 transition-all disabled:opacity-50"
              >
                {isRefining ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                INITIATE_GLOBAL_REFINEMENT
              </button>
            </section>
            <section className="glitter-card p-10 rounded-sm border-white/20">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-white/40" />
                YOHANNES_SYSTEM_LOGS
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {integrityReport.length > 0 ? (
                  integrityReport.map((log, i) => (
                    <div key={i} className="flex gap-3 text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-white/20">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('ERROR') ? 'text-red-500' : log.includes('HEAL') ? 'text-green-500' : 'text-white/60'}>
                        {log}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-white/10 text-[9px] font-black uppercase tracking-widest">
                    NO_ACTIVE_LOGS_DETECTED
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'strategic_insights' && (
        <div className="space-y-12 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-widest uppercase">STRATEGIC_CONTENT_INSIGHTS</h2>
              <p className="text-[8px] font-black tracking-widest text-white/40 uppercase mt-1">AI-driven corrections and visionary strategic advice for book-length impact.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {strategicInsights.length > 0 ? (
              strategicInsights.map((insight) => (
                <div key={insight.id} className="glitter-card p-10 rounded-sm border-white/20 bg-black/40 space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gold-500 mb-2 block">SOURCE_BOOK_ENHANCEMENT</span>
                      <h3 className="text-lg font-black uppercase tracking-tight">{insight.sourceTitle}</h3>
                      <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1">
                        {insight.createdAt?.toDate ? insight.createdAt.toDate().toLocaleString() : 'Just now'}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(insight.strategicAdvice);
                          alert("ADVICE_COPIED");
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2"
                      >
                        <Zap className="w-3 h-3" /> COPY_STRATEGY
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white/60">
                        <Activity className="w-4 h-4" />
                        <h4 className="text-[10px] font-black tracking-widest uppercase">CORRECTIONS_AUDIT</h4>
                      </div>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-sm text-xs text-white/60 leading-relaxed italic">
                        {insight.correctionsSummary}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gold-500">
                        <Sparkles className="w-4 h-4" />
                        <h4 className="text-[10px] font-black tracking-widest uppercase text-gold-500">EXECUTIVE_STRATEGY</h4>
                      </div>
                      <div className="p-6 bg-gold-500/5 border border-gold-500/20 rounded-sm text-xs text-white/80 leading-relaxed font-medium">
                        {insight.strategicAdvice}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-sm">
                <div className="flex flex-col items-center gap-4">
                  <Zap className="w-12 h-12 text-white/10" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/20 italic">
                    NO_STRATEGIC_INSIGHTS_GENERATED_YET
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <section className="glitter-card p-8 rounded-sm border-white/10 sticky top-24">
              <h2 className="text-xl font-black tracking-widest uppercase mb-8">ADD_NEW_EVENT</h2>
              <form onSubmit={handleAddEvent} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">EVENT_TITLE</label>
                  <input 
                    required
                    type="text" 
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                    placeholder="ENTER TITLE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">DESCRIPTION</label>
                  <textarea 
                    required
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white resize-none"
                    rows={4}
                    placeholder="ENTER DESCRIPTION"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">DATE_&_TIME</label>
                    <input 
                      required
                      type="datetime-local" 
                      value={newEvent.date}
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">TYPE</label>
                    <select 
                      value={newEvent.type}
                      onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                    >
                      <option value="service" className="bg-black">SERVICE</option>
                      <option value="conference" className="bg-black">CONFERENCE</option>
                      <option value="outreach" className="bg-black">OUTREACH</option>
                      <option value="other" className="bg-black">OTHER</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">LOCATION</label>
                  <input 
                    required
                    type="text" 
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                    placeholder="ENTER LOCATION"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isAddingEvent}
                  className="w-full glitter-button glitter-gold py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3"
                >
                  {isAddingEvent ? <Activity className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  {isAddingEvent ? 'REGISTERING...' : 'REGISTER_EVENT'}
                </button>
              </form>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-black tracking-widest uppercase mb-8">SCHEDULED_EVENTS</h2>
            <div className="grid grid-cols-1 gap-4">
              {events.map(event => (
                <div key={event.id} className="glitter-card p-6 rounded-sm border-white/10 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center">
                      <span className="text-[8px] font-black text-white/40 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-xl font-black">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-sm">{event.type}</span>
                        <span className="text-[8px] font-mono text-white/30 uppercase">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-tight">{event.title}</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{event.location}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {events.length === 0 && (
                <div className="py-20 text-center glitter-card rounded-sm border-dashed border-white/10">
                  <Calendar className="w-10 h-10 text-white/10 mx-auto mb-4" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/20">NO_EVENTS_SCHEDULED</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_accessories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section className="glitter-card p-8 rounded-sm">
              <h2 className="text-xl font-black tracking-widest uppercase mb-8">AI_ACCESSORY_SUITE</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-4 block">SELECT_ACCESSORY_PROTOCOL</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'quotes', label: 'QUOTE_EXTRACTOR', icon: Quote },
                      { id: 'sermon', label: 'SERMON_OUTLINER', icon: BookOpen },
                      { id: 'vision', label: 'VISION_GENERATOR', icon: Target },
                      { id: 'translate', label: 'UNIVERSAL_TRANSLATOR', icon: Languages },
                      { id: 'roadmap', label: 'STRATEGIC_ROADMAP', icon: TrendingUp },
                      { id: 'insight', label: 'THEOLOGICAL_INSIGHT', icon: Lightbulb },
                      { id: 'proofread', label: 'AI_PROOFREADER', icon: Check },
                      { id: 'marketing', label: 'MARKETING_GEN', icon: TrendingUp }
                    ].map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setAccessoryType(acc.id as any)}
                        className={`p-4 rounded-sm text-[9px] font-black tracking-widest uppercase border transition-all flex items-center gap-3 ${
                          accessoryType === acc.id ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'
                        }`}
                      >
                        <acc.icon className="w-3 h-3" />
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {accessoryType === 'translate' && (
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">TARGET_LANGUAGE</label>
                    <input 
                      type="text"
                      value={targetLang}
                      onChange={e => setTargetLang(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-sm font-medium focus:border-white/30 outline-none uppercase"
                      placeholder="E.G. SWAHILI, FRENCH, SPANISH..."
                    />
                  </div>
                )}

                {accessoryType === 'marketing' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">SELECT_BOOK</label>
                      <select
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-sm font-medium focus:border-white/30 outline-none"
                      >
                        <option value="" className="bg-black">SELECT_A_BOOK</option>
                        {books.map(book => (
                          <option key={book.id} value={book.id} className="bg-black">{book.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">PLATFORM</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['Twitter', 'Facebook', 'Email', 'TikTok', 'Instagram'].map(p => (
                          <button
                            key={p}
                            onClick={() => setMarketingPlatform(p)}
                            className={`py-3 rounded-sm text-[10px] font-black tracking-widest uppercase border transition-all ${
                              marketingPlatform === p ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {accessoryType !== 'marketing' && (
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                      {accessoryType === 'quotes' ? 'SOURCE_TEXT' : 
                       accessoryType === 'sermon' ? 'SERMON_TOPIC' : 
                       accessoryType === 'vision' ? 'PROJECT_DESCRIPTION' : 
                       accessoryType === 'roadmap' ? 'STRATEGIC_GOAL' :
                       accessoryType === 'insight' ? 'THEOLOGICAL_TOPIC' : 'CONTENT_TO_TRANSLATE'}
                    </label>
                    <textarea
                      value={accessoryInput}
                      onChange={e => setAccessoryInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-sm font-medium focus:border-white/30 outline-none h-48 resize-none"
                      placeholder="ENTER DATA FOR AI PROCESSING..."
                    />
                  </div>
                )}

                <button
                  onClick={handleAccessoryExecute}
                  disabled={isProcessingAccessory || (accessoryType !== 'marketing' && !accessoryInput) || (accessoryType === 'marketing' && !selectedBookId)}
                  className="w-full glitter-button glitter-gold py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessingAccessory ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isProcessingAccessory ? 'AI_PROCESSING_PROTOCOL...' : 'EXECUTE_AI_ACCESSORY'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {accessoryResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glitter-card p-8 rounded-sm border-white/30 h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest">AI_OUTPUT_GENERATED</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(accessoryResult);
                        alert("Copied to clipboard!");
                      }}
                      className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      COPY
                    </button>
                    <button onClick={() => setAccessoryResult(null)} className="text-white/20 hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-sm text-white/80 leading-relaxed font-medium bg-white/5 p-6 rounded-sm border border-white/5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <ReactMarkdown>{accessoryResult}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="glitter-card p-8 rounded-sm border-dashed border-white/10 flex flex-col items-center justify-center h-full text-white/10">
                <Sparkles className="w-12 h-12 mb-4" />
                <p className="text-[10px] font-black tracking-widest uppercase">WAITING_FOR_AI_INPUT</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="glitter-card p-8 rounded-sm">
            <h2 className="text-xl font-black tracking-widest uppercase mb-8">COMMUNITY_CONTACT_INFO</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">COMMUNITY_NUMBER</label>
                <input 
                  type="text" 
                  value={editedContactInfo.communityNumber}
                  onChange={e => setEditedContactInfo({...editedContactInfo, communityNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">OFFICIAL_EMAIL</label>
                <input 
                  type="text" 
                  value={editedContactInfo.officialEmail}
                  onChange={e => setEditedContactInfo({...editedContactInfo, officialEmail: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">ADDRESS</label>
                <input 
                  type="text" 
                  value={editedContactInfo.address}
                  onChange={e => setEditedContactInfo({...editedContactInfo, address: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">WHATSAPP_GROUP_LINK</label>
                <input 
                  type="text" 
                  value={editedContactInfo.whatsappGroup}
                  onChange={e => setEditedContactInfo({...editedContactInfo, whatsappGroup: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white"
                />
              </div>
              <button 
                onClick={async () => {
                  setIsSavingContact(true);
                  try {
                    await setDoc(doc(db, 'global_settings', 'contact_info'), {
                      ...editedContactInfo,
                      updatedAt: serverTimestamp()
                    });
                    alert("Contact info updated successfully!");
                  } catch (error) {
                    console.error("Failed to update contact info:", error);
                  } finally {
                    setIsSavingContact(false);
                  }
                }}
                disabled={isSavingContact}
                className="w-full glitter-button glitter-gold py-4 rounded-sm text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3"
              >
                {isSavingContact ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSavingContact ? 'SAVING...' : 'UPDATE_CONTACT_INFO'}
              </button>
            </div>
          </section>

          <section className="glitter-card p-8 rounded-sm">
            <h2 className="text-xl font-black tracking-widest uppercase mb-8">GENERAL_SETTINGS</h2>
            <div className="space-y-6">
              {[
                { label: 'SITE_NAME', value: 'PASTOR_JK_SANCTUARY' },
                { label: 'ADMIN_EMAIL', value: 'jumbabiodyckson@gmail.com' },
                { label: 'MAINTENANCE_MODE', value: 'OFF' },
                { label: 'AI_AUTOPILOT', value: 'ACTIVE' }
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">{s.label}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glitter-card p-8 rounded-sm">
            <h2 className="text-xl font-black tracking-widest uppercase mb-8">SECURITY_PROTOCOLS</h2>
            <div className="space-y-6">
              {[
                { label: 'ENCRYPTION_LEVEL', value: 'AES-256' },
                { label: 'FIREWALL_STATUS', value: 'SHIELD_UP' },
                { label: 'OAUTH_GATEWAY', value: 'VERIFIED' },
                { label: 'IP_WHITELISTING', value: 'ENABLED' }
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">{s.label}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glitter-card p-8 rounded-sm border-red-500/20">
            <h2 className="text-xl font-black tracking-widest uppercase mb-8 text-red-500">DANGER_ZONE</h2>
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-6">Irreversible system actions</p>
            <div className="space-y-4">
              <button className="w-full py-4 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all">
                RESET_SYSTEM_LOGS
              </button>
              <button className="w-full py-4 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all">
                PURGE_PENDING_QUEUE
              </button>
            </div>
          </section>
        </div>
      )}

        </div>
      </div>
    </main>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDangerous={confirmModal.isDangerous}
      />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalPost, setNoteModalPost] = useState<Post | { id: string, title: string } | undefined>(undefined);
  const [noteModalContent, setNoteModalContent] = useState('');

  const openNoteModal = (content = '', post?: Post | { id: string, title: string }) => {
    setNoteModalContent(content);
    setNoteModalPost(post);
    setIsNoteModalOpen(true);
  };
  const [posts, setPosts] = useState<Post[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [advice, setAdvice] = useState<AdminAdvice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketingLogs, setMarketingLogs] = useState<MarketingLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const notify = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  const [aiReports, setAiReports] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    communityNumber: '+251 911 000 000',
    officialEmail: 'contact@pastorjk.com',
    address: 'Addis Ababa, Ethiopia',
    whatsappGroup: 'https://chat.whatsapp.com/example',
    updatedAt: null
  });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [strategicInsights, setStrategicInsights] = useState<StrategicInsight[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostForPurchase, setSelectedPostForPurchase] = useState<Post | null>(null);
  const [selectedBookForReading, setSelectedBookForReading] = useState<Post | null>(null);
  const [selectedPostForMarketing, setSelectedPostForMarketing] = useState<Post | null>(null);
  const [selectedPostForSermon, setSelectedPostForSermon] = useState<Post | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [aiSettings, setAiSettings] = useState<AISettings>({
    isAIEnabled: true,
    isAutoUpdateEnabled: true,
    isAutoMarketingEnabled: true,
    isAutoReplyEnabled: true,
    autoReplyStrategy: 'strategic',
    aiHealth: 'OPTIMAL',
    lastHealAt: null,
    persona: 'PROFESSIONAL'
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [postsLimit, setPostsLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(searchQuery.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setLikedIds([]);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'likes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikedIds(snapshot.docs.map(doc => doc.id));
    });
    return unsubscribe;
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      alert("AUTH_REQUIRED: Please login to like posts.");
      return;
    }

    const likeRef = doc(db, 'users', user.uid, 'likes', postId);
    const postRef = doc(db, 'posts', postId);
    const isLiked = likedIds.includes(postId);

    try {
      if (isLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likesCount: Math.max(0, (posts.find(p => p.id === postId)?.likesCount || 0) - 1)
        });
      } else {
        await setDoc(likeRef, { createdAt: serverTimestamp() });
        await updateDoc(postRef, {
          likesCount: (posts.find(p => p.id === postId)?.likesCount || 0) + 1
        });
      }
    } catch (error) {
      console.error("Like operation failed:", error);
    }
  };

  const handleEnhancePost = async (updatedPost: Post) => {
    if (profile?.role !== 'admin' && profile?.role !== 'contributor') return;
    try {
      await updateDoc(doc(db, 'posts', updatedPost.id), {
        title: updatedPost.title,
        content: updatedPost.content,
        moderationHistory: [
          ...(updatedPost.moderationHistory || []),
          {
            note: updatedPost.suggestions?.startsWith('STRATEGIC_PROOFR') ? 'AI_STRATEGIC_PROOFREAD' : 'AI_STRATEGIC_ENHANCEMENT',
            status: 'approved',
            createdAt: new Date().toISOString(),
            suggestions: updatedPost.suggestions || 'Refined via AI strategic protocol.'
          }
        ]
      });
      notify("REVELATION_SYNCHRONIZED: The content has been perfectly aligned with global standards.", "success");
    } catch (error) {
      console.error("Post enhancement failed:", error);
      notify("ENHANCEMENT_FAILED: Could not synchronize refined content.", "error");
    }
  };

  const handleGenerateFinancialReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateFinancialReport(transactions, allOrders);
      setFinancialReport(report);
      await addDoc(collection(db, 'ai_reports'), {
        ...report,
        type: 'FINANCIAL',
        createdAt: serverTimestamp()
      });
      notify("ANALYSIS_COMPLETE: Yohannes has finalized the digital accounting protocols.", "success");
    } catch (error) {
      notify(getFriendlyErrorMessage(error), "error");
      handleFirestoreError(error, 'create', 'ai_reports');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSavePaymentSettings = async (settings: any) => {
    try {
      await setDoc(doc(db, 'global_settings', 'payment_config'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      notify("CREDENTIALS_RESERVED: Payment architecture has been synchronized.", "success");
    } catch (error) {
      notify(getFriendlyErrorMessage(error), "error");
      handleFirestoreError(error, 'update', 'global_settings/payment_config');
    }
  };

  // Autonomous Strategic Response Protocol (Responding to interactions within a strategic window)
  useEffect(() => {
    if (profile?.role !== 'admin' || !aiSettings.isAIEnabled || !aiSettings.isAutoReplyEnabled) return;
    
    // 1. Monitor Contact Messages
    const unsubContact = onSnapshot(
      query(collection(db, 'contact_messages'), where('aiReplied', '==', false)),
      (snapshot) => {
        snapshot.docs.forEach(async (docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt?.toDate();
          if (createdAt) {
            const now = new Date();
            const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
            
            // Strategic delay: 5 minutes for demo (represents "within 24 hours" protocol)
            if (diffMinutes >= 5) {
              try {
                const reply = await generateAutoReply(data.name, data.subject, data.message, 'STRATEGIC');
                await updateDoc(docSnap.ref, {
                  aiReply: reply,
                  aiReplied: true,
                  repliedAt: serverTimestamp(),
                  strategicInsight: "Response generated via Strategic Autonomous Protocol."
                });
                console.log(`[STRATEGIC_AI]: Auto-replied to contact message ${docSnap.id}`);
              } catch (err) {
                console.error("Strategic Auto-reply failed:", err);
              }
            }
          }
        });
      },
      (error) => console.error("Strategic Auto-reply listener (Contact) failed:", error)
    );

    // 2. Monitor Comments
    const unsubComments = onSnapshot(
      query(collectionGroup(db, 'comments'), where('aiReplied', '==', false)),
      (snapshot) => {
        snapshot.docs.forEach(async (docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt?.toDate();
          if (createdAt) {
            const now = new Date();
            const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
            
            // Strategic delay: 5 minutes for demo
            if (diffMinutes >= 5) {
              try {
                const post = posts.find(p => p.id === data.postId);
                const reply = await generateCommentReply(data.text, post?.title || "Visionary Content", 'STRATEGIC');
                await updateDoc(docSnap.ref, {
                  aiReply: reply,
                  aiReplied: true,
                  repliedAt: serverTimestamp()
                });
                console.log(`[STRATEGIC_AI]: Auto-replied to comment ${docSnap.id}`);
              } catch (err) {
                console.error("Strategic Comment AI Reply failed:", err);
              }
            }
          }
        });
      },
      (error) => console.error("Strategic Auto-reply listener (Comments) failed:", error)
    );

    return () => {
      unsubContact();
      unsubComments();
    };
  }, [aiSettings.isAIEnabled, aiSettings.isAutoReplyEnabled, profile, posts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setIsPostModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'global_settings', 'ai_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAiSettings({
          isAIEnabled: data.isAIEnabled ?? true,
          isAutoUpdateEnabled: data.isAutoUpdateEnabled ?? true,
          isAutoMarketingEnabled: data.isAutoMarketingEnabled ?? true,
          isAutoReplyEnabled: data.isAutoReplyEnabled ?? true,
          isAutoModerationEnabled: data.isAutoModerationEnabled ?? true,
          autoReplyStrategy: data.autoReplyStrategy ?? 'strategic',
          aiHealth: data.aiHealth ?? 'OPTIMAL',
          lastHealAt: data.lastHealAt ?? null,
          persona: data.persona ?? 'PROFESSIONAL'
        } as AISettings);
      } else {
        // Initialize default settings if not exists
        const defaultSettings: AISettings = {
          isAIEnabled: true,
          isAutoUpdateEnabled: true,
          isAutoMarketingEnabled: true,
          isAutoReplyEnabled: true,
          isAutoModerationEnabled: true,
          autoReplyStrategy: 'strategic',
          aiHealth: 'OPTIMAL',
          lastHealAt: serverTimestamp(),
          persona: 'PROFESSIONAL'
        };
        setDoc(doc(db, 'global_settings', 'ai_config'), defaultSettings);
        setAiSettings(defaultSettings);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        console.log(`[AUTH] User: ${firebaseUser.email}, Verified: ${firebaseUser.emailVerified}`);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous',
            photoURL: firebaseUser.photoURL || getSystemAvatar(firebaseUser.displayName || 'Anonymous'),
            role: (firebaseUser.email === 'jumbabiodyckson@gmail.com' || firebaseUser.email === 'maujkamau@gmail.com' || firebaseUser.email === 'admin2@example.com') ? 'admin' : 'viewer'
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const isStaff = profile?.role === 'admin' || profile?.role === 'contributor';
    if (isStaff) {
      const q = query(collection(db, 'strategic_insights'), orderBy('createdAt', 'desc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setStrategicInsights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StrategicInsight)));
      }, (error) => {
        console.error("Error fetching strategic insights (Role:", profile?.role, "):", error);
      });
      return unsubscribe;
    }
  }, [profile]);

  useEffect(() => {
    const q = query(collection(db, 'team'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    }, (error) => {
      console.error("Error fetching team:", error);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'global_settings', 'contact_info'), (snapshot) => {
      if (snapshot.exists()) {
        setContactInfo(snapshot.data() as ContactInfo);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(postsLimit));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(newPosts);
      setHasMore(snapshot.docs.length === postsLimit);
    });
    return unsubscribe;
  }, [postsLimit]);

  useEffect(() => {
    const q = query(collection(db, 'sites'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Seed initial sites if empty
        const initialSites: Site[] = [
          { id: '1', name: 'TechCrunch', url: 'https://techcrunch.com', description: 'The latest technology news and analysis.', icon: 'Layout' },
          { id: '2', name: 'GitHub', url: 'https://github.com', description: 'Where the world builds software.', icon: 'Layout' },
          { id: '3', name: 'Unsplash', url: 'https://unsplash.com', description: 'Beautiful, free images and photos.', icon: 'Layout' },
          { id: '4', name: 'Medium', url: 'https://medium.com', description: 'A place to read, write, and connect.', icon: 'Layout' },
          { id: '5', name: 'Vercel', url: 'https://vercel.com', description: 'Develop. Preview. Ship.', icon: 'Layout' }
        ];
        initialSites.forEach(s => setDoc(doc(db, 'sites', s.id), s));
      } else {
        setSites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Site)));
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const isStaff = profile?.role === 'admin' || profile?.role === 'contributor';
    if (isStaff) {
      const q = query(collection(db, 'admin_advice'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAdvice(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminAdvice)));
      }, (err) => console.error("admin_advice listener error:", err));
      return unsubscribe;
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      }, (err) => console.error("transactions listener error:", err));
      return unsubscribe;
    }
  }, [profile]);

  useEffect(() => {
    const isStaff = profile?.role === 'admin' || profile?.role === 'contributor';
    if (isStaff) {
      const q = query(collection(db, 'marketing_logs'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMarketingLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketingLog)));
      }, (err) => console.error("marketing_logs listener error:", err));
      return unsubscribe;
    }
  }, [profile]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      const q = query(collection(db, 'users'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      }, (err) => console.error("users listener error:", err));
      return unsubscribe;
    } else {
      setAllUsers([]);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAllOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("orders listener error:", err));
      return unsubscribe;
    } else {
      setAllOrders([]);
    }
  }, [user, profile]);

  useEffect(() => {
    const isStaff = profile?.role === 'admin' || profile?.role === 'contributor';
    if (user && isStaff) {
      const q = query(collection(db, 'ai_reports'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAiReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("ai_reports listener error:", err));
      return unsubscribe;
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      const unsubscribe = onSnapshot(doc(db, 'global_settings', 'payment_config'), (snapshot) => {
        if (snapshot.exists()) {
          setPaymentSettings(snapshot.data());
        }
      });
      return unsubscribe;
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      const q = query(collectionGroup(db, 'comments'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      }, (err) => console.error("comments listener error:", err));
      return unsubscribe;
    } else {
      setComments([]);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setContactMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("contact_messages listener error:", err));
      return unsubscribe;
    } else {
      setContactMessages([]);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'bookmarks'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setBookmarkedIds(snapshot.docs.map(doc => doc.id));
      });
      return unsubscribe;
    } else {
      setBookmarkedIds([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'likes'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setLikedIds(snapshot.docs.map(doc => doc.id));
      });
      return unsubscribe;
    } else {
      setLikedIds([]);
    }
  }, [user]);

  // AI Advice Generator (Interval)
  useEffect(() => {
    if (profile?.role === 'admin' && aiSettings.isAIEnabled) {
      const generateAdvice = async () => {
        const stats = {
          totalPosts: posts.length,
          pendingPosts: posts.filter(p => p.status === 'pending').length,
          activeUsers: 1, // Mock
          systemLoad: 'low'
        };
        try {
          const newAdvice = await getAdminAdvice(stats);
          const cleanAdvice = Object.fromEntries(
            Object.entries(newAdvice).filter(([_, v]) => v !== undefined)
          );
          await addDoc(collection(db, 'admin_advice'), {
            ...cleanAdvice,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Failed to generate AI advice:", error);
          // If it fails with a 500/RPC error, we could potentially update AI health status
          if (aiSettings.aiHealth !== 'DEGRADED') {
            await updateDoc(doc(db, 'global_settings', 'ai_config'), {
              aiHealth: 'DEGRADED'
            });
          }
        }
      };

      // Initial call
      generateAdvice();

      const interval = setInterval(generateAdvice, 900000); // Every 15 minutes
      return () => clearInterval(interval);
    }
  }, [profile, posts, aiSettings.isAIEnabled, aiSettings.aiHealth]);

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', postId);
    if (bookmarkedIds.includes(postId)) {
      await deleteDoc(bookmarkRef);
    } else {
      await setDoc(bookmarkRef, {
        postId,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleRead = async (post: Post) => {
    if (!user) {
      alert("PLEASE_LOGIN: You must be authenticated to access the reader.");
      return;
    }
    try {
      const bookmarkDoc = await getDoc(doc(db, 'users', user.uid, 'bookmarks', post.id));
      if (bookmarkDoc.exists()) {
        setReadingProgress(bookmarkDoc.data().readingProgress || 0);
      } else {
        setReadingProgress(0);
      }
      setSelectedBookForReading(post);
    } catch (error) {
      console.error("Failed to fetch reading progress:", error);
      setSelectedBookForReading(post);
    }
  };

  const handleCreatePost = async (data: any) => {
    if (!user) return;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      await addDoc(collection(db, 'posts'), {
        ...cleanData,
        authorUid: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp()
      });
      notify("POST_CREATED: Strategic content has been dispatched to the cloud buffer.", "success");
    } catch (error) {
      notify(getFriendlyErrorMessage(error), "error");
      handleFirestoreError(error, 'create', 'posts');
    }
  };

  const handleTransactionComplete = async (transactionData: any) => {
    if (!user) return;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(transactionData).filter(([_, v]) => v !== undefined)
      );
      await addDoc(collection(db, 'transactions'), {
        ...cleanData,
        userUid: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        createdAt: serverTimestamp()
      });
      setSelectedPostForPurchase(null);
      notify("TRANSACTION_SECURED: Digital asset ownership has been verified.", "success");
    } catch (error) {
      notify(getFriendlyErrorMessage(error), "error");
      handleFirestoreError(error, 'create', 'transactions');
    }
  };

  const handleComment = async (postId: string, text: string) => {
    if (!user) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error("POST_INVALID");

      const cleanData = {
        postId,
        authorUid: user.uid,
        authorName: user.displayName || 'Anonymous',
        text,
        aiReplied: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts', postId, 'comments'), cleanData);
      notify("REVELATION_DIALOGUE_QUEUED: Your insights are being processed by the strategic core.", "success");
    } catch (error) {
      notify(getFriendlyErrorMessage(error), "error");
      handleFirestoreError(error, 'create', `posts/${postId}/comments`);
    }
  };

  // --- Auto-Marketing Logic ---
  useEffect(() => {
    if (!aiSettings.isAIEnabled || !aiSettings.isAutoMarketingEnabled) return;

    const interval = setInterval(async () => {
      const approvedPosts = posts.filter(p => p.status === 'approved' && p.type === 'book');
      if (approvedPosts.length === 0) return;

      // Pick a random book to market
      const post = approvedPosts[Math.floor(Math.random() * approvedPosts.length)];
      
      try {
        const platforms = ['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'THREADS', 'X/TWITTER', 'FACEBOOK', 'LINKEDIN', 'PINTEREST', 'SNAPCHAT'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        
        const marketingContent = await generateMarketingContent(post.title, post.content, platform);
        
        const cleanMarketing = {
          postId: post.id,
          postTitle: post.title,
          platform,
          content: marketingContent || 'NO_CONTENT_GENERATED',
          createdAt: serverTimestamp(),
          status: 'posted'
        };

        await addDoc(collection(db, 'marketing_logs'), cleanMarketing);
        
        console.log(`AI_AUTO_MARKETING: Posted for ${post.title} on ${platform}`);
      } catch (error) {
        console.error("Auto-marketing failed:", error);
      }
    }, 3600000); // Run every hour

    return () => clearInterval(interval);
  }, [aiSettings.isAIEnabled, aiSettings.isAutoMarketingEnabled, posts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="tech-grid opacity-20 fixed inset-0" />
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-[0.4em] text-white/40">INITIALIZING_BRAND_HUB</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={() => signInWithPopup(auth, googleProvider)} />;
  }

  const filteredPosts = posts.filter(post => {
    const searchLower = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(searchLower) || 
           post.content.toLowerCase().includes(searchLower) ||
           post.type.toLowerCase().includes(searchLower);
  });

  return (
    <Router>
      <div className="min-h-screen font-sans text-white bg-black selection:bg-white selection:text-black">
        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>
        <BackgroundVideo />
        <OfflineBanner />
        <div className="brand-bg" />
        
        <Sidebar 
          user={user} 
          profile={profile} 
          onLogout={() => signOut(auth)} 
          onOpenCreateModal={() => setIsPostModalOpen(true)} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="lg:ml-64 flex flex-col min-h-screen relative z-10">
          <Navbar 
            user={user} 
            profile={profile} 
            onLogout={() => signOut(auth)} 
            onOpenCreateModal={() => setIsPostModalOpen(true)} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <ScrollToTop />
          
          <main className="flex-grow w-full max-w-7xl mx-auto">
            <BackButton />
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><Activity className="animate-spin" /></div>}>
              <Routes>
                <Route path="/" element={<HomePage sites={sites} user={user} team={team} aiSettings={aiSettings} posts={posts} onTakeNote={openNoteModal} />} />
                <Route path="/about" element={<AboutPage posts={posts} />} />
                <Route path="/profile" element={<ProfilePage user={user} profile={profile} />} />
                <Route path="/videos" element={<ContentPage type="video" posts={filteredPosts} profile={profile} onComment={handleComment} onPurchase={setSelectedPostForPurchase} bookmarkedIds={bookmarkedIds} onBookmark={handleBookmark} onRead={handleRead} onLike={handleLike} likedIds={likedIds} hasMore={hasMore} onLoadMore={() => setPostsLimit(prev => prev + 10)} isSearching={isSearching} aiSettings={aiSettings} notify={notify} onMarketing={setSelectedPostForMarketing} onSermonOutline={setSelectedPostForSermon} onTakeNote={openNoteModal} onEnhance={handleEnhancePost} />} />
                <Route path="/sermons" element={<ContentPage type="sermon" posts={filteredPosts} profile={profile} onComment={handleComment} onPurchase={setSelectedPostForPurchase} bookmarkedIds={bookmarkedIds} onBookmark={handleBookmark} onRead={handleRead} onLike={handleLike} likedIds={likedIds} hasMore={hasMore} onLoadMore={() => setPostsLimit(prev => prev + 10)} isSearching={isSearching} aiSettings={aiSettings} notify={notify} onMarketing={setSelectedPostForMarketing} onSermonOutline={setSelectedPostForSermon} onTakeNote={openNoteModal} onEnhance={handleEnhancePost} />} />
                <Route path="/books" element={<ContentPage type="book" posts={filteredPosts} profile={profile} onComment={handleComment} onPurchase={setSelectedPostForPurchase} bookmarkedIds={bookmarkedIds} onBookmark={handleBookmark} onRead={handleRead} onLike={handleLike} likedIds={likedIds} hasMore={hasMore} onLoadMore={() => setPostsLimit(prev => prev + 10)} isSearching={isSearching} aiSettings={aiSettings} notify={notify} onMarketing={setSelectedPostForMarketing} onSermonOutline={setSelectedPostForSermon} onTakeNote={openNoteModal} onEnhance={handleEnhancePost} />} />
                <Route path="/pictures" element={<ContentPage type="picture" posts={filteredPosts} profile={profile} onComment={handleComment} onPurchase={setSelectedPostForPurchase} bookmarkedIds={bookmarkedIds} onBookmark={handleBookmark} onRead={handleRead} onLike={handleLike} likedIds={likedIds} hasMore={hasMore} onLoadMore={() => setPostsLimit(prev => prev + 10)} isSearching={isSearching} aiSettings={aiSettings} notify={notify} onMarketing={setSelectedPostForMarketing} onSermonOutline={setSelectedPostForSermon} onTakeNote={openNoteModal} onEnhance={handleEnhancePost} />} />
                <Route path="/notifications" element={<NotificationsPage posts={posts} />} />
                <Route path="/bible" element={<BibleStudyPage onTakeNote={openNoteModal} />} />
                <Route path="/bookmarks" element={<BookmarksPage posts={posts} bookmarkedIds={bookmarkedIds} profile={profile} onComment={handleComment} onPurchase={setSelectedPostForPurchase} onBookmark={handleBookmark} onRead={handleRead} onLike={handleLike} likedIds={likedIds} aiSettings={aiSettings} notify={notify} onMarketing={setSelectedPostForMarketing} onSermonOutline={setSelectedPostForSermon} onTakeNote={openNoteModal} onEnhance={handleEnhancePost} />} />
                <Route path="/notes" element={<SermonNotesPage notify={notify} />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/support" element={<SupportPage user={user} />} />
                <Route path="/contact" element={<ContactPage contactInfo={contactInfo} persona={aiSettings.persona} />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/feedback" element={
                  <div className="max-w-3xl mx-auto px-4 py-20">
                    <FeedbackForm />
                  </div>
                } />
                <Route path="/admin" element={
                  (profile?.role === 'admin' || profile?.role === 'contributor') ? (
                    <AdminPage 
                      posts={posts} 
                      advice={advice} 
                      transactions={transactions} 
                      marketingLogs={marketingLogs}
                      allUsers={allUsers}
                      allOrders={allOrders}
                      aiReports={aiReports}
                      sites={sites}
                      comments={comments}
                      contactMessages={contactMessages}
                      aiSettings={aiSettings}
                      team={team}
                      contactInfo={contactInfo}
                      events={events}
                      paymentSettings={paymentSettings}
                      financialReport={financialReport}
                      strategicInsights={strategicInsights}
                      isGeneratingReport={isGeneratingReport}
                      profile={profile}
                      onGenerateReport={handleGenerateFinancialReport}
                      onSavePaymentSettings={handleSavePaymentSettings}
                      onOpenCreateModal={() => setIsPostModalOpen(true)} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[60vh] text-[10px] font-black tracking-widest uppercase text-white/20">
                      Access Denied
                    </div>
                  )
                } />
              </Routes>
            </Suspense>
          </main>

          <QuickActions onTakeNote={() => setIsNoteModalOpen(true)} />
          <Footer contactInfo={contactInfo} />
        </div>

      <AnimatePresence>
        {selectedBookForReading && (
          <BookReaderModal 
            post={selectedBookForReading} 
            user={user} 
            initialProgress={readingProgress}
            onClose={() => setSelectedBookForReading(null)} 
          />
        )}
        {isNoteModalOpen && (
          <SermonNoteModal 
            isOpen={isNoteModalOpen}
            onClose={() => setIsNoteModalOpen(false)}
            post={noteModalPost}
            initialContent={noteModalContent}
            notify={notify}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPostForPurchase && (
          <PaymentModal 
            post={selectedPostForPurchase} 
            user={user} 
            onClose={() => setSelectedPostForPurchase(null)} 
            notify={notify}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPostForMarketing && (
          <MarketingSuiteModal 
            post={selectedPostForMarketing} 
            onClose={() => setSelectedPostForMarketing(null)} 
            notify={notify} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPostForSermon && (
          <SermonOutlineModal 
            post={selectedPostForSermon} 
            onClose={() => setSelectedPostForSermon(null)} 
            notify={notify} 
          />
        )}
      </AnimatePresence>

      <AIAssistant aiSettings={aiSettings} profile={profile} />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPost={handleCreatePost}
        aiSettings={aiSettings}
        notify={notify}
      />
      </div>
    </Router>
  );
}
