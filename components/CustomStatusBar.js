
import React from 'react';
import { StatusBar } from 'react-native';
import { useNavigationState } from '@react-navigation/native';

import { themeColor0, themeColor5 } from '../theme/Color';

export default function CustomStatusBar() {

    const navigationState = useNavigationState(state => state);
    const currentRouteName = navigationState.routes[navigationState.index].name;

    const statusBarStyle = (currentRouteName === 'SignInLanding' || currentRouteName === 'Account') ? 'light-content' : 'light-content';
    const statusBarBackgroundColor = (currentRouteName === 'SignInLanding' || currentRouteName === 'Account' || currentRouteName === 'Collection') ? themeColor0.bgColor(1) : themeColor0.bgColor(1);

    return (
        <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBackgroundColor} animated={true} StatusBarAnimation='fade' />
    )
}
