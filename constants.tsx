
import React from 'react';
import { Lesson } from './types';

export const DIACRITICS = [
  { label: 'Fat-ha', char: '\u064E' },
  { label: 'Dam-ma', char: '\u064F' },
  { label: 'Kas-ra', char: '\u0650' },
  { label: 'Sukūn', char: '\u0652' },
  { label: 'Shad-da', char: '\u0651' },
  { label: 'Tanwīn Fat-h', char: '\u064B' },
  { label: 'Tanwīn Dam-m', char: '\u064C' },
  { label: 'Tanwīn Kasr', char: '\u064D' },
];

export const PRESET_LESSONS: Lesson[] = [
  {
    category: 'Alphabet',
    title: 'الحروف الهجائية',
    content: 'أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'
  },
  {
    category: 'Phrases',
    title: 'التحية والترحيب',
    content: 'السَّلامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ. كَيْفَ حَالُكَ اليوم؟'
  },
  {
    category: 'Phrases',
    title: 'في المدرسة',
    content: 'أَيْنَ الكِتَابُ؟ الكِتَابُ عَلَى المَكْتَبِ. هَلْ فَهِمْتَ الدَّرْسَ؟'
  },
  {
    category: 'Grammar',
    title: 'جملة فعلية بسيطة',
    content: 'ذَهَبَ الطَّالِبُ إِلَى المَدْرَسَةِ لِيَتَعَلَّمَ العُلُومَ النَّافِعَةَ.'
  }
];
