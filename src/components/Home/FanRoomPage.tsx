import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, 
  Flame, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Users, 
  CheckCircle, 
  Send, 
  Heart, 
  Calendar, 
  Gamepad2, 
  ThumbsUp, 
  Award,
  BookOpen,
  PlusCircle,

  ArrowRight,
  Sliders,
  RotateCcw,
  Share2,
  ThumbsDown,
  Plus
} from 'lucide-react';
import { castPollVote, dbGetCollection, isLocalCmsEnabled } from '../../lib/dbService';
import { ensureAnonymousUser } from '../../lib/firebase';
import { apiNewsletterSubscribe } from '../../lib/secureApi';
import SEO from './SEO';

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: { [option: string]: number };
  relatedMatchId?: string;
  status: 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

interface MatchPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  question: string;
  options: string[];
  votes: { [option: string]: number };
  expectedScore: string;
  confidenceScore: number;
}

interface DiscussionTopic {
  id: string;
  title: string;
  tag: string;
  commentCount: number;
  excerpt: string;
  comments: { username: string; text: string; date: string; likes: number }[];
}

interface PlayersPageProps {
  onNavigate: (view: string) => void;
}

// Oyuncu havuzu gerçek kadrodan (squad.json → players koleksiyonu) yüklenir.
// Rol kodu → kabul edilen gerçek mevki adları (Transfermarkt Türkçe mevkileri).
const ROLE_POSITION_MAP: { [roleKey: string]: string[] } = {
  GK: ['kaleci'],
  CB: ['stoper'],
  LB: ['sol bek', 'sol kanat'],
  RB: ['sag bek', 'sag kanat'],
  LM: ['sol bek', 'sol kanat'],
  RM: ['sag bek', 'sag kanat'],
  DM: ['on libero', 'merkez orta saha'],
  MC: ['merkez orta saha', 'on libero', 'on numara'],
  AM: ['on numara', 'merkez orta saha'],
  LW: ['sol kanat', 'on numara'],
  RW: ['sag kanat', 'on numara'],
  CF: ['santrafor', 'santrfor']
};

const trNorm = (s: string) => (s || '').toLowerCase()
  .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c')
  .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o');

