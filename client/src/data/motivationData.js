/**
 * Motivation & Recovery content by mental health level
 * Low = Good, Moderate = Moderate, Severe = Severe
 */

export const MOTIVATION_DATA = {
  Low: {
    displayName: 'Good',
    certificateTitle: 'Mental Wellness Progress Certificate',
    motivationalMessage: "Congratulations! You're taking excellent care of your mental well-being. Keep nurturing these positive habits—you're doing great!",
    physical: [
      'Continue regular gym workouts or fitness routines',
      'Maintain yoga or stretching for flexibility',
      'Daily walking for at least 30 minutes',
      'Try new physical activities to stay motivated',
      'Balance cardio and strength training',
    ],
    mental: [
      'Keep up your meditation or mindfulness practice',
      'Journal positive moments and gratitude',
      'Explore advanced relaxation techniques',
      'Set personal growth goals',
      'Practice deep breathing for stress management',
    ],
    nutritional: [
      'Maintain a balanced, varied diet',
      'Stay hydrated—aim for 8 glasses of water daily',
      'Include plenty of fruits and vegetables',
      'Eat regular, well-balanced meals',
      'Limit processed foods and sugars',
    ],
  },
  Moderate: {
    displayName: 'Moderate',
    certificateTitle: 'Self-Care Achievement Certificate',
    motivationalMessage: "You're making strides in your wellness journey. Every small step counts. We're here to support you as you build healthier habits.",
    physical: [
      'Light yoga or stretching sessions (10–15 min daily)',
      'Gentle walking—start with 15 minutes, gradually increase',
      'Breathing exercises in the morning and evening',
      'Simple stretching to release tension',
      'Short outdoor walks for fresh air and sunshine',
    ],
    mental: [
      'Begin a simple 5-minute daily meditation',
      'Gratitude journaling—write 3 things you appreciate',
      'Mindfulness during everyday activities',
      'Guided relaxation or calming music',
      'Practice self-compassion and positive self-talk',
    ],
    nutritional: [
      'Eat regular meals to stabilize energy',
      'Drink plenty of water throughout the day',
      'Include whole grains and lean proteins',
      'Add more fruits and vegetables to your plate',
      'Avoid skipping meals',
    ],
  },
  Severe: {
    displayName: 'Severe',
    certificateTitle: 'Self-Care Achievement Certificate',
    motivationalMessage: "Taking this assessment shows courage. You're not alone. Be gentle with yourself. Small, kind steps can make a real difference. Consider reaching out to a mental health professional for additional support—it's a sign of strength.",
    physical: [
      'Gentle breathing exercises (4-7-8 or box breathing)',
      'Very light stretching—no pressure to push yourself',
      'Short walks when you feel able (even 5 minutes helps)',
      'Rest when needed—rest is productive',
      'Simple movement like standing and stretching',
    ],
    mental: [
      'Breathing and grounding techniques when overwhelmed',
      'Short moments of mindfulness (1–2 minutes)',
      'Gentle self-talk—speak to yourself as you would a friend',
      'Consider professional support—therapy can help',
      'Reduce stressors where possible—it\'s okay to step back',
    ],
    nutritional: [
      'Stay hydrated—keep water nearby',
      'Eat small, regular meals even when appetite is low',
      'Simple, nourishing foods—soups, fruits, whole grains',
      'Avoid caffeine late in the day for better sleep',
      'Be kind to yourself—nutrition can wait if you\'re struggling',
    ],
    professionalNote: 'If you\'re experiencing significant distress, consider speaking with a mental health professional or counselor. Seeking help is a brave and positive step.',
  },
};
