// آواتارهای آماده‌ی عکس پروفایل (بند ۱۲ سند کارفرما).
//
// کاربر عادی: آقا، خانم، پسربچه، دختربچه، لوگوی لوپ و یوزپلنگ.
// کاربر سازمانی/شرکتی: همین‌ها به‌علاوه‌ی چند نمای ساختمان شرکت.
// تصاویر در assets/avatars/ هستند (۵۱۲×۵۱۲)؛ برای عوض کردن هر کدام کافی است
// فایل هم‌نام جایگزین شود.

export const PERSON_AVATARS = [
  { id: 'male', label: 'Man', source: require('@assets/avatars/person-male.png') },
  { id: 'female', label: 'Woman', source: require('@assets/avatars/person-female.png') },
  { id: 'boy', label: 'Boy', source: require('@assets/avatars/person-boy.png') },
  { id: 'girl', label: 'Girl', source: require('@assets/avatars/person-girl.png') },
  { id: 'loop_logo', label: 'Loop logo', source: require('@assets/avatars/loop-logo.png') },
  { id: 'cheetah', label: 'Cheetah', source: require('@assets/avatars/loop-cheetah.png') },
];

export const COMPANY_AVATARS = [
  {
    id: 'company_tower',
    label: 'Office tower',
    source: require('@assets/avatars/company-tower.png'),
  },
  {
    id: 'company_office',
    label: 'Office building',
    source: require('@assets/avatars/company-office.png'),
  },
  { id: 'company_twin', label: 'Twin towers', source: require('@assets/avatars/company-twin.png') },
  {
    id: 'company_campus',
    label: 'Company campus',
    source: require('@assets/avatars/company-campus.png'),
  },
];

/** @param {'person'|'organization'} variant */
export const avatarsFor = (variant) =>
  variant === 'organization' ? [...COMPANY_AVATARS, ...PERSON_AVATARS] : PERSON_AVATARS;
