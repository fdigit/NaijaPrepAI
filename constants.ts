import { SubjectOption } from './types';

export const AVAILABLE_SUBJECTS: SubjectOption[] = [
  { id: 'math', name: 'Mathematics', categories: ['general'] },
  { id: 'eng', name: 'English Language', categories: ['general'] },
  { id: 'phy', name: 'Physics', categories: ['science'] },
  { id: 'chem', name: 'Chemistry', categories: ['science'] },
  { id: 'bio', name: 'Biology', categories: ['science'] },
  { id: 'agric', name: 'Agricultural Science', categories: ['science', 'general'] },
  { id: 'econ', name: 'Economics', categories: ['commercial', 'art', 'science'] },
  { id: 'govt', name: 'Government', categories: ['art', 'commercial'] },
  { id: 'lit', name: 'Literature-in-English', categories: ['art'] },
  { id: 'crk', name: 'CRS', categories: ['art'] },
  { id: 'geo', name: 'Geography', categories: ['science', 'art'] },
  { id: 'comm', name: 'Commerce', categories: ['commercial'] },
  { id: 'acct', name: 'Financial Accounting', categories: ['commercial'] },
  { id: 'civic', name: 'Civic Education', categories: ['general'] },
  { id: 'comp', name: 'Computer Studies', categories: ['science', 'general'] },
  { id: 'bst', name: 'Basic Science', categories: ['general'] }, // JSS
  { id: 'btech', name: 'Basic Technology', categories: ['general'] }, // JSS
  { id: 'sos', name: 'Social Studies', categories: ['general'] }, // JSS
  { id: 'phe', name: 'P.H.E.', categories: ['general'] },
];

export const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);

export const DEFAULT_TOPIC_PLACEHOLDERS: Record<string, string> = {
  'math': 'e.g. Quadratic Equations, Indices, Geometry',
  'phy': 'e.g. Motion, Electricity, Hooke\'s Law',
  'eng': 'e.g. Parts of Speech, Essay Writing, Oral English',
  'default': 'Enter the specific topic from your scheme of work',
};