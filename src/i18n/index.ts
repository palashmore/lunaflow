export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface Translations {
  appName: string;
  tagline: string;
  tabs: {
    today: string;
    calendar: string;
    diary: string;
    sanitary: string;
    insights: string;
    doctor: string;
    wellness: string;
  };
  cycle: {
    cycleDay: string;
    daysUntilPeriod: string;
    dayOfPeriod: string;
    late: string;
    nextPeriod: string;
    logToday: string;
    lastStart: string;
    changeDate: string;
    fertileEstimate: string;
  };
  sanitary: {
    title: string;
    stockReminder: string;
    justChanged: string;
    lowStock: string;
    safeHygiene: string;
  };
  comfort: {
    sosTitle: string;
    breathe: string;
    inhale: string;
    hold: string;
    exhale: string;
    crampTips: string;
  };
  doctor: {
    title: string;
    summary: string;
    print: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'LunaFlow',
    tagline: 'Empathetic Cycle Intelligence & Sanctuary',
    tabs: {
      today: 'Today',
      calendar: 'Calendar',
      diary: 'Journal',
      sanitary: 'Hygiene',
      insights: 'Insights',
      doctor: 'Doctor',
      wellness: 'Learn',
    },
    cycle: {
      cycleDay: 'Cycle Day',
      daysUntilPeriod: 'days until period',
      dayOfPeriod: 'of period',
      late: 'Late',
      nextPeriod: 'Next estimated:',
      logToday: '+ Log Today',
      lastStart: 'Last period start:',
      changeDate: 'Update dates',
      fertileEstimate: 'Fertile Window Estimate',
    },
    sanitary: {
      title: 'Sanitary & Hygiene Stock',
      stockReminder: 'Stock Up Reminder!',
      justChanged: 'Just Changed',
      lowStock: 'Low Stock',
      safeHygiene: 'Safe Hygiene & TSS Guidelines',
    },
    comfort: {
      sosTitle: 'SOS Cramp Sanctuary',
      breathe: 'Rhythmic 4-7-8 Uterine Relaxation',
      inhale: 'Inhale slowly through nose',
      hold: 'Softly relax abdomen',
      exhale: 'Slowly release all tension',
      crampTips: 'Natural Comfort & Heat Measures',
    },
    doctor: {
      title: 'Doctor Health Report',
      summary: 'Confidential Clinical Cycle Summary',
      print: 'Print / Save PDF',
    },
  },
  hi: {
    appName: 'लूनाफ्लो',
    tagline: 'मासिक धर्म चक्र और व्यक्तिगत स्वास्थ्य साथी',
    tabs: {
      today: 'आज',
      calendar: 'कैलेंडर',
      diary: 'डायरी',
      sanitary: 'स्वच्छता',
      insights: 'विश्लेषण',
      doctor: 'डॉक्टर',
      wellness: 'सीखें',
    },
    cycle: {
      cycleDay: 'चक्र का दिन',
      daysUntilPeriod: 'दिन अगले मासिक धर्म में',
      dayOfPeriod: 'मासिक धर्म का दिन',
      late: 'विलंबित',
      nextPeriod: 'अनुमानित अगली तिथि:',
      logToday: '+ आज दर्ज करें',
      lastStart: 'पिछला आरंभ:',
      changeDate: 'तिथि बदलें',
      fertileEstimate: 'अनुमानित प्रजनन काल',
    },
    sanitary: {
      title: 'स्वच्छता सामग्री स्टॉक',
      stockReminder: 'सामग्री समाप्त होने की चेतावनी!',
      justChanged: 'अभी बदला',
      lowStock: 'कम स्टॉक',
      safeHygiene: 'सुरक्षित स्वच्छता और दिशानिर्देश',
    },
    comfort: {
      sosTitle: 'दर्द राहत अभयारण्य (SOS)',
      breathe: 'लयबद्ध 4-7-8 श्वसन विश्राम',
      inhale: 'नाक से धीरे-धीरे सांस लें',
      hold: 'पेट को शिथिल रखें',
      exhale: 'धीरे-धीरे तनाव मुक्त करें',
      crampTips: 'प्राकृतिक राहत और गर्म सेंक',
    },
    doctor: {
      title: 'डॉक्टर स्वास्थ्य रिपोर्ट',
      summary: 'गोपनीय मासिक धर्म स्वास्थ्य सारांश',
      print: 'प्रिंट / पीडीएफ',
    },
  },
  mr: {
    appName: 'लुनाफ्लो',
    tagline: 'मासिक पाळी आणि आरोग्य मार्गदर्शक',
    tabs: {
      today: 'आज',
      calendar: 'दिनदर्शिका',
      diary: 'नोंदी',
      sanitary: 'स्वच्छता',
      insights: 'आकडेवारी',
      doctor: 'डॉक्टर',
      wellness: 'माहिती',
    },
    cycle: {
      cycleDay: 'चक्राचा दिवस',
      daysUntilPeriod: 'दिवस पुढील पाळीसाठी',
      dayOfPeriod: 'पाळीचा दिवस',
      late: 'उशीर',
      nextPeriod: 'अंदाजित पुढील पाळी:',
      logToday: '+ आज नोंद करा',
      lastStart: 'मागील सुरुवात:',
      changeDate: 'तारीख बदला',
      fertileEstimate: 'अंदाजित प्रजनन कालावधी',
    },
    sanitary: {
      title: 'सॅनिटरी साहित्य साठा',
      stockReminder: 'साठा संपत आल्याची सूचना!',
      justChanged: 'आत्ताच बदलले',
      lowStock: 'कमी साठा',
      safeHygiene: 'सुरक्षित स्वच्छता आणि खबरदारी',
    },
    comfort: {
      sosTitle: 'वेदना निवारण केंद्र (SOS)',
      breathe: 'संतुलित ४-७-८ श्वसन व्यायाम',
      inhale: 'नाकाने हळूच श्वास घ्या',
      hold: 'पोट रिलॅक्स ठेवा',
      exhale: 'हळूहळू श्वास सोडा',
      crampTips: 'नैसर्गिक आराम आणि गरम शेक',
    },
    doctor: {
      title: 'वैद्यकीय आरोग्य अहवाल',
      summary: 'मासिक पाळीचा गोपनीय आरोग्य सारांश',
      print: 'प्रिंट / पीडीएफ',
    },
  },
};

export function getTranslations(lang: SupportedLanguage = 'en'): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
