# OrderDropdown Component

کامپوننت Dropdown برای انتخاب سفارش با قابلیت جستجو و نمایش اطلاعات کامل.

## ویژگی‌ها

- ✅ دریافت خودکار لیست سفارشات از API
- ✅ نمایش اطلاعات کامل هر سفارش (شماره، تاریخ، محصول، تکنسین، مبلغ)
- ✅ قابلیت جستجو در لیست سفارشات
- ✅ نمایش تاریخ شمسی
- ✅ نمایش وضعیت تکمیل شده
- ✅ استایل زیبا و کاربردی
- ✅ حالت لودینگ و خالی بودن لیست

## نحوه استفاده

```jsx
import OrderDropdown from '../components/OrderDropdown';

function MyScreen() {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleOrderSelect = (item) => {
    setSelectedOrderId(item.value);
    setSelectedOrder(item);
    
    // دسترسی به تمام اطلاعات سفارش
    console.log('Order ID:', item.order_id);
    console.log('Product:', item.product_name);
    console.log('Technician:', item.technician_referral_code);
    console.log('Amount:', item.final_paid_amount);
  };

  return (
    <View>
      <OrderDropdown 
        value={selectedOrderId}
        onChange={handleOrderSelect}
        placeholder="انتخاب سفارش"
      />
      
      {selectedOrder && (
        <Text>شماره سفارش انتخاب شده: {selectedOrder.order_id}</Text>
      )}
    </View>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string/number | - | مقدار انتخاب شده (order_id) |
| `onChange` | function | - | تابع callback برای تغییر انتخاب |
| `placeholder` | string | "انتخاب شماره سفارش" | متن پیش‌فرض |

## ساختار داده برگشتی در onChange

```javascript
{
  label: "#27 - 1404/08/10 - لپ تاپ",
  value: "27",
  order_id: 27,
  created_at: "2025-10-31 17:03:53",
  finished_at: null,
  technician_referral_code: "3B115833",
  final_paid_amount: 2800000,
  product_name: "لپ تاپ"
}
```

## مثال استفاده در فرم

```jsx
import { View, Text, TextInput } from 'react-native';
import OrderDropdown from '../components/OrderDropdown';

function FeedbackForm() {
  const [orderId, setOrderId] = useState(null);
  const [feedback, setFeedback] = useState('');

  return (
    <View style={{ padding: 20 }}>
      {/* Dropdown سفارش */}
      <OrderDropdown 
        value={orderId}
        onChange={(item) => setOrderId(item.value)}
      />
      
      {/* سایر فیلدها */}
      <TextInput
        placeholder="نظر شما"
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />
    </View>
  );
}
```

## API

این کامپوننت از API زیر استفاده می‌کند:

- **Endpoint**: `GET /orders/summary`
- **Service**: `orderAPI.getOrdersSummary()`

## Styling

از `NewStyles` و رنگ‌های theme استفاده می‌کند:
- `themeColor0`: رنگ متن اصلی
- `themeColor1`: رنگ اصلی برند (فوکوس، هایلایت)
- `themeColor5`: رنگ‌های ثانویه

## نکات

1. **خودکار**: لیست سفارشات به صورت خودکار هنگام mount شدن کامپوننت بارگذاری می‌شود
2. **جستجو**: کاربر می‌تواند با تایپ کردن در فیلد جستجو، سفارش مورد نظر را پیدا کند
3. **نمایش کامل**: هر آیتم در لیست اطلاعات کامل سفارش را نمایش می‌دهد
4. **وضعیت**: سفارش‌های تکمیل شده با badge سبز مشخص می‌شوند
5. **خطا**: در صورت خطا در API، پیام مناسب نمایش داده می‌شود
