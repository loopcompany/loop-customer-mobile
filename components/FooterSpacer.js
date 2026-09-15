// فاصله‌ی ته محتوای اسکرول‌شونده، تا آخرین عنصر زیر داکِ شناور پایین پنهان نشود.
//
// داک پایین (contexts/MenuContext.js) روی محتوا شناور است، نه در جریان چیدمان،
// پس هر صفحه‌ای که اسکرول دارد باید خودش به اندازه‌ی ارتفاع داک ته محتوایش جا
// باز کند. ارتفاع واقعی داک با onLayout اندازه‌گیری می‌شود و `footerSpace`
// همان عدد به‌علاوه‌ی safe-area است؛ وقتی داک نمایش داده نمی‌شود صفر است، پس
// این کامپوننت روی صفحات بدون داک هیچ فضایی نمی‌گیرد.
//
// استفاده:
//   <ScrollView>…<FooterSpacer /></ScrollView>
//   <FlatList ListFooterComponent={<FooterSpacer />} … />
//
// روی صفحاتی که خودشان `footerSpace` را در paddingBottom می‌گذارند لازم نیست.

import React from 'react';
import { View } from 'react-native';
import { useMenu } from '@contexts/MenuContext';

function FooterSpacer() {
  const { footerSpace } = useMenu();
  if (!footerSpace) return null;
  return <View style={{ height: footerSpace }} pointerEvents="none" />;
}

export default React.memo(FooterSpacer);
