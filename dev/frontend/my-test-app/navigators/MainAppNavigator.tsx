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
