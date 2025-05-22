import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../app/board';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const posts = [
  {
    id: '1',
    category: '防犯',
    title: '〇〇小学校で不審者',
    date: '2024/12/16',
    content: '子どもに声をかける不審者が目撃されました。',
  },
  {
    id: '2',
    category: '防犯',
    title: '空き巣被害多発',
    date: '2024/12/13',
    content: '最近この地域で空き巣の被害が増えています。',
  },
  {
    id: '3',
    category: 'イベント',
    title: '町内清掃のお知らせ',
    date: '2024/12/20',
    content: '12月25日に町内清掃を行います。',
  },
  {
    id: '4',
    category: '防災',
    title: '避難訓練のご案内',
    date: '2024/12/25',
    content: '来月1日に避難訓練を実施予定です。',
  },
];

export default function BulletHomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState("防犯");

  const filteredPosts = posts.filter(p => p.category === activeTab);

  return (
    <View style={styles.container}>
      {/* カテゴリ切り替えタブ */}
      <View style={styles.tabContainer}>
        {["防犯", "イベント", "防災"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 投稿一覧 */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Detail', {
                title: item.title,
                date: item.date,
                content: item.content,
              })
            }
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#00BCD4',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
