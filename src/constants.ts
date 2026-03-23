import { BookmarkTopic, Reward, Task } from './types';

export const BOOKMARK_TOPICS: BookmarkTopic[] = [
  { id: '1', content: '最想推荐给外国朋友的一本书' },
  { id: '2', content: '哪一句书里的话安慰过你' },
  { id: '3', content: '小时候最喜欢的故事' },
  { id: '4', content: '适合睡前听的一本书' },
  { id: '5', content: '一本你读完后久久走不出来的书' },
  { id: '6', content: '如果只能带一本到孤岛，你选哪本' },
  { id: '7', content: '你最近一次被一本书“治愈”的瞬间' },
];

export const TASKS: Task[] = [
  // Basic
  { id: 't1', name: '每日抽卡', condition: '每日抽取书签话题卡', reward: 1, limit: 1, type: 'basic', category: 'daily', completedCount: 0 },
  { id: 't2', name: '分享活动', condition: '点击分享活动页 1 次', reward: 1, limit: 1, type: 'basic', category: 'once', completedCount: 0 },
  // Content
  { id: 't3', name: '发布帖文', condition: '带话题 #世界读书日发布帖文', reward: 2, limit: 2, type: 'content', category: 'daily', completedCount: 0 },
  { id: 't4', name: '帖文被点赞', condition: '带话题帖文点赞数≥30', reward: 1, limit: 3, type: 'content', category: 'daily', completedCount: 0 },
  { id: 't5', name: '点赞他人', condition: '点赞活动相关帖子 ≥5 次', reward: 1, limit: 1, type: 'content', category: 'daily', completedCount: 0 },
  { id: 't9', name: '送礼', condition: '给活动相关帖子送活动礼物/coins', reward: 1, limit: 999, type: 'content', category: 'unlimited', completedCount: 0 },
  // Voice
  { id: 't6', name: '停留一会儿', condition: '在活动房累计停留 ≥10分钟', reward: 1, limit: 1, type: 'voice', category: 'daily', completedCount: 0 },
  { id: 't7', name: '开口聊一句', condition: '在活动标签房上麦 ≥1 次', reward: 1, limit: 1, type: 'voice', category: 'daily', completedCount: 0 },
  { id: 't10', name: '送出共读支持', condition: '在活动标签房送出>=10 coins的礼物', reward: 1, limit: 999, type: 'voice', category: 'unlimited', completedCount: 0 },
  { id: 't8', name: '开播达标', condition: '当日活动房累计开播时长 ≥30分钟', reward: 1, limit: 1, type: 'voice', category: 'daily', completedCount: 0 },
  { id: 't11', name: '观看达标', condition: '当日场均观看时长 ≥5分钟', reward: 1, limit: 1, type: 'voice', category: 'daily', completedCount: 0 },
  // Special
  { id: 't12', name: '连续签到', condition: '连续 3 天完成抽卡并至少翻书 1 次', reward: 1, limit: 1, type: 'basic', category: 'once', completedCount: 0 },
  { id: 't13', name: '双端打卡', condition: '同一天完成 1 个内容任务 + 1 个语聊任务', reward: 1, limit: 1, type: 'basic', category: 'daily', completedCount: 0 },
];

export const REWARDS: Reward[] = [
  { id: 'r1', name: '精美礼物', type: 'virtual', description: '直播间专属礼物', icon: '🎁' },
  { id: 'r2', name: '7天VIP', type: 'vip', description: '尊享会员权益', icon: '👑' },
  { id: 'r3', name: '读书卡', type: 'vip', description: '全场书籍免费读', icon: '📖' },
  { id: 'r4', name: '再翻一次', type: 'flip_again', description: '获得额外翻书机会', icon: '🔄' },
];

export const INITIAL_BOOKS: string[] = [
  '百年孤独', '小王子', '月亮与六便士',
  '追风筝的人', '活着', '解忧杂货店',
  '三体', '人类简史', '围城'
];

export const TOTAL_BOOKS_COUNT = 9;
export const POINTS_PER_BOOK = 3;
export const TOTAL_POINTS_NEEDED = TOTAL_BOOKS_COUNT * POINTS_PER_BOOK;
