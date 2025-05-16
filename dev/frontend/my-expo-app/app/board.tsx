import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BoardScreen() {
  return (
    <View style={styles.container}>
      <Text>掲示板画面</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