const TACTICAL_FORMATIONS: { [key: string]: { role: string; label: string; x: number; y: number; desc: string }[] } = {
  '4231': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'DM1', label: 'OLO1', x: 35, y: 54, desc: 'Ön Libero 1' },
    { role: 'DM2', label: 'OLO2', x: 65, y: 54, desc: 'Ön Libero 2' },
    { role: 'LW', label: 'SLK', x: 15, y: 32, desc: 'Sol Kanat' },
    { role: 'AM', label: 'OOK', x: 50, y: 34, desc: 'Oyun Kurucu' },
    { role: 'RW', label: 'SGK', x: 85, y: 32, desc: 'Sağ Kanat' },
    { role: 'CF', label: 'STF', x: 50, y: 14, desc: 'Santrfor' }
  ],
  '433': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'DM', label: 'OLO', x: 50, y: 58, desc: 'Ön Libero' },
    { role: 'MC1', label: 'OSA1', x: 32, y: 44, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 68, y: 44, desc: 'Sağ Orta Saha' },
    { role: 'LW', label: 'SLK', x: 18, y: 22, desc: 'Sol Kanat' },
    { role: 'RW', label: 'SGK', x: 82, y: 22, desc: 'Sağ Kanat' },
    { role: 'CF', label: 'STF', x: 50, y: 13, desc: 'Santrfor' }
  ],
  '352': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'CB1', label: 'STP1', x: 25, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 77, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 75, y: 74, desc: 'Sağ Stoper' },
    { role: 'LM', label: 'SLKB', x: 12, y: 46, desc: 'Sol Kanat Bek' },
    { role: 'DM', label: 'OLO', x: 50, y: 58, desc: 'Merkez Libero' },
    { role: 'RM', label: 'SGKB', x: 88, y: 46, desc: 'Sağ Kanat Bek' },
    { role: 'MC1', label: 'OSA1', x: 32, y: 41, desc: 'Sol İç Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 68, y: 41, desc: 'Sağ İç Orta Saha' },
    { role: 'CF1', label: 'STF1', x: 35, y: 16, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 65, y: 16, desc: 'Sağ Santrfor' }
  ],
  '442': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'LM', label: 'SLKB', x: 15, y: 44, desc: 'Sol Kanat Orta Saha' },
    { role: 'MC1', label: 'OSA1', x: 38, y: 48, desc: 'Sol Merkez Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 62, y: 48, desc: 'Sağ Merkez Orta Saha' },
    { role: 'RM', label: 'SGKB', x: 85, y: 44, desc: 'Sağ Kanat Orta Saha' },
    { role: 'CF1', label: 'STF1', x: 35, y: 18, desc: 'Sol Forvet' },
    { role: 'CF2', label: 'STF2', x: 65, y: 18, desc: 'Sağ Forvet' }
  ],
  '343': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'CB1', label: 'STP1', x: 25, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 77, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 75, y: 74, desc: 'Sağ Stoper' },
    { role: 'LM', label: 'SLKB', x: 15, y: 46, desc: 'Sol Kanat Bek' },
    { role: 'MC1', label: 'OSA1', x: 38, y: 52, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 62, y: 52, desc: 'Sağ Orta Saha' },
    { role: 'RM', label: 'SGKB', x: 85, y: 46, desc: 'Sağ Kanat Bek' },
    { role: 'LW', label: 'SLK', x: 20, y: 22, desc: 'Sol Kanat Forvet' },
    { role: 'RW', label: 'SGK', x: 80, y: 22, desc: 'Sağ Kanat Forvet' },
    { role: 'CF', label: 'STF', x: 50, y: 14, desc: 'Santrfor' }
  ],
  '4141': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'DM', label: 'OLO', x: 50, y: 58, desc: 'Tek Ön Libero' },
    { role: 'LM', label: 'SLKB', x: 15, y: 36, desc: 'Sol Kanat' },
    { role: 'MC1', label: 'OSA1', x: 35, y: 38, desc: 'Sol Ofansif Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 65, y: 38, desc: 'Sağ Ofansif Orta Saha' },
    { role: 'RM', label: 'SGKB', x: 85, y: 36, desc: 'Sağ Kanat' },
    { role: 'CF', label: 'STF', x: 50, y: 15, desc: 'Santrfor' }
  ],
  '451': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'LM', label: 'SLKB', x: 15, y: 40, desc: 'Sol Kanat' },
    { role: 'DM1', label: 'OLO1', x: 35, y: 54, desc: 'Defansif Orta Saha' },
    { role: 'MC1', label: 'OSA', x: 50, y: 42, desc: 'Merkez Orta Saha' },
    { role: 'DM2', label: 'OLO2', x: 65, y: 54, desc: 'Defansif Orta Saha 2' },
    { role: 'RM', label: 'SGKB', x: 85, y: 40, desc: 'Sağ Kanat' },
    { role: 'CF', label: 'STF', x: 50, y: 15, desc: 'Santrfor' }
  ],
  '41212': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'DM', label: 'OLO', x: 50, y: 60, desc: 'Defansif Orta Saha' },
    { role: 'MC1', label: 'OSA1', x: 28, y: 44, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 72, y: 44, desc: 'Sağ Orta Saha' },
    { role: 'AM', label: 'OOK', x: 50, y: 29, desc: 'Oyun Kurucu' },
    { role: 'CF1', label: 'STF1', x: 35, y: 15, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 65, y: 15, desc: 'Sağ Santrfor' }
  ],
  '4321': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'MC1', label: 'OSA1', x: 28, y: 54, desc: 'Sol Orta Saha' },
    { role: 'DM', label: 'OLO', x: 50, y: 58, desc: 'Merkez Ön Libero' },
    { role: 'MC2', label: 'OSA2', x: 72, y: 54, desc: 'Sağ Orta Saha' },
    { role: 'AM', label: 'HF1', x: 35, y: 30, desc: 'Sol Ofansif Forvet' },
    { role: 'RW', label: 'HF2', x: 65, y: 30, desc: 'Sağ Ofansif Forvet' },
    { role: 'CF', label: 'STF', x: 50, y: 14, desc: 'Tek Forvet' }
  ],
  '4222': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'DM1', label: 'OLO1', x: 35, y: 54, desc: 'Ön Libero 1' },
    { role: 'DM2', label: 'OLO2', x: 65, y: 54, desc: 'Ön Libero 2' },
    { role: 'AM', label: 'OOK1', x: 30, y: 32, desc: 'Ofansif Oyun Kurucu 1' },
    { role: 'RW', label: 'OOK2', x: 70, y: 32, desc: 'Ofansif Oyun Kurucu 2' },
    { role: 'CF1', label: 'STF1', x: 35, y: 15, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 65, y: 15, desc: 'Sağ Santrfor' }
  ],
  '3412': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'CB1', label: 'STP1', x: 25, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 77, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 75, y: 74, desc: 'Sağ Stoper' },
    { role: 'LM', label: 'SLKB', x: 15, y: 46, desc: 'Sol Orta Saha Bek' },
    { role: 'MC1', label: 'OSA1', x: 38, y: 52, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 62, y: 52, desc: 'Sağ Orta Saha' },
    { role: 'RM', label: 'SGKB', x: 85, y: 46, desc: 'Sağ Orta Saha Bek' },
    { role: 'AM', label: 'OOK', x: 50, y: 32, desc: 'Oyun Kurucu' },
    { role: 'CF1', label: 'STF1', x: 35, y: 15, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 65, y: 15, desc: 'Sağ Santrfor' }
  ],
  '3421': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'CB1', label: 'STP1', x: 25, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 77, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 75, y: 74, desc: 'Sağ Stoper' },
    { role: 'LM', label: 'SLKB', x: 15, y: 48, desc: 'Sol Orta Saha Bek' },
    { role: 'MC1', label: 'OSA1', x: 38, y: 54, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 62, y: 54, desc: 'Sağ Orta Saha' },
    { role: 'RM', label: 'SGKB', x: 85, y: 48, desc: 'Sağ Orta Saha Bek' },
    { role: 'AM', label: 'OOK1', x: 32, y: 28, desc: 'Sol Ofansif Forvet' },
    { role: 'RW', label: 'OOK2', x: 68, y: 28, desc: 'Sağ Ofansif Forvet' },
    { role: 'CF', label: 'STF', x: 50, y: 13, desc: 'Santrfor' }
  ],
  '532': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 12, y: 70, desc: 'Sol Kanat Defans' },
    { role: 'CB1', label: 'STP1', x: 30, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 76, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 70, y: 74, desc: 'Sağ Stoper' },
    { role: 'RB', label: 'SGB', x: 88, y: 70, desc: 'Sağ Kanat Defans' },
    { role: 'MC1', label: 'OSA1', x: 30, y: 48, desc: 'Sol İç' },
    { role: 'DM', label: 'OLO', x: 50, y: 56, desc: 'Ön Libero' },
    { role: 'MC2', label: 'OSA2', x: 70, y: 48, desc: 'Sağ İç' },
    { role: 'CF1', label: 'STF1', x: 35, y: 18, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 65, y: 18, desc: 'Sağ Santrfor' }
  ],
  '523': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 12, y: 70, desc: 'Sol Kanat Defans' },
    { role: 'CB1', label: 'STP1', x: 30, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 76, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 70, y: 74, desc: 'Sağ Stoper' },
    { role: 'RB', label: 'SGB', x: 88, y: 70, desc: 'Sağ Kanat Defans' },
    { role: 'MC1', label: 'OSA1', x: 36, y: 52, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 64, y: 52, desc: 'Sağ Orta Saha' },
    { role: 'LW', label: 'SLK', x: 20, y: 24, desc: 'Sol Kanat Forvet' },
    { role: 'RW', label: 'SGK', x: 80, y: 24, desc: 'Sağ Kanat Forvet' },
    { role: 'CF', label: 'STF', x: 50, y: 14, desc: 'Santrfor' }
  ],
  '541': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 12, y: 70, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 30, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 50, y: 76, desc: 'Stoper 2' },
    { role: 'CB3', label: 'STP3', x: 70, y: 74, desc: 'Stoper 3' },
    { role: 'RB', label: 'SGB', x: 88, y: 70, desc: 'Sağ Bek' },
    { role: 'LM', label: 'SLKB', x: 15, y: 42, desc: 'Sol Kanat' },
    { role: 'MC1', label: 'OSA1', x: 38, y: 48, desc: 'Sol Merkez Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 62, y: 48, desc: 'Sağ Merkez Orta Saha' },
    { role: 'RM', label: 'SGKB', x: 85, y: 42, desc: 'Sağ Kanat' },
    { role: 'CF', label: 'STF', x: 50, y: 16, desc: 'Tek Forvet' }
  ],
  '4312': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'MC1', label: 'OSA1', x: 28, y: 52, desc: 'Sol Orta Saha' },
    { role: 'DM', label: 'OLO', x: 50, y: 58, desc: 'Merkez Ön Libero' },
    { role: 'MC2', label: 'OSA2', x: 72, y: 52, desc: 'Sağ Orta Saha' },
    { role: 'AM', label: 'OOK', x: 50, y: 32, desc: 'Oyun Kurucu' },
    { role: 'CF1', label: 'STF1', x: 35, y: 15, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 65, y: 15, desc: 'Sağ Santrfor' }
  ],
  '3142': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'CB1', label: 'STP1', x: 25, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 77, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 75, y: 74, desc: 'Sağ Stoper' },
    { role: 'DM', label: 'OLO', x: 50, y: 60, desc: 'Defansif Orta Saha' },
    { role: 'LM', label: 'SLKB', x: 15, y: 42, desc: 'Sol Kanat' },
    { role: 'MC1', label: 'OSA1', x: 35, y: 44, desc: 'Sol İç' },
    { role: 'MC2', label: 'OSA2', x: 65, y: 44, desc: 'Sağ İç' },
    { role: 'RM', label: 'SGKB', x: 85, y: 42, desc: 'Sağ Kanat' },
    { role: 'CF1', label: 'STF1', x: 35, y: 15, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 65, y: 15, desc: 'Sağ Santrfor' }
  ],
  '424': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'MC1', label: 'OSA1', x: 38, y: 52, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 62, y: 52, desc: 'Sağ Orta Saha' },
    { role: 'LW', label: 'SLK', x: 15, y: 20, desc: 'Sol Kanat Forvet' },
    { role: 'RW', label: 'SGK', x: 85, y: 20, desc: 'Sağ Kanat Forvet' },
    { role: 'CF1', label: 'STF1', x: 38, y: 16, desc: 'Sol Santrfor' },
    { role: 'CF2', label: 'STF2', x: 62, y: 16, desc: 'Sağ Santrfor' }
  ],
  '3331': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'CB1', label: 'STP1', x: 25, y: 74, desc: 'Sol Stoper' },
    { role: 'CB2', label: 'STP2', x: 50, y: 77, desc: 'Orta Stoper' },
    { role: 'CB3', label: 'STP3', x: 75, y: 74, desc: 'Sağ Stoper' },
    { role: 'DM', label: 'OLO', x: 50, y: 60, desc: 'Merkez Libero' },
    { role: 'MC1', label: 'OSA1', x: 32, y: 48, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 68, y: 48, desc: 'Sağ Orta Saha' },
    { role: 'AM', label: 'OOK1', x: 25, y: 30, desc: 'Sol Ofansif Sektör' },
    { role: 'LW', label: 'OOK2', x: 50, y: 32, desc: 'Merkez Ofansif Bölge' },
    { role: 'RW', label: 'OOK3', x: 75, y: 30, desc: 'Sağ Ofansif Sektör' },
    { role: 'CF', label: 'STF', x: 50, y: 14, desc: 'Santrfor' }
  ],
  '4411': [
    { role: 'GK', label: 'KL', x: 50, y: 88, desc: 'Kaleci' },
    { role: 'LB', label: 'SLB', x: 15, y: 72, desc: 'Sol Bek' },
    { role: 'CB1', label: 'STP1', x: 38, y: 74, desc: 'Stoper 1' },
    { role: 'CB2', label: 'STP2', x: 62, y: 74, desc: 'Stoper 2' },
    { role: 'RB', label: 'SGB', x: 85, y: 72, desc: 'Sağ Bek' },
    { role: 'LM', label: 'SLKB', x: 15, y: 46, desc: 'Sol Kanat' },
    { role: 'MC1', label: 'OSA1', x: 38, y: 50, desc: 'Sol Orta Saha' },
    { role: 'MC2', label: 'OSA2', x: 62, y: 50, desc: 'Sağ Orta Saha' },
    { role: 'RM', label: 'SGKB', x: 85, y: 46, desc: 'Sağ Kanat' },
    { role: 'AM', label: 'OOK', x: 50, y: 30, desc: 'Gizli Forvet' },
    { role: 'CF', label: 'STF', x: 50, y: 14, desc: 'Santrfor' }
  ]
};

// Gerçek oyuncu fotoğrafı öncelikli avatar çözümü; kadro dışı özel transfer
// isimleri için nötr placeholder üretilir (dicebear).
const fallbackAvatarUrl = (name: string) => {
  if (name === 'YENİ TRANSFER' || name === '[YENİ TRANSFER]' || name === 'Transfer') {
    return 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=transfer&backgroundColor=eab308';
  }
  return `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a,1e3a8a,facc15`;
};

