export type SupportedLang = "en" | "kh";

export interface Translations {
  nav: {
    home: string;
    tvShows: string;
    movies: string;
    newPopular: string;
    myList: string;
    plans: string;
    searchPlaceholder: string;
    signIn: string;
    joinFree: string;
    manageProfiles: string;
    adminPanel: string;
    manageSubscription: string;
    signOut: string;
    notifications: string;
  };
  hero: {
    exclusive: string;
    film: string;
    series: string;
    play: string;
    moreInfo: string;
    trailer: string;
    match: string;
    ultraHd: string;
    audio: string;
  };
  filters: {
    all: string;
    movies: string;
    tvSeries: string;
    top10: string;
    action: string;
    scifi: string;
    drama: string;
    khmerDubbed: string;
  };
  rows: {
    trending: string;
    top10: string;
    bingeSeries: string;
    blockbusters: string;
    actionSciFi: string;
    exploreAll: string;
  };
  spotlight: {
    badge: string;
    title: string;
    desc: string;
    button: string;
  };
  footer: {
    support: string;
    faq: string;
    plans: string;
    account: string;
    mediaCenter: string;
    waysToWatch: string;
    terms: string;
    privacy: string;
    cookies: string;
    copyright: string;
  };
}

export const translations: Record<SupportedLang, Translations> = {
  en: {
    nav: {
      home: "Home",
      tvShows: "TV Shows",
      movies: "Movies",
      newPopular: "New & Popular",
      myList: "My List",
      plans: "Plans",
      searchPlaceholder: "Titles, people, genres",
      signIn: "Sign In",
      joinFree: "Join Free",
      manageProfiles: "Manage Profiles",
      adminPanel: "Admin Control Center",
      manageSubscription: "Manage Subscription",
      signOut: "Sign Out of KhmerFlix",
      notifications: "Notifications",
    },
    hero: {
      exclusive: "KHMERFLIX EXCLUSIVE",
      film: "KHMERFLIX FILM",
      series: "KHMERFLIX SERIES",
      play: "Play Now",
      moreInfo: "More Info",
      trailer: "Watch Trailer",
      match: "Match",
      ultraHd: "4K ULTRA HD",
      audio: "5.1 AUDIO",
    },
    filters: {
      all: "All",
      movies: "Movies",
      tvSeries: "TV Series",
      top10: "Top 10 in Cambodia 🇰🇭",
      action: "Action & Adventure",
      scifi: "Sci-Fi",
      drama: "Drama",
      khmerDubbed: "Khmer Dubbed / ខ្មែរ",
    },
    rows: {
      trending: "Trending Now",
      top10: "Top 10 in Cambodia Today",
      bingeSeries: "Binge-Worthy TV Series",
      blockbusters: "Blockbuster Movies",
      actionSciFi: "Action & Sci-Fi Picks",
      exploreAll: "Explore All ›",
    },
    spotlight: {
      badge: "VIP STREAMING",
      title: "Stream Without Limits with Bakong KHQR",
      desc: "Instant activation. Watch Cambodia's largest collection of local cinema and international blockbusters in 4K HDR.",
      button: "Explore Subscription Plans",
    },
    footer: {
      support: "Questions? Contact customer support (sornsophiram11@gmail.com)",
      faq: "FAQ",
      plans: "Subscription Plans",
      account: "Account",
      mediaCenter: "Media Center",
      waysToWatch: "Ways to Watch",
      terms: "Terms of Use",
      privacy: "Privacy Notice",
      cookies: "Cookie Preferences",
      copyright: "KhmerFlix Inc. All rights reserved.",
    },
  },
  kh: {
    nav: {
      home: "ទំព័រដើម",
      tvShows: "ភាពយន្តភាគ",
      movies: "ភាពយន្ត",
      newPopular: "ថ្មីៗ & ពេញនិយម",
      myList: "បញ្ជីរបស់ខ្ញុំ",
      plans: "កញ្ចប់សេវា",
      searchPlaceholder: "ស្វែងរកភាពយន្ត, តួអង្គ, ប្រភេទ...",
      signIn: "ចូលគណនី",
      joinFree: "ចុះឈ្មោះឥតគិតថ្លៃ",
      manageProfiles: "គ្រប់គ្រងកម្រងព័ត៌មាន",
      adminPanel: "ផ្ទាំងគ្រប់គ្រង Admin",
      manageSubscription: "គ្រប់គ្រងការជាវ",
      signOut: "ចាកចេញពី KhmerFlix",
      notifications: "ការជូនដំណឹង",
    },
    hero: {
      exclusive: "ភាពយន្តផ្តាច់មុខ KHMERFLIX",
      film: "ភាពយន្ត KHMERFLIX",
      series: "ភាពយន្តភាគ KHMERFLIX",
      play: "ទស្សនាឥឡូវនេះ",
      moreInfo: "ព័ត៌មានបន្ថែម",
      trailer: "ទស្សនាឈុតខ្លី",
      match: "ការផ្គូផ្គង",
      ultraHd: "កម្រិតច្បាស់ 4K",
      audio: "សំឡេង 5.1",
    },
    filters: {
      all: "ទាំងអស់",
      movies: "ភាពយន្ត",
      tvSeries: "ភាពយន្តភាគ",
      top10: "កំពូលទាំង ១០ នៅកម្ពុជា 🇰🇭",
      action: "វាយប្រហារ & ផ្សងព្រេង",
      scifi: "វិទ្យាសាស្ត្រ",
      drama: "មនោសញ្ចេតនា",
      khmerDubbed: "បញ្ចូលសំឡេងខ្មែរ / ខ្មែរ",
    },
    rows: {
      trending: "កំពុងពេញនិយមឥឡូវនេះ",
      top10: "ភាពយន្តកំពូលទាំង ១០ នៅកម្ពុជាថ្ងៃនេះ",
      bingeSeries: "ភាពយន្តភាគពិសេសៗ",
      blockbusters: "ភាពយន្តល្បីៗប្រចាំឆ្នាំ",
      actionSciFi: "ភាពយន្តសកម្មភាព & វិទ្យាសាស្ត្រ",
      exploreAll: "មើលទាំងអស់ ›",
    },
    spotlight: {
      badge: "ការជាវ VIP",
      title: "ទស្សនាគ្មានដែនកំណត់ជាមួយការទូទាត់ Bakong KHQR",
      desc: "បើកដំណើរការភ្លាមៗ។ រីករាយទស្សនាភាពយន្តខ្មែរ និងភាពយន្តអន្តរជាតិច្រើនជាងគេក្នុងកម្រិត 4K HDR។",
      button: "ស្វែងយល់កញ្ចប់សេវាជាវ",
    },
    footer: {
      support: "មានសំណួរ? ទាក់ទងផ្នែកគាំទ្រអតិថិជន (sornsophiram11@gmail.com)",
      faq: "សំណួរញឹកញាប់",
      plans: "កញ្ចប់សេវាជាវ",
      account: "គណនី",
      mediaCenter: "មជ្ឈមណ្ឌលព័ត៌មាន",
      waysToWatch: "វិធីសាស្ត្រទស្សនា",
      terms: "លក្ខខណ្ឌប្រើប្រាស់",
      privacy: "គោលការណ៍ឯកជនភាព",
      cookies: "ការកំណត់ខូគី",
      copyright: "KhmerFlix Inc. រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    },
  },
};
