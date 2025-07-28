import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BulletHomeScreen from '../../screens/BulletHomeScreen';
import BulletDetailScreen from '../../screens/BulletDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Detail: { title: string; date: string; content: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function BoardScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={BulletHomeScreen}
        options={{ headerShown: false }}  // ヘッダー非表示
      />
      <Stack.Screen
        name="Detail"
        component={BulletDetailScreen}
        options={{ headerShown: false }}  // 必要ならDetailも非表示に
      />
    </Stack.Navigator>
  );
}


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。