export const FanRoomPage: React.FC<PlayersPageProps> = ({ onNavigate }) => {
  // States
  const [polls, setPolls] = useState<Poll[]>([]);
  const [matchPrediction, setMatchPrediction] = useState<MatchPrediction | null>(null);
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive UI states
  const [votedPolls, setVotedPolls] = useState<{ [pollId: string]: string }>({});
  const [votedMatchPredict, setVotedMatchPredict] = useState<string | null>(null);
  const [votedPlayerOfWeek, setVotedPlayerOfWeek] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Active playing topic for commenting
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [topicToast, setTopicToast] = useState<string | null>(null);

  // --- INTERACTIVE SQUAD BUILDER STATES ---
  // Gerçek kadro (players koleksiyonu — Transfermarkt kaynaklı, fotoğraflı)
  const [squadPlayers, setSquadPlayers] = useState<any[]>([]);
  const [activeFormation, setActiveFormation] = useState<string>('4231');
  const [showShareModal, setShowShareModal] = useState(false);
  // Interactive lineup builder starts blank — users pick from the real squad list.
  const [lineup, setLineup] = useState<{ [role: string]: string }>({});
  const [activePositionSelector, setActivePositionSelector] = useState<string | null>(null);
  const [squadNotes, setSquadNotes] = useState('');
  const [copiedLineup, setCopiedLineup] = useState(false);

  // --- INTERACTIVE TRANSFER RUMOR STATES ---
  // Product rule: transfer rumors are admin-curated content — never fabricated,
  // never attributed to real outlets without a real source. Starts empty.
  const [rumors, setRumors] = useState<{
    id: string; player: string; source: string; excerpt: string; role: string;
    hotVotes: number; coldVotes: number;
  }[]>([]);
  const [votedRumors, setVotedRumors] = useState<{ [id: string]: 'hot' | 'cold' }>({});

  // Stats Counters
  const communityStats = {
    activePolls: polls.length,
    weeklyVotes: 0,
    weeklyQuestion: polls.length > 0 ? 1 : 0,
    fanComments: topics.reduce((acc, t) => acc + (t.comments?.length || 0), 0)
  };

  // Seed / Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch polls
        let allPolls: Poll[] = await dbGetCollection('polls');
        const activePolls = allPolls.filter(p => p.status === 'active');
        
        // No fabricated polls — empty DB renders the premium empty state
        setPolls(activePolls);

        // 2. Build the match prediction only from a real upcoming match — never fabricate
        try {
          const allMatches: any[] = await dbGetCollection('matches');
          const upcoming = (allMatches || [])
            .filter(m => m.status === 'upcoming' && m.matchDate)
            .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())[0];
          if (upcoming) {
            setMatchPrediction({
              matchId: upcoming.id,
              homeTeam: upcoming.homeTeam,
              awayTeam: upcoming.awayTeam,
              competition: upcoming.competition || '',
              question: "Bu maç nasıl biter?",
              options: [`${upcoming.homeTeam} kazanır`, "Beraberlik", `${upcoming.awayTeam} kazanır`],
              votes: { [`${upcoming.homeTeam} kazanır`]: 0, "Beraberlik": 0, [`${upcoming.awayTeam} kazanır`]: 0 },
              expectedScore: "",
              confidenceScore: 0
            });
          } else {
            setMatchPrediction(null);
          }
        } catch {
          setMatchPrediction(null);
        }

        // 3. Discussion topics initialization
        // Editorial discussion starters — no fabricated user comments or counts.
        const initialTopics: DiscussionTopic[] = [
          {
            id: "disc-1",
            title: "Bu takımın ideal orta saha üçlüsü kim olmalı?",
            tag: "Taktik",
            commentCount: 0,
            excerpt: "Merkezde denge mi, yaratıcılık mı, pres gücü mü? Fenerbahçe’nin doğru üçlüsü üzerine taraftar görüşleri.",
            comments: []
          },
          {
            id: "disc-2",
            title: "Transferde öncelik hangi bölge olmalı?",
            tag: "Transfer",
            commentCount: 0,
            excerpt: "6 numara mı, stoper mi, kanat mı? Kadro ihtiyacına dair ortak akıl.",
            comments: []
          },
          {
            id: "disc-3",
            title: "Hoca tercihleri skoru mu oyunu mu etkiliyor?",
            tag: "Maç Sonu",
            commentCount: 0,
            excerpt: "Değişiklik zamanlamaları, oyun planı ve maç içi reaksiyonlar üzerine tartışma.",
            comments: []
          },
          {
            id: "disc-4",
            title: "Genç oyunculara daha fazla süre verilmeli mi?",
            tag: "Altyapı",
            commentCount: 0,
            excerpt: "Potansiyel, baskı seviyesi ve maç ritmi açısından genç oyuncuların kullanımı.",
            comments: []
          }
        ];
        
        // Discussion topics: CMS localStorage only in offline mode (A5).
        // Firebase path keeps topics in-memory until a real discussion collection exists.
        if (isLocalCmsEnabled()) {
          const storedTopics = localStorage.getItem('cms_discussion_topics');
          if (storedTopics) {
            setTopics(JSON.parse(storedTopics));
          } else {
            setTopics(initialTopics);
            localStorage.setItem('cms_discussion_topics', JSON.stringify(initialTopics));
          }
        } else {
          setTopics(initialTopics);
        }

        // 4. Retrive voting status from localStorage to maintain persistence
        const votesFromStorage: { [id: string]: string } = {};
        allPolls.forEach(p => {
          const v = localStorage.getItem(`voted_poll_${p.id}`);
          if (v) votesFromStorage[p.id] = v;
        });
        const defaultV = localStorage.getItem(`voted_poll_poll-default`);
        if (defaultV) votesFromStorage['poll-default'] = defaultV;
        
        setVotedPolls(votesFromStorage);

        const vMatch = localStorage.getItem('voted_match_prediction');
        if (vMatch) setVotedMatchPredict(vMatch);

        const vPlayer = localStorage.getItem('voted_player_of_the_week');
        if (vPlayer) setVotedPlayerOfWeek(vPlayer);

        // Gerçek kadro havuzu (fotoğraf + mevki + piyasa değeri)
        try {
          const plist = await dbGetCollection('players');
          setSquadPlayers((plist || []).filter((p: any) => p.status === 'active'));
        } catch { setSquadPlayers([]); }

        // Gerçek transfer söylentileri (Transfermarkt scrape → rumors.json)
        try {
          const rr = await fetch('/data/rumors.json');
          if (rr.ok) {
            const rd = await rr.json();
            if (Array.isArray(rd.rumors) && rd.rumors.length > 0) {
              setRumors(rd.rumors);
              const loadedVotedRumors: { [id: string]: 'hot' | 'cold' } = {};
              rd.rumors.forEach((rum: any) => {
                const v = localStorage.getItem(`voted_rumor_${rum.id}`) as 'hot' | 'cold' | null;
                if (v) loadedVotedRumors[rum.id] = v;
              });
              setVotedRumors(loadedVotedRumors);
            }
          }
        } catch { /* söylenti dosyası yoksa boş durum kalır */ }

        const savedLineup = localStorage.getItem('squad_builder_lineup');
        if (savedLineup) {
          try {
            setLineup(JSON.parse(savedLineup));
          } catch (_) {}
        }
        const savedFormation = localStorage.getItem('squad_builder_formation');
        if (savedFormation && TACTICAL_FORMATIONS[savedFormation]) {
          setActiveFormation(savedFormation);
        }

      } catch (err) {
        console.error("Taraftar Odası load error: ", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Poll Vote Handler — secure subcollection / server aggregate (never client poll write)
  const handlePollVote = async (pollId: string, option: string) => {
    if (votedPolls[pollId]) return;

    try {
      const user = await ensureAnonymousUser();
      await castPollVote(pollId, option, user.uid);

      setPolls(prev =>
        prev.map(p => {
          if (p.id !== pollId) return p;
          const uVotes = { ...(p.votes || {}), [option]: ((p.votes || {})[option] || 0) + 1 };
          return { ...p, votes: uVotes };
        })
      );
      localStorage.setItem(`voted_poll_${pollId}`, option);
      setVotedPolls(prev => ({ ...prev, [pollId]: option }));
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('daha önce')) {
        localStorage.setItem(`voted_poll_${pollId}`, option);
        setVotedPolls(prev => ({ ...prev, [pollId]: option }));
      }
      console.warn('Poll vote failed:', err);
    }
  };

  // Match Prediction Vote Handler
  const handleMatchVote = (option: string) => {
    if (votedMatchPredict || !matchPrediction) return;

    const updatedVotes = {
      ...matchPrediction.votes,
      [option]: (matchPrediction.votes[option] || 0) + 1
    };

    setMatchPrediction({
      ...matchPrediction,
      votes: updatedVotes
    });

    localStorage.setItem('voted_match_prediction', option);
    setVotedMatchPredict(option);
  };

  // Player of the week Vote Handler
  const [playerVotes, setPlayerVotes] = useState<{ [opt: string]: number }>({});

  const handlePlayerVote = (option: string) => {
    if (votedPlayerOfWeek) return;

    setPlayerVotes(prev => ({
      ...prev,
      [option]: (prev[option] || 0) + 1
    }));

    localStorage.setItem('voted_player_of_the_week', option);
    setVotedPlayerOfWeek(option);
  };

  // Gerçek kadro yardımcıları: rol → uygun mevkideki oyuncular + fotoğraf çözümü
  const roleKeyOf = (role: string) => role.replace(/\d+$/, '');
  const playersForRole = (role: string) => {
    const keys = ROLE_POSITION_MAP[roleKeyOf(role)] || [];
    if (squadPlayers.length === 0) return [];
    const filtered = squadPlayers.filter((p: any) => {
      const positions = [p.mainPosition, p.position, ...(Array.isArray(p.subPositions) ? p.subPositions : [])]
        .filter(Boolean).map((x: string) => trNorm(x));
      return keys.some(k => positions.some(pp => pp.includes(k)));
    });
    return filtered.length > 0 ? filtered : squadPlayers;
  };
  const resolveAvatar = (name: string) => {
    const found = squadPlayers.find((p: any) => p.name === name);
    if (found?.photo || found?.photoUrl) return found.photo || found.photoUrl;
    return fallbackAvatarUrl(name);
  };

  // --- GERÇEK KADRO METRİKLERİ (yaş ortalaması + toplam piyasa değeri) ---
  const squadMetrics = React.useMemo(() => {
    const parseMv = (mv?: string | null): number => {
      if (!mv) return 0;
      const m = mv.replace(',', '.').match(/([\d.]+)/);
      if (!m) return 0;
      const n = parseFloat(m[1]);
      if (Number.isNaN(n)) return 0;
      if (/mil/i.test(mv) || /m/i.test(mv)) return n * 1_000_000;
      if (/bin/i.test(mv) || /k/i.test(mv)) return n * 1_000;
      return n;
    };
    const names = TACTICAL_FORMATIONS[activeFormation].map(p => lineup[p.role]).filter(Boolean);
    const selected = names
      .map(n => squadPlayers.find((sp: any) => sp.name === n))
      .filter(Boolean) as any[];
    const ages = selected.map(p => parseInt(p.age)).filter(n => n > 0);
    const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    const totalValue = selected.reduce((acc, p) => acc + parseMv(p.marketValue), 0);
    return {
      filled: names.length,
      slots: TACTICAL_FORMATIONS[activeFormation].length,
      avgAge: avgAge > 0 ? avgAge.toFixed(1) : '—',
      totalValueLabel: totalValue > 0 ? `€${(totalValue / 1_000_000).toFixed(1)}M` : '—'
    };
  }, [lineup, activeFormation, squadPlayers]);


  // Handle position select
  const handleAssignPlayer = (role: string, playerName: string) => {
    const updatedLineup = { ...lineup, [role]: playerName };
    setLineup(updatedLineup);
    setActivePositionSelector(null);
    localStorage.setItem('squad_builder_lineup', JSON.stringify(updatedLineup));
  };

  const handleFormationChange = (form: string) => {
    setActiveFormation(form);
    localStorage.setItem('squad_builder_formation', form);
  };

  const handleResetLineup = () => {
    // Boş sahaya dön — kullanıcı gerçek kadrodan yeniden seçer
    setLineup({});
    localStorage.removeItem('squad_builder_lineup');
    setActivePositionSelector(null);
  };

  const handleShareLineup = () => {
    const currentPositions = TACTICAL_FORMATIONS[activeFormation];
    const teamText = currentPositions.map(p => `${p.desc || p.role}: ${lineup[p.role] || 'Belirtilmedi'}`).join('\n');
    const fullText = `🔥 Fenerbahçe Evreni - Benim Taktik Kadrom (${activeFormation.split('').join('-')}):\n\n${teamText}\n\n📊 Yaş Ortalaması: ${squadMetrics.avgAge} | 💰 Toplam Değer: ${squadMetrics.totalValueLabel}\n\nTaktik Notu: ${squadNotes ? squadNotes : "—"}\n\nKendi kadronu kurup oylamak için taraftar odasına gel!`;
    
    try {
      navigator.clipboard.writeText(fullText);
      setCopiedLineup(true);
      setTimeout(() => setCopiedLineup(false), 3000);
    } catch (e) {
      console.warn("Could not copy:", e);
    }
    setShowShareModal(true);
  };

  // --- RUMOR VOTE HANDLER ---
  const handleRumorVote = (rumorId: string, type: 'hot' | 'cold') => {
    if (votedRumors[rumorId]) return;

    setRumors(prev => prev.map(rum => {
      if (rum.id === rumorId) {
        return {
          ...rum,
          hotVotes: type === 'hot' ? rum.hotVotes + 1 : rum.hotVotes,
          coldVotes: type === 'cold' ? rum.coldVotes + 1 : rum.coldVotes
        };
      }
      return rum;
    }));

    setVotedRumors(prev => ({ ...prev, [rumorId]: type }));
    localStorage.setItem(`voted_rumor_${rumorId}`, type);
  };

  // Newsletter subscription — rate-limited API (honeypot field must stay empty)
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterLoading(true);
    try {
      const result = await apiNewsletterSubscribe({
        email: newsletterEmail.trim(),
        source: 'taraftar-odasi',
        website: '', // honeypot
      });
      if (result.success || result.isDuplicate) {
        setNewsletterSubscribed(true);
        setNewsletterEmail('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Add Comment to Discussion Topic
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeTopicId) return;

    // Cihaza sabit anonim takma ad — serbest kullanıcı adı girişi kimlik ifade
    // etmediği için kaldırıldı; gerçek üyelik sistemi gelene dek bu kullanılır.
    let username = localStorage.getItem('fan_alias') || '';
    if (!username) {
      username = 'taraftar_' + Math.random().toString(36).slice(2, 7);
      localStorage.setItem('fan_alias', username);
    }
    const newComment = {
      username: username.replace(/[^a-zA-Z0-9_]/g, ""),
      text: newCommentText.trim(),
      date: "Şimdi",
      likes: 0
    };

    const updatedTopics = topics.map(t => {
      if (t.id === activeTopicId) {
        return {
          ...t,
          commentCount: t.commentCount + 1,
          comments: [newComment, ...t.comments]
        };
      }
      return t;
    });

    setTopics(updatedTopics);
    // A5: do not persist cms_* discussion cache when Firestore is source of truth
    if (isLocalCmsEnabled()) {
      localStorage.setItem('cms_discussion_topics', JSON.stringify(updatedTopics));
    }
    setNewCommentText('');
    setTopicToast("Görüşünüz başarıyla eklendi ve paylaşıldı!");
    setTimeout(() => setTopicToast(null), 3000);
  };

  // Helper calculation for percentages
  const getPercentage = (votes: { [opt: string]: number }, option: string): string => {
    const total = Object.values(votes).reduce((sum, curr) => (sum as number) + (curr as number), 0);
    if (total === 0) return '0%';
    const pct = Math.round(((votes[option] || 0) / total) * 100);
    return `${pct}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fb-dark">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-fb-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase text-fb-yellow tracking-[0.2em] animate-pulse">TARAFTAR ODASI NABZI HESAPLANIYOR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fb-dark text-slate-100 pb-20 overflow-hidden">
      <SEO 
        title="Taraftar Odası | Fenerbahçe Evreni"
        description="Fenerbahçe taraftar anketleri, maç tahminleri, haftanın soruları ve topluluk tartışmaları."
        canonical="https://fenerbahceevreni.com/taraftar-odasi"
      />
      
      {/* Background Ambience GLOWS */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-fb-yellow/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-10 w-[400px] h-[400px] rounded-full bg-fb-navy/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[600px] h-[600px] rounded-full bg-fb-navy/15 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:py-20 border-b border-white/[0.04]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[10px] font-black tracking-widest uppercase">
              <Users size={12} />
              TARAFTAR ETKİLEŞİM PLATFORMU
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase tracking-tight leading-none">
              TARAFTAR ODASI
            </h1>

            <p className="text-sm md:text-base text-fb-muted max-w-2xl mx-auto leading-relaxed">
              Maç tahminleri, haftanın soruları, taraftar anketleri ve Fenerbahçe gündemine dair ortak akıl burada.
            </p>

            {/* Subtitle Info Pills Grid */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto pt-2">
              {[
                "Maç Tahmini",
                "Taraftar Anketleri",
                "Haftanın Sorusu",
                "Maçın Oyuncusu",
                "Tartışma Başlıkları",
                "Topluluk"
              ].map((pill, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-wider transition-colors hover:border-fb-yellow/30 select-none"
                >
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Stats Strip */}
      <section className="py-6 bg-fb-card/40 border-b border-white/[0.04]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Aktif Anket", value: communityStats.activePolls },
              { label: "Bu Hafta Oy", value: communityStats.weeklyVotes.toLocaleString() },
              { label: "Haftanın Sorusu", value: communityStats.weeklyQuestion },
              { label: "Taraftar Yorumu", value: communityStats.fanComments }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-fb-card/90 border border-white/5 flex flex-col justify-center items-center">
                <span className="text-[10px] font-black uppercase text-fb-muted tracking-widest">{stat.label}</span>
                <span className="text-2xl font-display font-black text-fb-yellow italic block mt-1">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container Grid */}
      <div className="container mx-auto px-6 max-w-6xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT & CENTER PARTS: Interactive Cards & Topics */}
          <div className="lg:col-span-2 space-y-10 text-left">
            
            {/* 3. Main Poll Section */}
            <div className="p-6 md:p-8 rounded-2xl bg-fb-card border border-white/[0.06] relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 p-3 text-[9px] font-black text-fb-yellow bg-fb-yellow/10 uppercase rounded-bl-xl tracking-widest border-l border-b border-fb-yellow/10">
                HAFTANIN ANKETİ
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#FFD21F] block mb-1">
                    Ortak Akıl Anketi
                  </span>
                  <p className="text-xs text-fb-muted font-bold block mb-4">
                    Görüşünüzü yansıtın, genel eğilimi anında görün.
                  </p>
                </div>

                {polls.length === 0 && !loading && (
                  <div className="p-8 rounded-xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                    <Vote size={22} className="text-slate-600 mx-auto" />
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono">
                      Aktif anket bulunmuyor.
                    </p>
                    <p className="text-[10px] text-slate-500 italic">
                      Yeni anket yayınlandığında tribün görüşü burada toplanır.
                    </p>
                  </div>
                )}

                {polls.map((poll) => {
                  const hasVoted = !!votedPolls[poll.id];
                  return (
                    <div key={poll.id} className="space-y-5">
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        {poll.question}
                      </h4>

                      <div className="space-y-3">
                        {poll.options.map((option, idx) => {
                          const percentage = getPercentage(poll.votes, option);
                          const isSelected = votedPolls[poll.id] === option;
                          const voteCount = poll.votes[option] || 0;

                          return (
                            <div key={idx} className="relative">
                              {hasVoted ? (
                                // VOTED STATE / RESULT GRAPHIC
                                <div className={`relative p-3.5 rounded-xl border text-xs font-semibold flex justify-between items-center transition-all overflow-hidden ${isSelected ? 'border-fb-yellow/40 bg-fb-yellow/5' : 'border-white/5 bg-white/[0.02]/30'}`}>
                                  {/* Dynamic progress fill */}
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: percentage }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`absolute left-0 top-0 bottom-0 z-0 opacity-15 ${isSelected ? 'bg-fb-yellow' : 'bg-fb-muted'}`}
                                  />
                                  <span className="relative z-10 text-slate-100 flex items-center gap-2">
                                    {option}
                                    {isSelected && <CheckCircle size={12} className="text-fb-yellow" />}
                                  </span>
                                  <span className="relative z-10 font-mono font-black text-fb-yellow">
                                    {percentage} <span className="text-[10px] text-slate-400 font-bold ml-1">({voteCount} Oy)</span>
                                  </span>
                                </div>
                              ) : (
                                // ACTIVE STATE / CLICKABLE OPTION
                                <button
                                  onClick={() => handlePollVote(poll.id, option)}
                                  className="w-full text-left p-3.5 rounded-xl border border-white/5 bg-white/[0.02]/50 hover:border-fb-yellow/30 hover:bg-white/[0.04] text-xs font-bold transition-all text-slate-300 hover:text-white flex items-center justify-between group"
                                >
                                  <span>{option}</span>
                                  <span className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-fb-yellow flex items-center justify-center text-[10px] text-fb-yellow shrink-0 font-display">
                                    →
                                  </span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex justify-between items-center text-[10px] text-fb-muted font-bold">
                        <span>Toplam Oy: {Object.values(poll.votes).reduce((a, b) => (a as number) + (b as number), 0).toLocaleString()}</span>
                        {hasVoted && (
                          <span className="text-fb-yellow">Tercihiniz Kaydedildi ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KIŞİSELLEŞTİRİLMİŞ 11 KURMA LABORATUVARI */}
            <div className="p-6 md:p-8 rounded-2xl bg-fb-card border border-white/[0.06] relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 p-3 text-[9px] font-black text-white bg-emerald-900 border-l border-b border-white/10 uppercase rounded-bl-xl tracking-widest">
                TAKTİK LABORATUVARI
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-fb-yellow animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#FFD21F]">
                      KADIKÖY TAKTİK TAHTASI
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black text-white mt-1 uppercase tracking-tight">
                    İLK 11'İNİ SEN BELİRLE
                  </h3>
                  <p className="text-xs text-fb-muted mt-1 leading-relaxed">
                    Formasyonu seç, pozisyonlara tıkla ve hayalindeki Fenerbahçe kadrosunu sahaya diz! Kadro endeksleri seçimine göre canlı hesaplanır.
                  </p>
                </div>

                {/* Formasyon Seçimi ve Sıfırla */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-fb-dark/60 border border-white/5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-fb-muted mr-1">DİZİLİŞ SEÇ:</span>
                    <select
                      value={activeFormation}
                      onChange={(e) => handleFormationChange(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-fb-yellow/20 text-xs text-white uppercase font-black focus:outline-none focus:border-fb-yellow cursor-pointer select-none"
                    >
                      {Object.keys(TACTICAL_FORMATIONS).map(form => (
                        <option key={form} value={form} className="bg-slate-950 text-white font-black">
                          {form === '41212' ? '4-1-2-1-2 (BAKLAVA)' : form === '4321' ? '4-3-2-1 (NOEL AĞACI)' : form.split('').join('-')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleResetLineup}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-950/30 text-rose-400 hover:text-rose-300 text-xs font-black border border-white/5 transition-all"
                  >
                    <RotateCcw size={12} />
                    KADROYU SIFIRLA
                  </button>
                </div>

                {/* Canlı Endeks Değerleri */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "DİZİLEN OYUNCU", value: `${squadMetrics.filled}/${squadMetrics.slots}`, color: "text-amber-400", bg: "bg-amber-400/10" },
                    { label: "YAŞ ORTALAMASI", value: squadMetrics.avgAge, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "TOPLAM DEĞER", value: squadMetrics.totalValueLabel, color: "text-indigo-400", bg: "bg-indigo-400/10" },
                    { label: "DİZİLİŞ", value: activeFormation.split('').join('-'), color: "text-orange-400", bg: "bg-orange-400/10" }
                  ].map((metric, i) => (
                    <div key={i} className={`p-3 rounded-xl ${metric.bg} border border-white/5 text-center`}>
                      <span className="text-[9px] font-black uppercase text-fb-muted block tracking-wider">{metric.label}</span>
                      <span className={`text-xl font-mono font-black italic block mt-0.5 ${metric.color}`}>
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Futbol Sahası ve Oyuncu Seçici */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Yeşil Saha */}
                  <div className="md:col-span-2 relative aspect-[3/4] rounded-2xl bg-gradient-to-b from-[#1b4332] to-[#081c15] border border-emerald-500/30 shadow-inner overflow-hidden flex flex-col justify-between p-4 min-h-[380px]">
                    {/* Saha Çizgileri */}
                    <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none m-2" />
                    {/* Ceza Sahası Üst */}
                    <div className="absolute left-[20%] right-[20%] top-2 h-1/6 border-b border-x border-white/10 pointer-events-none" />
                    {/* Altıpas Üst */}
                    <div className="absolute left-[35%] right-[35%] top-2 h-[7%] border-b border-x border-white/10 pointer-events-none" />
                    {/* Ceza Sahası Alt */}
                    <div className="absolute left-[20%] right-[20%] bottom-2 h-1/6 border-t border-x border-white/10 pointer-events-none" />
                    {/* Altıpas Alt */}
                    <div className="absolute left-[35%] right-[35%] bottom-2 h-[7%] border-t border-x border-white/10 pointer-events-none" />
                    {/* Orta Saha Çizgisi */}
                    <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[1px] bg-white/10 pointer-events-none" />
                    {/* Orta Yuvarlak */}
                    <div className="absolute left-1/2 top-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 border border-white/10 rounded-full pointer-events-none" />

                    {/* Sahanın İçindeki Oyuncu Pinleri */}
                    {TACTICAL_FORMATIONS[activeFormation].map((p) => {
                      const currentPlayer = lineup[p.role] || "Boş";
                      const isSelectedNode = activePositionSelector === p.role;
                      const hasPlayer = currentPlayer && currentPlayer !== "Boş";
                      const avatarUrl = resolveAvatar(currentPlayer);
                      
                      return (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => setActivePositionSelector(isSelectedNode ? null : p.role)}
                          style={{ left: `${p.x}%`, top: `${p.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group focus:outline-none z-10"
                        >
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className={`rounded-full flex items-center justify-center border shadow-xl transition-all relative overflow-visible ${isSelectedNode ? 'border-fb-yellow bg-fb-navy scale-110 shadow-fb-yellow/30 w-12 h-12' : 'border-fb-yellow/50 bg-fb-navy/95 w-11 h-11 hover:border-white shadow-black/60'}`}
                          >
                            {hasPlayer ? (
                              <div className="w-full h-full rounded-full overflow-hidden relative">
                                <img loading="lazy"
                                  src={avatarUrl} 
                                  alt={currentPlayer}
                                  className="w-full h-full object-cover bg-slate-900"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute bottom-0 right-0 bg-fb-yellow text-fb-navy text-[7px] font-black leading-none px-1 py-0.5 rounded border border-fb-navy scale-90">
                                  {p.label}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-sans font-black text-fb-yellow/70">
                                {p.label}
                              </span>
                            )}
                          </motion.div>
                          <div className={`mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight text-center truncate max-w-[90px] leading-tight ${isSelectedNode ? 'bg-white text-fb-navy font-black shadow-lg' : 'bg-fb-dark/90 text-white border border-white/5 font-bold shadow-md'}`}>
                            {currentPlayer.split(' ').pop()}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Oyuncu Atama Paneli */}
                  <div className="p-4 rounded-xl bg-fb-dark/80 border border-white/5 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[9px] font-black uppercase text-fb-yellow tracking-widest block mb-2">OYUNCU ATAMA ODASI</span>
                      {activePositionSelector ? (
                        <div className="space-y-3">
                          <div className="p-2.5 rounded-lg bg-fb-navy/50 border border-fb-yellow/20 flex items-center justify-between">
                            <div className="text-left">
                              <span className="text-[8px] font-black text-fb-muted block uppercase">SEÇİLEN POZİSYON</span>
                              <span className="text-xs font-bold text-white uppercase">{TACTICAL_FORMATIONS[activeFormation].find(f => f.role === activePositionSelector)?.desc} ({activePositionSelector})</span>
                            </div>
                            <span className="text-[9px] px-1 py-0.5 rounded bg-fb-yellow/10 text-fb-yellow font-mono">Seçildi</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 font-bold leading-tight">Bu pozisyona yerleştirmek istediğiniz oyuncuyu seçin:</p>
                          
                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                            {/* Özel Transfer Girişi Seçeneği */}
                            <button
                              type="button"
                              onClick={() => {
                                const customName = prompt("Bu mevki için düşündüğünüz transfer adayının ismini girin (Örn: Paul Pogba veya TRANSFER):");
                                if (customName && customName.trim()) {
                                  handleAssignPlayer(activePositionSelector, customName.trim());
                                } else {
                                  handleAssignPlayer(activePositionSelector, "YENİ TRANSFER");
                                }
                              }}
                              className="w-full p-2.5 rounded-lg text-left text-xs font-black bg-gradient-to-r from-fb-yellow/20 to-fb-navy/30 border border-fb-yellow/40 hover:border-fb-yellow text-fb-yellow flex items-center gap-2 transition-all mb-1"
                            >
                              <PlusCircle size={14} className="text-fb-yellow animate-pulse" />
                              <span>✍ MEVKİYE TRANSFER YAZIN</span>
                            </button>

                            {playersForRole(activePositionSelector).map((pl: any) => {
                              const isPlaced = Object.values(lineup).includes(pl.name);
                              const isPlacedExactlyHere = lineup[activePositionSelector] === pl.name;
                              const pAvatar = pl.photo || pl.photoUrl || fallbackAvatarUrl(pl.name);

                              return (
                                <button
                                  key={pl.name}
                                  type="button"
                                  onClick={() => handleAssignPlayer(activePositionSelector, pl.name)}
                                  className={`w-full p-2 rounded-lg text-left text-xs font-bold flex items-center gap-2.5 transition-all ${isPlacedExactlyHere ? 'bg-fb-yellow/20 border border-fb-yellow text-white' : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-slate-300'}`}
                                >
                                  <img
                                    src={pAvatar}
                                    alt={pl.name}
                                    className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 object-cover object-top shrink-0"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                  />
                                  <div className="text-left flex-1 min-w-0">
                                    <span className="block truncate leading-tight">{pl.name}</span>
                                    <span className="text-[9px] font-bold text-fb-muted block">{pl.mainPosition || pl.position || ''}{pl.shirtNumber ? ` • #${pl.shirtNumber}` : ''}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                    {pl.marketValue && <span className="font-mono text-[9px] font-bold text-emerald-400/80">{pl.marketValue}</span>}
                                    {isPlaced && !isPlacedExactlyHere && (
                                      <span className="text-[8px] px-1 bg-white/10 text-slate-400 rounded font-normal shrink-0 font-sans">Dizili</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
                          <Sliders className="text-fb-muted mb-2 animate-bounce opacity-45" size={24} />
                          <p className="text-xs font-bold text-slate-300">Pozisyon Seçin</p>
                          <p className="text-[10px] text-fb-muted mt-1 max-w-[150px]">
                            Uyum ve performans endeksini simüle etmek için soldaki sahada bir role dokunun.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Taktik Notu */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-black uppercase text-fb-muted block">TAKTİK PLAN NOTU</span>
                      <input
                        type="text"
                        value={squadNotes}
                        onChange={(e) => setSquadNotes(e.target.value)}
                        placeholder="Örn: İsmail pres, Fred geçiş rolünde."
                        className="w-full bg-white/[0.02] border border-white/10 focus:border-fb-yellow/40 rounded-lg p-2 text-xs font-bold text-slate-200 placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Paylaş / Raporlama */}
                <div className="pt-2">
                  <button
                    onClick={handleShareLineup}
                    className="w-full flex items-center justify-center gap-2 group p-4 rounded-xl bg-gradient-to-r from-fb-yellow to-amber-400 text-fb-navy font-display font-black text-xs uppercase tracking-wider hover:shadow-[0_4px_20px_rgba(255,176,32,0.3)] transition-all cursor-pointer"
                  >
                    <Share2 size={14} className="group-hover:rotate-12 transition-transform" />
                    {copiedLineup ? "KOPYALANDI VE PAYLAŞILIYOR! ✓" : "PAYLAŞ"}
                  </button>
                </div>
              </div>
            </div>

            {/* SÖYLENTİ DEĞİRMENİ */}
            <div className="p-6 md:p-8 rounded-2xl bg-fb-card border border-white/[0.06] relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 p-3 text-[9px] font-black text-rose-400 bg-rose-500/10 uppercase rounded-bl-xl tracking-widest border-l border-b border-rose-500/10">
                SÖYLENTİLER
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-rose-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-rose-500">
                      DOĞRULUK VE SICAKLIK VEZNESİ
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black text-white mt-1 uppercase tracking-tight">
                    TRANSFER SÖYLENTİ DEĞİRMENİ
                  </h3>
                  <p className="text-xs text-fb-muted mt-1 leading-relaxed">
                    Ortalıkta dolaşan Fenerbahçe scout / transfer iddialarını taraftarlar oyluyor. Sence söylenti ne kadar sıcak?
                  </p>
                </div>

                {rumors.length === 0 && (
                  <div className="p-8 rounded-xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                    <Flame size={22} className="text-slate-600 mx-auto" />
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono">
                      Aktif transfer söylentisi bulunmuyor.
                    </p>
                    <p className="text-[10px] text-slate-500 italic">
                      Editör ekibi güvenilir kaynaklı iddiaları buraya ekledikçe taraftar oylaması açılır.
                    </p>
                  </div>
                )}
                <div className="content-auto space-y-4">
                  {rumors.map((rum) => {
                    const myVote = votedRumors[rum.id];
                    const totalVec = rum.hotVotes + rum.coldVotes;
                    const hotPercent = totalVec > 0 ? Math.round((rum.hotVotes / totalVec) * 100) : 50;
                    const coldPercent = 100 - hotPercent;

                    return (
                      <div key={rum.id} className="p-4 rounded-xl bg-fb-dark/60 border border-white/5 space-y-3 relative group text-left">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-fb-yellow/10 text-fb-yellow text-[9px] font-black uppercase tracking-wide">{rum.player}</span>
                              <span className="text-[10px] text-slate-400 font-bold">Kaynak: {rum.source}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 block mt-0.5 uppercase tracking-wider">{rum.role}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 font-bold leading-relaxed">{rum.excerpt}</p>

                        {/* Oylama Çubuğu veya Oy Verme Butonları */}
                        <div className="pt-2">
                          {myVote ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono font-black">
                                <span className="text-amber-400 flex items-center gap-1">🔥 GERÇEKÇİ (%{hotPercent})</span>
                                <span className="text-sky-400 flex items-center gap-1">❄️ ASILSIZ (%{coldPercent})</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden flex">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${hotPercent}%` }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full bg-amber-500"
                                />
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${coldPercent}%` }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full bg-sky-500"
                                />
                              </div>
                              <div className="flex items-center justify-between text-[8px] text-fb-muted font-bold pt-1">
                                <span>Toplam Değerlendirme: {totalVec} Taraftar</span>
                                <span className="text-fb-yellow">Tercihiniz: {myVote === 'hot' ? '🔥 Gerçekçi' : '❄️ Asılsız'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRumorVote(rum.id, 'hot')}
                                className="flex-1 py-2 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 text-[11px] font-black text-amber-400 transition-all text-center flex items-center justify-center gap-1 cursor-pointer font-sans"
                              >
                                <span>🔥</span> GERÇEKÇİ
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRumorVote(rum.id, 'cold')}
                                className="flex-1 py-2 px-3 rounded-lg border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-500/40 text-[11px] font-black text-sky-400 transition-all text-center flex items-center justify-center gap-1 cursor-pointer font-sans"
                              >
                                <span>❄️</span> ASILSIZ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Match Prediction Card */}
            {matchPrediction && (
              <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-[9px] font-black text-white bg-fb-navy uppercase rounded-bl-xl tracking-widest border-l border-b border-white/10">
                  SKOR TAHMİN AKLI
                </div>

                <div className="content-auto space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#FFD21F]">
                      YAKLAŞAN MAÇ TAHMİNİ
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-4 rounded-xl bg-fb-dark/80 border border-white/5">
                    <span className="text-xs font-black text-white tracking-tight">Fenerbahçe</span>
                    <span className="text-xs font-black text-fb-yellow italic font-mono uppercase tracking-widest">VS</span>
                    <span className="text-xs font-black text-slate-300 tracking-tight">{matchPrediction.awayTeam}</span>
                  </div>

                  <p className="text-sm font-bold text-slate-100 mt-2">
                    {matchPrediction.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {matchPrediction.options.map((option, idx) => {
                      const percentage = getPercentage(matchPrediction.votes, option);
                      const isSelected = votedMatchPredict === option;

                      return (
                        <div key={idx} className="relative">
                          {votedMatchPredict ? (
                            <div className={`p-3 rounded-xl border text-xs text-center font-semibold transition-all flex flex-col justify-center items-center h-20 ${isSelected ? 'border-fb-yellow/40 bg-fb-yellow/5' : 'border-white/5 bg-white/[0.01]'}`}>
                              <span className="text-fb-muted text-[10px] block mb-1">{option}</span>
                              <span className="text-base font-black text-fb-yellow font-mono">{percentage}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMatchVote(option)}
                              className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02]/30 hover:border-fb-yellow/30 hover:bg-white/[0.04] text-xs font-black text-slate-300 hover:text-white transition-all text-center h-20 flex flex-col justify-center items-center gap-1 group"
                            >
                              <span>{option}</span>
                              <span className="text-[9px] text-fb-muted font-bold group-hover:text-fb-yellow uppercase">TAHMİN ET</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub metrics inside card */}
                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-fb-dark/50">
                      <span className="text-[10px] font-black uppercase text-fb-muted block">En Çok Beklenen Skor</span>
                      <span className="text-base font-black text-white font-mono">{matchPrediction.expectedScore}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-fb-dark/50">
                      <span className="text-[10px] font-black uppercase text-fb-muted block">Taraftar Güven Puanı</span>
                      <span className="text-base font-black text-fb-accent font-mono">{matchPrediction.confidenceScore}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Match Man of the Week */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] overflow-hidden">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FFD21F] block mb-1">
                Tribün Seçimi
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mb-4">
                Haftanın Oyuncusu Kimdi?
              </h3>

              {Object.keys(playerVotes).length === 0 && (
                <div className="p-8 rounded-xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                  <Award size={22} className="text-slate-600 mx-auto" />
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono">
                    Bu hafta için oylama henüz açılmadı.
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Maç sonrası aday listesi yayınlandığında tribün seçimi burada başlar.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(playerVotes).map((option, idx) => {
                  const percentage = getPercentage(playerVotes, option);
                  const isSelected = votedPlayerOfWeek === option;
                  const count = playerVotes[option];

                  return (
                    <div key={idx} className="relative">
                      {votedPlayerOfWeek ? (
                        <div className={`p-4 rounded-xl border text-xs font-semibold flex flex-col justify-center gap-1.5 transition-all overflow-hidden ${isSelected ? 'border-fb-yellow/40 bg-fb-yellow/5' : 'border-white/5 bg-white/[0.01]'}`}>
                          <div className="flex justify-between items-center relative z-10">
                            <span className="text-slate-100 font-bold">{option}</span>
                            <span className="font-mono text-fb-yellow text-sm font-black">{percentage}</span>
                          </div>
                          {/* Inner bar */}
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative z-10">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: percentage }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full ${isSelected ? 'bg-fb-yellow' : 'bg-slate-500'}`}
                            />
                          </div>
                          <span className="text-[10px] text-fb-muted font-bold block self-end">{count} Oy</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePlayerVote(option)}
                          className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-fb-yellow/30 hover:bg-white/[0.03] text-xs font-bold transition-all text-slate-300 hover:text-white flex justify-between items-center group"
                        >
                          <span>{option}</span>
                          <span className="px-2.5 py-1 rounded bg-white/5 text-[9px] font-black uppercase text-fb-muted group-hover:bg-fb-yellow group-hover:text-fb-navy transition-colors">
                            TERCİH ET
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Discussion Topics Section */}
            <div id="discuss-list" className="space-y-6">
              <div className="flex justify-between items-baseline border-b border-white/[0.05] pb-3">
                <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tight">
                  TARTIŞMA BAŞLIKLARI
                </h3>
                <span className="text-xs text-fb-muted font-bold">Popüler Tartışmalar</span>
              </div>

              {/* Discussion detail view toggler */}
              <AnimatePresence mode="wait">
                {activeTopicId ? (
                  /* TOPIC CHAT ROOM PANEL */
                  (() => {
                    const activeTopic = topics.find(t => t.id === activeTopicId);
                    if (!activeTopic) return null;

                    return (
                      <motion.div 
                        key="active-topic"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="p-6 rounded-2xl bg-fb-card border border-fb-yellow/20 space-y-6 relative"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-fb-yellow/10 border border-fb-yellow/20 text-[10px] font-black uppercase text-fb-yellow tracking-wider">
                            {activeTopic.tag}
                          </span>
                          <button
                            onClick={() => setActiveTopicId(null)}
                            className="text-xs text-fb-muted hover:text-white font-bold underline"
                          >
                            Tüm Konulara Dön
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xl font-black text-white leading-tight">
                            {activeTopic.title}
                          </h4>
                          <p className="text-xs text-fb-muted mt-2 leading-relaxed font-semibold">
                            {activeTopic.excerpt}
                          </p>
                        </div>

                        {/* Interactive commenting feed */}
                        <div className="space-y-3.5 border-t border-b border-white/5 py-6">
                          <span className="text-[10px] tracking-widest uppercase font-black text-fb-muted block mb-2">Canlı Katılımlar ({activeTopic.commentCount})</span>
                          
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 space-y-3">
                            {activeTopic.comments.map((comm, cIdx) => (
                              <div key={cIdx} className="p-4 rounded-xl bg-fb-dark/80 border border-white/5 text-left space-y-2">
                                <div className="flex justify-between items-baseline">
                                  <span className="font-black text-xs text-fb-yellow">@{comm.username}</span>
                                  <span className="text-[9px] text-[#A2B1CC] font-bold">{comm.date}</span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed font-semibold">"{comm.text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Comment insertion Form */}
                        <form onSubmit={handleAddComment} className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                required
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Görüşünü buraya ekle..."
                                className="w-full px-4 py-3 rounded-lg bg-fb-dark/95 border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none focus:border-fb-yellow"
                              />
                            </div>
                            <button
                              type="submit"
                              className="px-5 py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Send size={12} />
                              GÖNDER
                            </button>
                          </div>
                        </form>

                        {/* TODO comment requested by requirements for discussion system */}
                        {/* TODO: Connect comment posting directly to Firestore comments collection in production */}

                        {topicToast && (
                          <div className="text-xs text-fb-accent font-black text-center mt-2 animate-bounce">
                            {topicToast}
                          </div>
                        )}
                      </motion.div>
                    );
                  })()
                ) : (
                  /* TOPIC TILES LIST */
                  <div className="content-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((top) => (
                      <motion.div
                        key={top.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-5 rounded-xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 flex flex-col justify-between transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-fb-yellow">
                            <span className="px-2 py-0.5 rounded bg-white/5 tracking-wider border border-white/5">{top.tag}</span>
                            <span className="text-fb-muted font-mono">{top.commentCount} yorum</span>
                          </div>
                          <h4 className="text-sm font-bold text-white tracking-tight line-clamp-2">
                            {top.title}
                          </h4>
                          <p className="text-xs text-fb-muted leading-relaxed line-clamp-3">
                            {top.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/[0.05]">
                          <button
                            onClick={() => setActiveTopicId(top.id)}
                            className="w-full py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-fb-yellow hover:text-fb-navy transition-all font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageSquare size={12} />
                            Tartışmaya Katıl
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* RIGHT SIDEBAR: Featured comments, fan pulse, guidelines, and newsletter CTA */}
          <div className="space-y-8 text-left">
            
            {/* 9. Community Guidelines */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FFD21F]" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white block">
                  TARAFTAR ODASI KURALLARI
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                  Burada fikirler sert olabilir ama saygı çizgisi korunur. Hakaret, nefret söylemi, hedef gösterme ve spam içerikler kabul edilmez.
                </p>
                
                <ul className="space-y-2 pt-2 border-t border-white/[0.05]">
                  {[
                    "Fikir özgür, hakaret yok.",
                    "Eleştiri serbest, kişisel saldırı yok.",
                    "Kaynaklı bilgi değerlidir.",
                    "Tartışma seviyeli kalmalı."
                  ].map((rule, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-xs text-slate-300 font-bold">
                      <span className="text-fb-yellow shrink-0 font-black">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 10. Join Community CTA & 11. Newsletter Signup */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-fb-card to-fb-navy/40 border border-[#FFD21F]/25 space-y-5">
              <div className="flex items-center gap-2">
                
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF001F] text-fb-yellow">BÜLTEN KATILIMI</span>
              </div>
              
              <h4 className="text-base font-black text-white italic uppercase tracking-tight leading-snug">
                Fenerbahçe Evreni topluluğuna katıl
              </h4>
              
              <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                Anketlere katıl, maç tahminlerini paylaş, haftalık bültene abone ol ve özel analizlerden haberdar ol.
              </p>

              {newsletterSubscribed ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-fb-accent/10 border border-fb-accent/20 text-fb-accent text-xs font-black text-center"
                >
                  Girişiniz alındı! Topluluk bültenine hoş geldiniz. ✓
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="E-posta adresin..."
                      className="w-full px-4 py-3 rounded-xl bg-fb-dark border border-white/10 text-xs focus:outline-none focus:border-fb-yellow text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="w-full py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>KATIL</span>
                    <ArrowRight size={12} />
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* 
        12. FUTURE COMMUNITY SYSTEM PLACEHOLDER (DEVELOPER COMMENT BLOCK ONLY) 
        Future Collections Schema:
        - comments => { id: string, discussionId: string, authorName: string, text: string, likes: number, createdAt: string }
        - discussionTopics => { id: string, title: string, category: string, replies: number, description: string, votes: number }
        - fanPredictions => { matchId: string, uid: string, predictedWinner: string, predictedScore: string, createdAt: string }
        - userProfiles => { uid: string, username: string, levelBadge: string, points: number }
        - communityVotes => { pollId: string, userId: string, selectedOption: string, votedAt: string }

        Future Features & Engineering Path:
        - Native Authenticated User flows utilizing Firebase Auth.
        - Direct real-time listener binding payload query for active matches and predictions leaderboard scoring.
        - Automated fan predictions badge achievements system.
      */}

      {showShareModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-[#0a141d] rounded-2xl border border-fb-yellow/30 shadow-[0_20px_50px_rgba(234,179,8,0.15)] p-6 relative overflow-hidden"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-fb-yellow/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF001F]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header Section */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-fb-yellow animate-ping" />
                <h4 className="font-display font-black text-white text-sm tracking-wider uppercase">
                  HAZIR! PAYLAŞMA KARTI
                </h4>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-fb-muted hover:text-white transition-colors p-1"
              >
                ✕ Kapat
              </button>
            </div>

            {/* Visual simulated card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#122434] to-[#040b10] border border-white/5 space-y-4 mb-5 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[10px] uppercase font-black text-fb-yellow tracking-widest leading-none">FENERBAHÇE EVRENİ</h5>
                  <span className="text-xs text-white/50 font-bold block mt-1">Özel 11 Kadrosu</span>
                </div>
                <div className="px-2 py-1 rounded bg-fb-yellow/10 border border-fb-yellow/30 text-fb-yellow text-[10px] font-black uppercase">
                  DİZİLİŞ: {activeFormation.split('').join('-')}
                </div>
              </div>

              {/* Player names list preview */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-2 border-y border-white/5">
                {TACTICAL_FORMATIONS[activeFormation]?.map(p => {
                  const plName = lineup[p.role] || "Boş";
                  return (
                    <div key={p.role} className="flex items-center gap-1.5 text-[10px] truncate">
                      <span className="text-fb-yellow/70 font-mono font-black shrink-0 w-8">{p.label}:</span>
                      <span className="truncate font-bold text-slate-200">
                        {plName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Metrics preview — gerçek kadro verileri */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-1.5 rounded bg-amber-400/5 border border-amber-400/10">
                  <span className="block text-[8px] text-fb-muted font-bold uppercase leading-none">OYUNCU</span>
                  <span className="text-xs font-black text-amber-400">{squadMetrics.filled}/{squadMetrics.slots}</span>
                </div>
                <div className="p-1.5 rounded bg-emerald-400/5 border border-emerald-400/10">
                  <span className="block text-[8px] text-fb-muted font-bold uppercase leading-none">YAŞ ORT.</span>
                  <span className="text-xs font-black text-emerald-400">{squadMetrics.avgAge}</span>
                </div>
                <div className="p-1.5 rounded bg-cyan-400/5 border border-cyan-400/10">
                  <span className="block text-[8px] text-fb-muted font-bold uppercase leading-none">DEĞER</span>
                  <span className="text-xs font-black text-cyan-400">{squadMetrics.totalValueLabel}</span>
                </div>
              </div>

              {/* Taktik plan preview */}
              <div className="text-center px-1">
                <span className="text-[8px] font-black text-fb-muted tracking-wider block uppercase">AKTİF TAKTİK PLAN NOTU</span>
                <p className="text-[10px] italic text-slate-300 font-bold leading-normal mt-0.5 truncate">
                  "{squadNotes || 'Taktik plan notunuzu ekleyin.'}"
                </p>
              </div>
            </div>

            {/* Action text */}
            <p className="text-[10px] text-fb-muted font-bold text-center mb-4">
              Kadro şablonunuz başarıyla kopyalandı! Sosyal medyada hızlıca paylaşmak için aşağıdaki servislerden birini seçin:
            </p>

            {/* Social network share action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Twitter */}
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🔥 Fenerbahçe Evreni'nde kurduğum ilk 11'im hazır!\n⚽ Diziliş: ${activeFormation.split('').join('-')}\n📊 Yaş Ort: ${squadMetrics.avgAge} | 💰 Değer: ${squadMetrics.totalValueLabel}\n\n👉 Kendi kadronu kurmak ve taraftar odasına katılmak için siteye gel!`
                )}`}
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-[#1DA1F2] hover:bg-[#1991db] text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all text-center"
              >
                <span>🐦 TWITTER (X)</span>
              </a>

              {/* WhatsApp */}
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🔥 Fenerbahçe Evreni'nde kurduğum efsane kadroma bak!\n⚽ Diziliş: ${activeFormation.split('').join('-')}\n📊 Yaş Ort: ${squadMetrics.avgAge} | 💰 Değer: ${squadMetrics.totalValueLabel}\n📝 Taktik Notu: ${squadNotes || '—'}\n\n👉 Kadroyu görmek ve kendi kadronu kurmak için tıklayın!`
                )}`}
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all text-center"
              >
                <span>💬 WHATSAPP</span>
              </a>

              {/* Instagram Walkthrough */}
              <button 
                type="button"
                onClick={() => {
                  alert("Mobil cihazınıza uygun kopya panoya alındı! Instagram Hikayesi veya Gönderisi açıp 'Metin' ekleyerek doğrudan yapıştırabilirsiniz.");
                }}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:scale-[1.02] text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all"
              >
                <span>📸 INSTAGRAM</span>
              </button>

              {/* TikTok Walkthrough */}
              <button 
                type="button"
                onClick={() => {
                  alert("TikTok için kopyalama tamamlandı! Videonuza veya durumunuza bu metni ekleyerek Fenerbahçeli taraftar arkadaşlarınızla etkileşime girin.");
                }}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-gradient-to-r from-black to-[#00f2fe] hover:scale-[1.02] text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all"
              >
                <span>🎵 TIKTOK</span>
              </button>
            </div>

            {/* Clipboard and final status info */}
            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => {
                  const plainText = TACTICAL_FORMATIONS[activeFormation]?.map(p => `${p.desc || p.role}: ${lineup[p.role] || 'Boş'}`).join('\n') || '';
                  const shareTxt = `Fenerbahçe Evreni Kadrom\nDiziliş: ${activeFormation.split('').join('-')}\nYaş Ortalaması: ${squadMetrics.avgAge}\nToplam Değer: ${squadMetrics.totalValueLabel}\n---\n${plainText}`;
                  navigator.clipboard.writeText(shareTxt);
                  alert("Kadro metni panoya kopyalandı!");
                }}
                className="text-[10px] text-fb-yellow font-black uppercase hover:underline cursor-pointer bg-transparent border-none outline-none"
              >
                📋 KADRO METNİNİ MANUEL KOPYALA
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
