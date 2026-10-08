export type TrackerShortcut = {
  href: '/water' | '/diet' | '/weight' | '/sleep' | '/steps' | '/wellness';
  title: string;
  value: string;
  detail: string;
};

export type CareShortcut = {
  href: '/health-centers' | '/doctors' | '/chatbot' | '/profile';
  title: string;
  value: string;
  detail: string;
};

export const userProfile = {
  name: 'Alex Rivera',
  age: 28,
  heightCm: 170,
  goalWeightKg: 68,
  dailyWaterGoalL: 2.5,
  dailyStepGoal: 8000,
};

export const waterSummary = {
  todayL: 1.5,
  goalL: 2.5,
  glasses: [
    { id: 'w1', time: '8:10 AM', amountMl: 250 },
    { id: 'w2', time: '10:40 AM', amountMl: 250 },
    { id: 'w3', time: '1:15 PM', amountMl: 500 },
    { id: 'w4', time: '4:05 PM', amountMl: 500 },
  ],
};

export const dietMeals = [
  { id: 'm1', name: 'Oatmeal with berries', meal: 'Breakfast', calories: 320 },
  { id: 'm2', name: 'Chicken rice bowl', meal: 'Lunch', calories: 540 },
  { id: 'm3', name: 'Greek yogurt', meal: 'Snack', calories: 150 },
];

export const weightHistory = [
  { id: 'wt1', date: 'Oct 1', kg: 71.2 },
  { id: 'wt2', date: 'Oct 4', kg: 70.8 },
  { id: 'wt3', date: 'Oct 8', kg: 70.4 },
];

export const sleepLastNight = {
  date: 'Oct 7',
  hours: 7.2,
  bedtime: '11:20 PM',
  wakeTime: '6:35 AM',
  quality: 'Fair',
};

export const stepsToday = {
  count: 6240,
  goal: 8000,
  distanceKm: 4.6,
  activeMinutes: 48,
};

export const wellnessCheck = {
  selectedMood: 'Okay',
  moods: ['Great', 'Good', 'Okay', 'Low', 'Stressed'],
  note: 'Slept a bit late, but energy is steady.',
};

export const chatbotMessages = [
  { id: 'c1', from: 'bot' as const, text: 'Hi Alex. I can help with general wellness questions.' },
  { id: 'c2', from: 'user' as const, text: 'How much water should I drink today?' },
  {
    id: 'c3',
    from: 'bot' as const,
    text: 'Your mock goal is 2.5 L. You have logged 1.5 L so far.',
  },
];

export const healthCenters = [
  {
    id: 'h1',
    name: 'Riverside Clinic',
    type: 'Primary care',
    distance: '0.8 km',
    hours: '8:00 AM – 6:00 PM',
  },
  {
    id: 'h2',
    name: 'Harbor Wellness Center',
    type: 'Walk-in',
    distance: '1.4 km',
    hours: '9:00 AM – 8:00 PM',
  },
  {
    id: 'h3',
    name: 'Northside Health Hub',
    type: 'Community clinic',
    distance: '2.1 km',
    hours: '7:30 AM – 5:00 PM',
  },
];

export const doctors = [
  { id: 'd1', name: 'Dr. Maya Chen', specialty: 'General practice', nextSlot: 'Tomorrow, 10:30 AM' },
  { id: 'd2', name: 'Dr. Omar Hassan', specialty: 'Nutrition', nextSlot: 'Fri, 2:00 PM' },
  { id: 'd3', name: 'Dr. Priya Nair', specialty: 'Sleep medicine', nextSlot: 'Mon, 9:15 AM' },
];

export const trackerShortcuts: TrackerShortcut[] = [
  { href: '/water', title: 'Water', value: '1.5 L', detail: 'Goal 2.5 L' },
  { href: '/diet', title: 'Diet', value: '1,010 kcal', detail: '3 meals logged' },
  { href: '/weight', title: 'Weight', value: '70.4 kg', detail: 'Latest entry' },
  { href: '/sleep', title: 'Sleep', value: '7.2 hrs', detail: 'Last night' },
  { href: '/steps', title: 'Steps', value: '6,240', detail: 'Goal 8,000' },
  { href: '/wellness', title: 'Wellness', value: 'Okay', detail: 'Today’s check-in' },
];

export const careShortcuts: CareShortcut[] = [
  { href: '/chatbot', title: 'Chatbot', value: 'Ask a question', detail: 'Rule-based helper later' },
  { href: '/health-centers', title: 'Health Centers', value: '3 nearby', detail: 'Mock locations' },
  { href: '/doctors', title: 'Doctors', value: '3 available', detail: 'Mock consultations' },
  { href: '/profile', title: 'Profile', value: userProfile.name, detail: 'Goals and details' },
];
