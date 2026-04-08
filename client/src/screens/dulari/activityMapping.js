/**
 * activityMapping.js
 *
 * Defines which activities are recommended for each anxiety level,
 * and provides helper to de-prioritise recently completed ones.
 */

const ALL_ACTIVITIES = {
  Minimal: [
    {
      id: 'free_drawing',
      name: 'Free Drawing',
      type: 'drawing',
      description: 'Express yourself through free-form drawing. Let your creativity flow.',
      duration: '10–15 min',
      icon: '🎨',
    },
    {
      id: 'gratitude_journal',
      name: 'Gratitude Journal',
      type: 'journal',
      description: 'Write 3 things you are grateful for today to cultivate positivity.',
      duration: '5–10 min',
      icon: '📓',
    },
    {
      id: 'nature_sounds',
      name: 'Nature Sound Therapy',
      type: 'nature_sounds',
      description: 'Listen to calming nature sounds like rain, forest, or ocean waves.',
      duration: '10–20 min',
      icon: '🌿',
    },
    {
      id: 'breathing_basic',
      name: 'Basic Breathing',
      type: 'breathing',
      config: { inhale: 4, hold: 2, exhale: 4, cycles: 5 },
      description: 'Simple 4-2-4 breathing to calm your mind and body.',
      duration: '5 min',
      icon: '🌬️',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a selfie and receive personalised music recommendations based on your mood.',
      duration: '10–20 min',
      icon: '🎵',
    },
  ],

  Mild: [
    {
      id: 'breathing_478',
      name: '4-7-8 Breathing',
      type: 'breathing',
      config: { inhale: 4, hold: 7, exhale: 8, cycles: 4 },
      description: 'The 4-7-8 technique helps reduce anxiety quickly and promote calm.',
      duration: '5–8 min',
      icon: '🌬️',
    },
    {
      id: 'prompt_drawing',
      name: 'Guided Drawing',
      type: 'prompt_drawing',
      prompts: [
        'Draw how you feel today',
        'Draw a place that makes you calm',
        'Draw something that makes you smile',
      ],
      description: 'Follow guided prompts to draw and express your inner feelings.',
      duration: '15–20 min',
      icon: '✏️',
    },
    {
      id: 'colouring',
      name: 'Colouring Activity',
      type: 'colouring',
      description: 'Tap to colour the grid. A simple, mindful colouring exercise.',
      duration: '10–15 min',
      icon: '🖍️',
    },
    {
      id: 'gratitude_journal',
      name: 'Gratitude Journal',
      type: 'journal',
      description: 'Write 3 things you are grateful for today to cultivate positivity.',
      duration: '5–10 min',
      icon: '📓',
    },
    {
      id: 'nature_sounds',
      name: 'Nature Sound Therapy',
      type: 'nature_sounds',
      description: 'Listen to calming nature sounds like rain, forest, or ocean waves.',
      duration: '10–20 min',
      icon: '🌿',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a selfie and receive personalised music recommendations based on your mood.',
      duration: '10–20 min',
      icon: '🎵',
    },
  ],

  Moderate: [
    {
      id: 'muscle_relaxation',
      name: 'Progressive Muscle Relaxation',
      type: 'muscle_relaxation',
      description: 'Systematically tense and relax muscle groups to release physical tension.',
      duration: '15–20 min',
      icon: '💪',
    },
    {
      id: 'breathing_box',
      name: 'Box Breathing',
      type: 'breathing',
      config: { inhale: 4, hold: 4, exhale: 4, cycles: 6 },
      description: 'Box breathing (4-4-4) used by professionals to manage stress.',
      duration: '8–10 min',
      icon: '🌬️',
    },
    {
      id: 'meditation',
      name: 'Body Scan Meditation',
      type: 'meditation',
      description: 'A guided body scan to bring awareness and release tension from head to toe.',
      duration: '15–20 min',
      icon: '🧘',
    },
    {
      id: 'prompt_drawing',
      name: 'Guided Drawing',
      type: 'prompt_drawing',
      prompts: [
        'Draw your worries as shapes',
        'Draw a safe place',
        'Draw what peace looks like to you',
      ],
      description: 'Express and process emotions through guided drawing prompts.',
      duration: '15–20 min',
      icon: '✏️',
    },
    {
      id: 'nature_sounds',
      name: 'Nature Sound Therapy',
      type: 'nature_sounds',
      description: 'Listen to calming nature sounds like rain, forest, or ocean waves.',
      duration: '10–20 min',
      icon: '🌿',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a selfie and receive personalised music recommendations based on your mood.',
      duration: '10–20 min',
      icon: '🎵',
    },
  ],

  Severe: [
    {
      id: 'breathing_deep',
      name: 'Deep Breathing',
      type: 'breathing',
      config: { inhale: 5, hold: 2, exhale: 7, cycles: 8 },
      description: 'Extended slow breathing to immediately lower your nervous system activation.',
      duration: '10–12 min',
      icon: '🌬️',
    },
    {
      id: 'muscle_relaxation',
      name: 'Progressive Muscle Relaxation',
      type: 'muscle_relaxation',
      description: 'Systematically tense and relax muscle groups to release physical tension.',
      duration: '15–20 min',
      icon: '💪',
    },
    {
      id: 'meditation',
      name: 'Body Scan Meditation',
      type: 'meditation',
      description: 'A guided body scan to bring awareness and release tension from head to toe.',
      duration: '15–20 min',
      icon: '🧘',
    },
    {
      id: 'nature_sounds',
      name: 'Nature Sound Therapy',
      type: 'nature_sounds',
      description: 'Listen to calming nature sounds like rain, forest, or ocean waves.',
      duration: '10–20 min',
      icon: '🌿',
    },
    {
      id: 'gratitude_journal',
      name: 'Gratitude Journal',
      type: 'journal',
      description: 'Write 3 things you are grateful for today to cultivate positivity.',
      duration: '5–10 min',
      icon: '📓',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a selfie and receive personalised music recommendations based on your mood.',
      duration: '10–20 min',
      icon: '🎵',
    },
  ],
};

/**
 * Returns the list of activities for the given anxiety level.
 * Defaults to Minimal if level is unrecognised.
 */
export function getActivitiesForLevel(anxietyLevel) {
  return ALL_ACTIVITIES[anxietyLevel] || ALL_ACTIVITIES['Minimal'];
}

/**
 * Moves recently completed activities (within last 7 days) to the bottom
 * so fresh suggestions appear first.
 */
export function filterRecentActivities(activities, history) {
  const now = new Date();
  const recentNames = new Set(
    history
      .filter((r) => {
        const diff = (now - new Date(r.completed_at)) / (1000 * 60 * 60 * 24);
        return diff < 7;
      })
      .map((r) => r.activity_name),
  );

  const fresh   = activities.filter((a) => !recentNames.has(a.name));
  const recent  = activities.filter((a) =>  recentNames.has(a.name));
  return [...fresh, ...recent];
}