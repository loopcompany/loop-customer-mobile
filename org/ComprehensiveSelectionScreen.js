import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, I18nManager } from 'react-native';
import Footer from '../screens/Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4 } from '../theme/Color';
import ScreenTitle from '../components/ScreenTitle';
import CustomStatusBar from '../components/CustomStatusBar';

const ComprehensiveSelectionScreen = ({ navigation }) => {
  const [counts, setCounts] = useState({
    software: 2,
    hardware: 2,
    network: 2,
    monitor: 2,
    printer: 2,
    industrial: 2
  });

  const updateCount = (type, increment) => {
    setCounts(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + increment)
    }));
  };

  return (
    <View style={[NewStyles.container, { flex: 1, backgroundColor: '#d1e9ff' }]}>
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 10 }}>

        {/* انتخاب جامع Header */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            backgroundColor: '#1976d2',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 3,
            shadowColor: '#1976d2',
            shadowOpacity: 0.3,
            shadowRadius: 4,
            position: 'relative'
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'VazirBold',
              textAlign: 'center'
            }}>انتخاب جامع</Text>
            {/* Yellow arrow down */}
            <View style={{
              position: 'absolute',
              bottom: 5,
              alignSelf: 'center',
              width: 0,
              height: 0,
              borderLeftWidth: 10,
              borderRightWidth: 10,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#ffeb3b'
            }} />
          </View>
        </View>

        {/* لپ تاپ Section */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          <View style={{
            backgroundColor: themeColor4.bgColor(1),
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: themeColor10.bgColor(1),
            elevation: 2,
            position: 'relative'
          }}>
            <Text style={{
              color: themeColor10,
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'VazirBold',
              textAlign: 'center'
            }}>لپ تاپ</Text>
            {/* Yellow arrow down */}
          </View>
        </View>

        {/* نرم افزاری */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>

        {/* سخت افزاری */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* شبکه / اتصال چند محصول */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* هارد دیسک Section */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          <View style={{
            backgroundColor: themeColor4.bgColor(1),
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: themeColor10.bgColor(1),
            elevation: 2,
            position: 'relative'
          }}>
            <Text style={{
              color: themeColor10,
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'VazirBold',
              textAlign: 'center'
            }}>لپ تاپ</Text>
            {/* Yellow arrow down */}
          </View>
        </View>
        {/* اکسترنال */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* اینترنال */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* دوربین مدار بسته Section */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          <View style={{
            backgroundColor: themeColor4.bgColor(1),
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: themeColor10.bgColor(1),
            elevation: 2,
            position: 'relative'
          }}>
            <Text style={{
              color: themeColor10,
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'VazirBold',
              textAlign: 'center'
            }}>لپ تاپ</Text>
            {/* Yellow arrow down */}
          </View>
        </View>


        {/* دستگاه / DVR */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* دوربین */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* مانیتور Section */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          <View style={{
            backgroundColor: themeColor4.bgColor(1),
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: themeColor10.bgColor(1),
            elevation: 2,
            position: 'relative'
          }}>
            <Text style={{
              color: themeColor10,
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'VazirBold',
              textAlign: 'center'
            }}>لپ تاپ</Text>
            {/* Yellow arrow down */}
          </View>
        </View>


        {/* سخت افزاری - مانیتور */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* چاپگر Section */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
          <View style={{
            backgroundColor: themeColor4.bgColor(1),
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: themeColor10.bgColor(1),
            elevation: 2,
            position: 'relative'
          }}>
            <Text style={{
              color: themeColor10,
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'VazirBold',
              textAlign: 'center'
            }}>لپ تاپ</Text>
            {/* Yellow arrow down */}
          </View>
        </View>

        {/* پرینتر لیزری */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>


        {/* کپی صنعتی */}
        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            padding: 8,
            alignItems: 'center',
          }}>
            {/* Count Controls */}

            <Text style={{
              fontSize: 16,
              color: themeColor10.bgColor(0.5),
              fontFamily: 'VazirBold',
              backgroundColor: themeColor4.bgColor(1),
              borderRadius: 4,
              borderColor: themeColor10.bgColor(1),
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginLeft: 8,
              minWidth: 24,
              textAlign: 'center'
            }}>{counts.software}</Text>
            <View style={{
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: themeColor10.bgColor(1),
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>تعداد محصول</Text>
            </View>
            <View style={{ flex: 1 }} />

            {/* Category Label */}
            <TouchableOpacity style={{
              backgroundColor: '#ffeb3b',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}>
              <Text style={{
                fontSize: 14,
                color: '#333',
                fontFamily: 'VazirBold',
                textAlign: 'center'
              }}>نرم افزاری</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#e0e0e0'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'VazirLight',
              textAlign: 'right',
              lineHeight: 18
            }}>مثال: نصب ویندوز و برنامه های کاربردی و عمومی و درایورها</Text>
          </View>
        </View>

      </ScrollView>

    </View>
  );
};

export default ComprehensiveSelectionScreen;