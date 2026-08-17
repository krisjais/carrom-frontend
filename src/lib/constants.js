export const CATEGORIES = [
  { id: 'boys_singles', name: 'Boys Singles', shortName: 'BS', icon: 'User', desc: 'Individual championship for male participants.' },
  { id: 'girls_singles', name: 'Girls Singles', shortName: 'GS', icon: 'UserCheck', desc: 'Individual championship for female participants.' },
  { id: 'boys_doubles', name: 'Boys Doubles', shortName: 'BD', icon: 'Users', desc: 'Team championship for 2 male participants.' },
  { id: 'girls_doubles', name: 'Girls Doubles', shortName: 'GD', icon: 'Users2', desc: 'Team championship for 2 female participants.' },
  { id: 'mixed_doubles', name: 'Mixed Doubles', shortName: 'MD', icon: 'Sparkles', desc: 'Pair championship with 1 male and 1 female participant.' },
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {});

export const getCategoryName = (id) => {
  return CATEGORY_MAP[id]?.name || id?.replace('_', ' ').toUpperCase() || 'Category';
};

export const TOURNAMENT_RULES_SUMMARY = [
  {
    title: 'Match Format',
    content: 'All matches are Best of 3 Boards. The first player or team to win 2 boards wins the match (2–0 or 2–1). Board 3 is played only if the match is tied 1–1 after two boards.',
    icon: 'Trophy'
  },
  {
    title: 'Coin Point Values',
    content: 'Each white or black carrom coin pocketed awards 1 point to the player/team.',
    icon: 'Disc'
  },
  {
    title: 'Queen & Cover',
    content: 'The Queen is worth 3 points, scored only when successfully covered with another coin in the immediate turn.',
    icon: 'Crown'
  },
  {
    title: 'Fouls & Penalties',
    content: 'Pocketing the striker or committing a foul results in a -1 point penalty and ends the current turn.',
    icon: 'AlertTriangle'
  },
  {
    title: 'Board Score Limit',
    content: 'The maximum achievable score for any single board is 25 points.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Board Confirmation',
    content: 'Because physical matches occur on physical carrom boards, the tournament Admin enters points and manually confirms the winner of each board.',
    icon: 'CheckCircle2'
  }
];
