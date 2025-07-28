// frontend/my-expo-app/navigators/MainAppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from '../app/tabs/chat';
import BoardScreen from '../app/tabs/board';
import ScheduleScreen from '../app/tabs/schedule';
import HomeScreen from '../app/tabs/index';

const Tab = createBottomTabNavigator();

export default function MainAppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="ホーム" component={HomeScreen} />
      <Tab.Screen name="掲示板" component={BoardScreen} />
      <Tab.Screen name="チャット" component={ChatScreen} />
      <Tab.Screen name="スケジュール" component={ScheduleScreen} />
    </Tab.Navigator>
  );
}


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。