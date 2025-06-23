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
      <Stack.Screen name="Home" component={BulletHomeScreen} />
      <Stack.Screen name="Detail" component={BulletDetailScreen} />
    </Stack.Navigator>
  );
}
