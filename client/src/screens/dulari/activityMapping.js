/**
 * Activity Mapping Configuration
 * Maps anxiety levels to recommended activities with metadata.
 */

const ACTIVITY_MAPPING = {
  Minimal: [
    {
      id: 'free_drawing',
      name: 'Free Drawing',
      type: 'drawing',
      description: 'Express yourself freely on a blank canvas using your finger.',
      duration: '10 min',
      icon: '🎨',
    },
    {
      id: 'gratitude_journal',
      name: 'Gratitude Journal',
      type: 'journal',
      description: 'Write down 3 things you are grateful for today.',
      duration: '5 min',
      icon: '📝',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a photo and get personalized song recommendations based on your mood.',
      duration: 'Varies',
      icon: '🎶',
    },
  ],
  Mild: [
    {
      id: 'breathing_4_6',
      name: '4-6 Breathing',
      type: 'breathing',
      description: 'A calming breathing exercise: inhale for 4s, hold 2s, exhale for 6s.',
      duration: '5 min',
      icon: '🌬️',
      config: { inhale: 4, hold: 2, exhale: 6, cycles: 5 },
    },
    {
      id: 'colouring_templates',
      name: 'Colouring Templates',
      type: 'colouring',
      description: 'Tap sections of calming templates to fill them with colour.',
      duration: '10 min',
      icon: '🖌️',
    },
    {
      id: 'progressive_muscle',
      name: 'Progressive Muscle Relaxation',
      type: 'muscle_relaxation',
      description: 'Step-by-step guide to tense, hold, and relax each muscle group.',
      duration: '10 min',
      icon: '💪',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a photo and get personalized song recommendations based on your mood.',
      duration: 'Varies',
      icon: '🎶',
    },
  ],
  Moderate: [
    {
      id: 'extended_breathing',
      name: 'Extended Breathing',
      type: 'breathing',
      description: 'Deep breathing exercise: inhale 5s, hold 5s, exhale 5s.',
      duration: '8 min',
      icon: '🌬️',
      config: { inhale: 5, hold: 5, exhale: 5, cycles: 6 },
    },
    {
      id: 'structured_drawing',
      name: 'Structured Drawing',
      type: 'prompt_drawing',
      description: 'Follow guided prompts to draw structured patterns.',
      duration: '10 min',
      icon: '✏️',
      prompts: [
        'Draw how you feel today',
        'Draw a place that makes you calm',
        'Draw something that makes you smile',
      ],
    },
    {
      id: 'prompts_drawing',
      name: 'Prompts Drawing',
      type: 'prompt_drawing',
      description: 'Creative drawing guided by mindfulness prompts.',
      duration: '10 min',
      icon: '🖼️',
      prompts: [
        'Draw your safe space',
        'Draw what peace looks like to you',
        'Draw a happy memory',
      ],
    },
    {
      id: 'body_scan',
      name: 'Body Scan Meditation',
      type: 'meditation',
      description: 'A guided meditation to scan and relax each part of your body.',
      duration: '10 min',
      icon: '🧘',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a photo and get personalized song recommendations based on your mood.',
      duration: 'Varies',
      icon: '🎶',
    },
  ],
  Severe: [
    {
      id: 'emergency_breathing',
      name: 'Emergency Breathing',
      type: 'breathing',
      description: 'Quick calming breaths to reduce acute anxiety: inhale 3s, exhale 3s.',
      duration: '3 min',
      icon: '🆘',
      config: { inhale: 3, hold: 1, exhale: 3, cycles: 8 },
    },
    {
      id: 'simple_colouring',
      name: 'Simple Colouring',
      type: 'colouring',
      description: 'Simple shapes to colour for immediate calm.',
      duration: '5 min',
      icon: '🎨',
    },
    {
      id: 'nature_sounds',
      name: 'Nature Sound Therapy',
      type: 'nature_sounds',
      description: 'Listen to calming nature sounds: rain, forest, or ocean.',
      duration: '10 min',
      icon: '🌿',
    },
    {
      id: 'music_therapy',
      name: 'Music Therapy',
      type: 'music_therapy',
      description: 'Take a photo and get personalized song recommendations based on your mood.',
      duration: 'Varies',
      icon: '🎶',
    },
  ],
};

/**
 * Returns recommended activities for a given anxiety level.
 * @param {string} anxietyLevel - One of: Minimal, Mild, Moderate, Severe
 * @returns {Array} activities
 */
export function getActivitiesForLevel(anxietyLevel) {
  if (!ACTIVITY_MAPPING[anxietyLevel]) {
    console.warn(`Unknown anxiety level "${anxietyLevel}", falling back to Minimal`);
  }
  return ACTIVITY_MAPPING[anxietyLevel] || ACTIVITY_MAPPING['Minimal'];
}

/**
 * Reorders activities so recently completed ones appear at the bottom.
 * @param {Array} activities - list of activity objects
 * @param {Array} history - list of completed activity records
 * @returns {Array} reordered activities
 */
export function filterRecentActivities(activities, history) {
  const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
  const recentNames = new Set(
    (history || [])
      .filter((h) => new Date(h.completed_at).getTime() > twelveHoursAgo)
      .map((h) => h.activity_name),
  );

  const fresh = activities.filter((a) => !recentNames.has(a.name));
  const recent = activities.filter((a) => recentNames.has(a.name));
  return [...fresh, ...recent];
}

export default ACTIVITY_MAPPING;
