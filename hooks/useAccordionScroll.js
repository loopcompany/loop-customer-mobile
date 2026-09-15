// اسکرول خودکار به ابتدای بخشی که تازه باز شده است.
//
// در فرم‌های آکاردئونی سازمانی («انتخاب جامع» و «انتخاب سیستماتیک») بعضی بخش‌ها
// بلندند؛ وقتی کاربر بخش بلند را می‌بندد و بخش بعدی را باز می‌کند، سربرگ بخشِ باز
// جایی بیرون از کادر دید می‌افتد و کاربر باید دستی اسکرول کند. این هوک بعد از باز
// شدن هر بخش، ScrollView را روی سربرگ همان بخش می‌برد.
//
// چرا measureLayout و نه onLayout؟ روی وب، onLayout با ResizeObserver پیاده شده و
// فقط با تغییر «اندازه» صدا زده می‌شود، نه با جابه‌جا شدن عنصر. پس وقتی بخشِ بالایی
// بسته می‌شود و بقیه بالا می‌آیند، مختصات ذخیره‌شده کهنه می‌ماند و اسکرول از هدف رد
// می‌شود. measureLayout در لحظه‌ی اسکرول اندازه می‌گیرد و روی هر دو پلتفرم درست است.
//
// طرز استفاده:
//   const { scrollRef, registerSection, requestScrollTo } = useAccordionScroll();
//   <ScrollView ref={scrollRef}>
//     <AccordionHeader innerRef={registerSection(id)} onPress={() => toggle(id)} ... />
//
// و در toggle، هنگام «باز کردن» (نه بستن) requestScrollTo(id) صدا زده می‌شود.
import { useCallback, useEffect, useRef } from 'react';

// چند پیکسل بالای سربرگ خالی بماند تا چسبیده به لبه‌ی بالایی ننشیند.
const DEFAULT_OFFSET = 8;

// دو پاس: اولی بلافاصله بعد از رندرِ باز شدن، دومی برای وقتی چیدمان کمی دیرتر
// ته‌نشین می‌شود (تصویر/فونتی که هنوز نیامده بود).
const MEASURE_DELAYS = [60, 260];

export default function useAccordionScroll({ offset = DEFAULT_OFFSET } = {}) {
  const scrollRef = useRef(null);
  const nodes = useRef({});
  const refCallbacks = useRef({});
  const timers = useRef([]);

  // ref پایدار برای هر بخش تا با هر رندر، ref قبلی با null صدا زده نشود.
  const registerSection = useCallback((id) => {
    if (!refCallbacks.current[id]) {
      refCallbacks.current[id] = (node) => {
        nodes.current[id] = node;
      };
    }
    return refCallbacks.current[id];
  }, []);

  const scrollToId = useCallback(
    (id) => {
      const node = nodes.current[id];
      const scroller = scrollRef.current;
      if (!node || !scroller) return;

      // مختصات سربرگ نسبت به محتوای ScrollView (نه نسبت به صفحه).
      const inner = scroller.getInnerViewNode?.();
      if (!inner || typeof node.measureLayout !== 'function') return;

      node.measureLayout(
        inner,
        (x, y) => scroller.scrollTo({ y: Math.max(0, y - offset), animated: true }),
        () => {}
      );
    },
    [offset]
  );

  const requestScrollTo = useCallback(
    (id) => {
      if (!id) return;
      timers.current.forEach(clearTimeout);
      timers.current = MEASURE_DELAYS.map((delay) =>
        setTimeout(() => scrollToId(id), delay)
      );
    },
    [scrollToId]
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return { scrollRef, registerSection, requestScrollTo };
}
