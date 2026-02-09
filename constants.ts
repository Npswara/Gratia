import { SharedData, UserRole } from './types';

export const INITIAL_SHARED_DATA: SharedData = {
  language: 'en',
  pairingCode: '',
  userName: '',
  childName: 'Little One',
  childNickname: 'Sunshine',
  pregnancyStartDate: new Date().toISOString(),
  expectedDueDate: new Date(new Date().setMonth(new Date().getMonth() + 9)).toISOString(),
  isPostPregnant: false,
  currentMood: '😊 Happy',
  moodHistory: [],
  tasks: [],
  chatMessages: [],
  // Initialize missing aiConsultHistory property
  aiConsultHistory: [],
  isPeriodNotified: false,
  isMotherLocationSharing: false,
  isFatherLocationSharing: false,
  kickCountHistory: [],
  photoJourney: [],
  partnerMessages: [],
  communityPosts: [
    {
      id: '1',
      author: 'Mama Sarah',
      content: 'Hello Moms! So happy to join Gratia.',
      timestamp: new Date().toISOString(),
      likes: 1,
      tags: ['Greeting']
    }
  ],
  checkups: []
};

export const CHILD_PHASES = [
  'Pregnancy',
  'Newborn (0-1 Yr)',
  'Toddler (1-3 Yrs)',
  'Preschool (3-6 Yrs)',
  'Primary School (6-12 Yrs)',
  'Teenager (12+ Yrs)'
];

export const FATHER_MOMENT_CATEGORIES = [
  'Family Photo',
  'With Child',
  'Solo Child',
  'With Wife'
];

export const FEATURED_ARTICLES = {
  [UserRole.MOTHER]: [
    {
      id: 'm1',
      title: "Self-Care for the Second Trimester",
      content: "As you enter the 'honeymoon phase' of pregnancy, focus on gentle movement and deep nutrition. Stay hydrated and try to maintain a consistent sleep schedule to support your growing child.",
      category: "Wellness"
    },
    {
      id: 'm2',
      title: "Preparing for Postpartum Recovery",
      content: "The fourth trimester is just as important as the first three. Prepare a healing kit with comfortable clothes, nutritious frozen meals, and a supportive social circle.",
      category: "Planning"
    },
    {
      id: 'm3',
      title: "Understanding Depression and Anxiety",
      content: "Postpartum depression and anxiety are common and treatable. If you feel persistent sadness, irritability, or overwhelming worry, reaching out to your doctor is a sign of strength, not weakness.",
      category: "Mental Health"
    },
    {
      id: 'm4',
      title: "Navigating Newborn Care & Feeding",
      content: "Whether breastfeeding or formula feeding, the early days can be a struggle. Learn to recognize your child's hunger cues and don't hesitate to consult a specialist for latching or feeding issues.",
      category: "Newborn Care"
    },
    {
      id: 'm5',
      title: "Sex, Birth Control, and Future Planning",
      content: "Your body needs time to heal before resuming intimacy. Discuss birth control options with your provider during your 6-week checkup to plan your future health and family journey safely.",
      category: "Recovery"
    }
  ],
  [UserRole.FATHER]: [
    {
      id: 'f1',
      title: "Being an Active Pregnancy Partner",
      content: "Support isn't just about chores. Listen to her concerns, attend appointments when possible, and educate yourself on the birth process. Your presence is her greatest comfort.",
      category: "Partnership"
    },
    {
      id: 'f2',
      title: "Bonding with your Newborn",
      content: "Skin-to-skin contact isn't just for moms. Dads can build a deep connection through child-wearing, bath time, and responsive soothing during those late-night hours.",
      category: "Bonding"
    },
    {
      id: 'f3',
      title: "Identifying PPD and Anxiety Signs",
      content: "As a partner, you are the first line of defense. Watch for changes in her sleep, appetite, and mood. Encouraging her to speak with a professional can make a massive difference in her recovery.",
      category: "Support"
    },
    {
      id: 'f4',
      title: "Mastering Newborn Care Together",
      content: "Take an active role in feeding schedules and general care. Helping with diaper changes or bottle preparation gives your partner time to rest and strengthens your own bond with the child.",
      category: "Caregiving"
    },
    {
      id: 'f5',
      title: "Intimacy and Future Pregnancy Planning",
      content: "Patience and communication are vital as you both navigate physical intimacy postpartum. Support her recovery, discuss contraception together, and prioritize her comfort and readiness.",
      category: "Partnership"
    }
  ]
};