import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../app/board';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function BulletDetailScreen({ route }: Props) {
  const { title, date, content } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  date: { fontSize: 14, color: '#888', marginBottom: 20 },
  content: { fontSize: 16 },
});
