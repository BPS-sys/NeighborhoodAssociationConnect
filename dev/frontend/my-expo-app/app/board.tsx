import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from "react";
import { StyleSheet } from "react-native";
import BulletDetailScreen from '../screens/BulletDetailScreen';
import BulletHomeScreen from '../screens/BulletHomeScreen';

export type RootStackParamList = {
  Home: undefined;
  Detail: { title: string; date: string; content: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function BoardScreen() {
  return (
    <>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={BulletHomeScreen} />
        <Stack.Screen name="Detail" component={BulletDetailScreen} />
      </Stack.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
