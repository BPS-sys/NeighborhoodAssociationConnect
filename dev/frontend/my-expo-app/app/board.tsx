// app/(tabs)/board.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BulletDetailScreen from "../screens/BulletDetailScreen";
import BulletHomeScreen from "../screens/BulletHomeScreen";

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
