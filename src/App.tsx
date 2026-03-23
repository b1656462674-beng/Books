/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Trophy, 
  Heart, 
  Share2, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Info,
  ArrowLeft,
  Gift,
  Star
} from 'lucide-react';
import { BookmarkTopic, Task, Reward, Book, UserState } from './types';
import { 
  BOOKMARK_TOPICS, 
  TASKS, 
  REWARDS, 
  INITIAL_BOOKS, 
  TOTAL_BOOKS_COUNT, 
  POINTS_PER_BOOK, 
  TOTAL_POINTS_NEEDED 
} from './constants';

// --- Components ---

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: React.Key }) => (
  <div onClick={onClick} className={`bg-brand-paper rounded-3xl shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline',
  disabled?: boolean,
  className?: string
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-brand-accent text-white shadow-md",
    secondary: "bg-white text-brand-accent border border-brand-accent/20",
    outline: "bg-transparent text-brand-accent border border-brand-accent"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const ProgressBar = ({ current, total, label }: { current: number, total: number, label?: string }) => {
  const percentage = Math.min(100, (current / total) * 100);
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs mb-1 text-gray-500 font-medium uppercase tracking-wider">
          <span>{label}</span>
          <span>{current}/{total}</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full bg-brand-accent"
        />
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'home' | 'card' | 'bookshelf' | 'charity' | 'rewards' | 'rules'>('home');
  const [flipKey, setFlipKey] = useState(0); // For triggering animation
  const [userState, setUserState] = useState<UserState>(() => {
    // Initial state
    return {
      flipChances: 0,
      totalLightingPoints: 0,
      books: INITIAL_BOOKS.map((title, i) => ({ id: i, title, points: 0 })),
      dailyCardId: null,
      lastCardDate: null,
      completedTasks: {},
      rewards: [],
      personalCharityValue: 0
    };
  });

  const [showRewardModal, setShowRewardModal] = useState<Reward | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // Derived state
  const litBooksCount = useMemo(() => userState.books.filter(b => b.points >= POINTS_PER_BOOK).length, [userState.books]);
  const currentBook = useMemo(() => {
    return userState.books.find(b => b.points < POINTS_PER_BOOK) || userState.books[userState.books.length - 1];
  }, [userState.books]);
  
  const today = new Date().toDateString();
  const hasDrawnToday = userState.lastCardDate === today;

  // Actions
  const drawCard = () => {
    if (hasDrawnToday) return;
    const randomTopic = BOOKMARK_TOPICS[Math.floor(Math.random() * BOOKMARK_TOPICS.length)];
    setUserState(prev => ({
      ...prev,
      dailyCardId: randomTopic.id,
      lastCardDate: today,
      flipChances: prev.flipChances + 1
    }));
    setView('card');
  };

  const handleFlip = () => {
    if (isFlipping) return;
    
    if (userState.flipChances <= 0) {
      showToast('去做任务获取翻书次数');
      return;
    }
    
    setIsFlipping(true);
    setFlipKey(prev => prev + 1);
    
    // Simulate flip animation delay
    setTimeout(() => {
      const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
      
      setUserState(prev => {
        const newBooks = [...prev.books];
        // Sequential lighting logic
        let pointsAdded = false;
        for (let i = 0; i < newBooks.length; i++) {
          if (newBooks[i].points < POINTS_PER_BOOK) {
            newBooks[i].points += 1;
            pointsAdded = true;
            break;
          }
        }

        return {
          ...prev,
          flipChances: prev.flipChances - 1 + (randomReward.type === 'flip_again' ? 1 : 0),
          totalLightingPoints: pointsAdded ? prev.totalLightingPoints + 1 : prev.totalLightingPoints,
          books: newBooks,
          rewards: randomReward.type !== 'flip_again' ? [...prev.rewards, randomReward] : prev.rewards,
          personalCharityValue: prev.personalCharityValue + 10
        };
      });
      
      setShowRewardModal(randomReward);
      setIsFlipping(false);
    }, 1000);
  };

  const completeTask = (taskId: string) => {
    const task = TASKS.find(t => t.id === taskId);
    if (!task) return;

    const currentCount = userState.completedTasks[taskId] || 0;
    if (currentCount >= task.limit) return;

    setUserState(prev => ({
      ...prev,
      completedTasks: {
        ...prev.completedTasks,
        [taskId]: currentCount + 1
      },
      flipChances: prev.flipChances + task.reward
    }));
  };

  // --- Sub-Views ---

  const HomeView = () => (
    <div className="space-y-8 pb-12">
      <header className="text-center pt-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 bg-brand-accent/10 rounded-full text-brand-accent text-xs font-semibold tracking-widest uppercase mb-4"
        >
          4.22 - 5.14 世界读书日
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl serif leading-tight mb-2"
        >
          世界共读计划
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-brand-accent/60 text-sm serif"
        >
          【翻阅并点亮书籍，助力全世界人民读书】
        </motion.p>
      </header>

      <div className="px-6 flex flex-col items-center">
        {/* Large Book Container */}
        <div className="relative w-full max-w-[280px] aspect-[3/4] perspective-1000 group cursor-pointer mb-8" onClick={handleFlip}>
          <div className="absolute inset-0 bg-brand-accent/10 rounded-r-2xl translate-x-2 translate-y-2 blur-xl" />
          
          <motion.div 
            className="relative w-full h-full preserve-3d"
            animate={isFlipping ? { rotateY: -15 } : { rotateY: 0 }}
          >
            {/* Book Base/Back */}
            <div className="absolute inset-0 bg-white rounded-r-2xl shadow-xl border-l-8 border-brand-accent/20 flex flex-col p-8 items-center justify-center text-center overflow-hidden">
               <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-accent via-transparent to-transparent" />
              </div>
              <BookOpen size={64} className="text-brand-accent/20 mb-6" />
              <p className="text-gray-400 text-xs serif italic">“书籍是人类进步的阶梯”</p>
            </div>

            {/* Flipping Page */}
            <AnimatePresence mode="popLayout">
              {isFlipping && (
                <motion.div
                  key={flipKey}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: -160 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 origin-left bg-white rounded-r-2xl shadow-lg border-l-4 border-gray-100 z-20 backface-hidden"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 p-8 flex flex-col">
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-4" />
                    <div className="w-3/4 h-2 bg-gray-100 rounded-full mb-4" />
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-4" />
                    <div className="w-5/6 h-2 bg-gray-100 rounded-full mb-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Book Cover (Current Book) */}
            <motion.div 
              className="absolute inset-0 bg-white rounded-r-2xl shadow-2xl border-l-[12px] border-brand-accent flex flex-col p-8 items-center justify-between z-10"
              animate={isFlipping ? { opacity: 0, pointerEvents: 'none' } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full flex justify-between items-center">
                <div className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">NO. {currentBook.id + 1}</div>
                <Star size={12} className="text-brand-accent fill-brand-accent" />
              </div>
              
              <div className="text-center">
                <h3 className="text-3xl serif leading-tight mb-4">{currentBook.title}</h3>
                <div className="w-12 h-1 bg-brand-accent/20 mx-auto rounded-full" />
              </div>

              <div className="w-full space-y-3">
                <ProgressBar current={currentBook.points} total={POINTS_PER_BOOK} />
                <div className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tighter">
                  点击翻阅，书中自有黄金屋
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <div className="text-xs text-brand-accent font-bold tracking-widest uppercase mb-1">
            书本阅读进度：{currentBook.id + 1}/9
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest">
            剩余翻书次数: <span className="text-brand-accent font-bold">{userState.flipChances}</span>
          </div>
        </div>

        <div className="w-full space-y-4">
          {/* Daily Card Entry */}
          <div 
            onClick={() => hasDrawnToday ? setView('card') : drawCard()}
            className="bg-brand-accent text-white p-6 rounded-3xl flex items-center justify-between cursor-pointer group shadow-lg shadow-brand-accent/20"
          >
            <div>
              <h4 className="text-lg serif">{hasDrawnToday ? '查看今日书签' : '抽取今日书签'}</h4>
              <p className="text-white/70 text-xs mt-1">每日抽卡可得翻书次数 +1</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-active:scale-90 transition-transform">
              <Star className={hasDrawnToday ? "fill-white" : ""} />
            </div>
          </div>

          {/* Charity Preview */}
          <Card onClick={() => setView('charity')} className="cursor-pointer hover:bg-gray-50 transition-colors border border-black/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                <Heart size={24} fill="currentColor" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">爱心公益进度</h4>
                <p className="text-xs text-gray-500">全站已累计翻书 124,582 次</p>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </div>
          </Card>

          {/* Tasks Section Embedded */}
          <div className="pt-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl serif">任务中心</h2>
              <div className="text-xs font-bold text-brand-accent">
                翻书次数: {userState.flipChances}
              </div>
            </div>

            <div className="space-y-8">
              {[
                { id: 'daily', label: '每日任务' },
                { id: 'once', label: '一次性任务' },
                { id: 'unlimited', label: '不限次任务' }
              ].map(cat => (
                <div key={cat.id} className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                    <div className="w-1 h-3 bg-brand-accent rounded-full" />
                    {cat.label}
                  </h3>
                  <div className="space-y-3">
                    {TASKS.filter(t => t.category === cat.id).map(task => {
                      const currentCount = userState.completedTasks[task.id] || 0;
                      const completed = currentCount >= task.limit;
                      const progress = (currentCount / task.limit) * 100;
                      
                      return (
                        <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${completed ? 'bg-green-50 text-green-500' : 'bg-brand-bg text-brand-accent'}`}>
                              {completed ? <CheckCircle2 size={20} /> : <Star size={20} />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <p className="text-[10px] text-gray-400">{task.condition}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-bold text-brand-accent mb-1">+{task.reward} 次</div>
                              <button 
                                onClick={() => completeTask(task.id)}
                                disabled={completed}
                                className={`text-[10px] px-3 py-1 rounded-full border ${completed ? 'border-gray-100 text-gray-300' : 'border-brand-accent text-brand-accent'}`}
                              >
                                {completed ? '已完成' : '去完成'}
                              </button>
                            </div>
                          </div>
                          {task.limit > 1 && task.limit < 999 && (
                            <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase">
                              <span>进度</span>
                              <span>{currentCount}/{task.limit}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CardView = () => {
    const topic = BOOKMARK_TOPICS.find(t => t.id === userState.dailyCardId);
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center space-y-8">
        <button onClick={() => setView('home')} className="absolute top-6 left-6 p-2 rounded-full bg-white shadow-sm">
          <ArrowLeft size={20} />
        </button>
        
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className="w-full max-w-sm aspect-[3/4] bg-white rounded-[2rem] shadow-2xl p-12 flex flex-col items-center text-center border-8 border-brand-accent/5"
        >
          <div className="w-16 h-1 bg-brand-accent/20 rounded-full mb-12" />
          <div className="serif text-brand-accent text-sm tracking-widest uppercase mb-8">今日书签话题</div>
          <div className="flex-1 flex items-center">
            <h2 className="text-3xl serif leading-relaxed">“{topic?.content}”</h2>
          </div>
          <div className="w-full pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>{today}</span>
            <span>NO. 0{userState.dailyCardId}</span>
          </div>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          <Button className="w-full">去发帖参与话题</Button>
          <Button variant="secondary" className="w-full">去语聊房讨论</Button>
        </div>
      </div>
    );
  };

  const TasksView = () => (
    <div className="p-6 pb-32 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => setView('home')} className="p-2 rounded-full bg-white shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl serif">任务中心</h2>
        <div className="w-10" />
      </div>

      <div className="bg-brand-accent text-white p-6 rounded-3xl flex items-center justify-between">
        <div>
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">当前可用翻书次数</p>
          <span className="text-4xl font-light">{userState.flipChances}</span>
        </div>
        <Button onClick={() => setView('home')} variant="secondary" className="bg-white/20 border-none text-white">
          去翻书
        </Button>
      </div>

      <div className="space-y-8">
        {[
          { id: 'daily', label: '每日任务' },
          { id: 'once', label: '一次性任务' },
          { id: 'unlimited', label: '不限次任务' }
        ].map(cat => (
          <div key={cat.id} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
              <div className="w-1 h-3 bg-brand-accent rounded-full" />
              {cat.label}
            </h3>
            <div className="space-y-3">
              {TASKS.filter(t => t.category === cat.id).map(task => {
                const currentCount = userState.completedTasks[task.id] || 0;
                const completed = currentCount >= task.limit;
                const progress = (currentCount / task.limit) * 100;
                
                return (
                  <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${completed ? 'bg-green-50 text-green-500' : 'bg-brand-bg text-brand-accent'}`}>
                        {completed ? <CheckCircle2 size={20} /> : <Star size={20} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.name}</h4>
                        <p className="text-[10px] text-gray-400">{task.condition}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-brand-accent mb-1">+{task.reward} 次</div>
                        <button 
                          onClick={() => completeTask(task.id)}
                          disabled={completed}
                          className={`text-[10px] px-3 py-1 rounded-full border ${completed ? 'border-gray-100 text-gray-300' : 'border-brand-accent text-brand-accent'}`}
                        >
                          {completed ? '已完成' : '去完成'}
                        </button>
                      </div>
                    </div>
                    {task.limit > 1 && task.limit < 999 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase">
                          <span>进度</span>
                          <span>{currentCount}/{task.limit}</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-accent" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BookshelfView = () => (
    <div className="p-6 pb-32 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => setView('home')} className="p-2 rounded-full bg-white shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl serif">世界共读书架</h2>
        <div className="w-10" />
      </div>

      <div className="text-center space-y-2">
        <div className="text-4xl serif">{litBooksCount}/9</div>
        <p className="text-xs text-gray-400 uppercase tracking-widest">已点亮书本</p>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-4 aspect-square">
        {userState.books.map((book) => {
          const isLit = book.points >= POINTS_PER_BOOK;
          const progress = (book.points / POINTS_PER_BOOK) * 100;
          
          return (
            <motion.div
              key={book.id}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-xl overflow-hidden flex flex-col items-center justify-end p-2 transition-all duration-500 ${isLit ? 'bg-white shadow-md' : 'bg-gray-200 grayscale opacity-60'}`}
            >
              {/* Book Spine Representation */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <BookOpen size={40} />
              </div>
              
              <div className="relative z-10 text-center">
                <div 
                  className="serif text-[10px] leading-tight mb-2 writing-vertical-rl"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {book.title}
                </div>
                <div className="h-1 w-8 bg-gray-100 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-brand-accent transition-all duration-300" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>

              {isLit && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-1 right-1"
                >
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="pt-8 space-y-4">
        <Button onClick={() => setView('home')} variant="primary" className="w-full">
          去首页翻书
        </Button>
        <Button onClick={() => setView('charity')} variant="outline" className="w-full">
          查看献爱心进度
        </Button>
      </div>
    </div>
  );

  const CharityView = () => (
    <div className="p-6 pb-24 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => setView('home')} className="p-2 rounded-full bg-white shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl serif">献爱心</h2>
        <div className="w-10" />
      </div>

      <div className="text-center space-y-4 py-8">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
          <Heart size={48} fill="currentColor" />
        </div>
        <h3 className="text-xl serif">阅读公益，爱心传递</h3>
        <p className="text-sm text-gray-500 px-8">
          你每点亮一本书，都在为阅读公益积攒一份力量。全站累计翻书达到阈值，平台将统一捐赠图书资源。
        </p>
      </div>

      <Card className="space-y-6">
        <div>
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            <span>全站累计翻书</span>
            <span>目标: 1,000,000</span>
          </div>
          <ProgressBar current={124582 + userState.personalCharityValue} total={1000000} />
          <p className="text-[10px] text-gray-400 mt-2 text-center">当前已达成 12.4%</p>
        </div>

        <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-light text-brand-accent">{userState.personalCharityValue}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">个人爱心值</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-2xl font-light text-brand-accent">{litBooksCount}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">点亮书本数</div>
          </div>
        </div>
      </Card>

      <Button className="w-full">
        <Share2 size={18} />
        分享邀请好友参与
      </Button>
    </div>
  );

  const RewardsView = () => (
    <div className="p-6 pb-24 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => setView('home')} className="p-2 rounded-full bg-white shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl serif">我的奖励</h2>
        <div className="w-10" />
      </div>

      {userState.rewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <Gift size={64} strokeWidth={1} className="mb-4" />
          <p>暂无奖励，快去翻书吧</p>
          <Button onClick={() => setView('bookshelf')} variant="outline" className="mt-6">去翻书</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {userState.rewards.map((reward, i) => (
            <Card key={i} className="flex flex-col items-center text-center p-4">
              <div className="text-4xl mb-2">{reward.icon}</div>
              <h4 className="font-bold text-sm">{reward.name}</h4>
              <p className="text-[10px] text-gray-400">{reward.description}</p>
              <button className="mt-4 text-[10px] px-3 py-1 rounded-full bg-brand-bg text-brand-accent font-bold">查看详情</button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-brand-bg relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'home' && <HomeView />}
          {view === 'card' && <CardView />}
          {view === 'bookshelf' && <BookshelfView />}
          {view === 'charity' && <CharityView />}
          {view === 'rewards' && <RewardsView />}
          {view === 'rules' && (
            <div className="p-6 space-y-6">
               <div className="flex items-center justify-between">
                <button onClick={() => setView('home')} className="p-2 rounded-full bg-white shadow-sm">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl serif">活动规则</h2>
                <div className="w-10" />
              </div>
              <Card className="text-sm text-gray-600 space-y-4 leading-relaxed">
                <p>1. 活动时间：4月22日 - 5月14日。</p>
                <p>2. 每日可抽取一次书签话题卡，完成任务可获得翻书次数。</p>
                <p>3. 消耗翻书次数可获得随机奖励，并增加书架点亮进度。</p>
                <p>4. 书架共9本书，每本书需3点点亮值。全部点亮可解锁终极爱心大奖。</p>
                <p>5. 公益捐赠：全站翻书次数达到目标后，平台将以全体参与用户名义进行公益捐赠。</p>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Side Navigation Rail */}
      <div className="fixed top-1/2 right-4 -translate-y-1/2 flex flex-col gap-6 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/20 z-40">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-brand-accent' : 'text-gray-400'}`}>
          <BookOpen size={20} />
          <span className="text-[10px] uppercase tracking-tighter font-bold">首页</span>
        </button>
        <button onClick={() => setView('bookshelf')} className={`flex flex-col items-center gap-1 ${view === 'bookshelf' ? 'text-brand-accent' : 'text-gray-400'}`}>
          <Trophy size={20} />
          <span className="text-[10px] uppercase tracking-tighter font-bold">书架</span>
        </button>
        <button onClick={() => setView('rewards')} className={`flex flex-col items-center gap-1 ${view === 'rewards' ? 'text-brand-accent' : 'text-gray-400'}`}>
          <Gift size={20} />
          <span className="text-[10px] uppercase tracking-tighter font-bold">奖励</span>
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-black/80 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl backdrop-blur-md whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-brand-accent/5 -skew-y-6 -translate-y-12" />
              
              <button 
                onClick={() => setShowRewardModal(null)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500"
              >
                <X size={24} />
              </button>

              <div className="relative z-10">
                <div className="text-6xl mb-6">{showRewardModal.icon}</div>
                <h3 className="text-2xl serif mb-2">
                  {showRewardModal.type === 'flip_again' ? '太棒了！' : '恭喜获得'}
                </h3>
                <p className="text-brand-accent font-bold text-lg mb-4">{showRewardModal.name}</p>
                <p className="text-gray-400 text-sm mb-8">{showRewardModal.description}</p>
                
                <div className="space-y-3">
                  <Button onClick={() => setShowRewardModal(null)} className="w-full">
                    领取
                  </Button>
                  <Button 
                    onClick={() => {
                      if (userState.flipChances > 0) {
                        handleFlip();
                      } else {
                        setShowRewardModal(null);
                      }
                    }} 
                    variant="secondary" 
                    className="w-full"
                    disabled={isFlipping}
                  >
                    {isFlipping ? '翻阅中...' : '继续翻书'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
