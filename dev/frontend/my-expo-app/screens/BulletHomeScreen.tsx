import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../app/board';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const posts = [
  { id: '1', title: '〇〇小学校で不審者', date: '2024/12/16', content: '子どもに声をかける不審者が目撃されました。' },
  { id: '2', title: '空き巣被害多発', date: '2024/12/13', content: '最近この地域で空き巣の被害が増えています。' },
];

export default function BulletHomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Detail', {
              title: item.title,
              date: item.date,
              content: item.content,
            })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#666' },
});
