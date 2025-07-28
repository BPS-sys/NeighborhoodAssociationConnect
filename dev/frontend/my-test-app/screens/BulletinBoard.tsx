import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PostCard from '../components/PostCard';
import TabBar from '../components/TabBar';

const BulletinBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('防犯');
  const tabs = ['防犯', 'イベント', '防災'];

  const posts = [
    { id: 1, title: '○○小学校で不審者', date: '2024/12/16', image: 'https://via.placeholder.com/50', unread: true },
    { id: 2, title: '空き巣被害多発', date: '2024/12/13', image: 'https://via.placeholder.com/50', unread: true },
    { id: 3, title: '〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇', date: '2024/12/12', unread: true },
    { id: 4, title: '〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇', date: '2024/12/11', unread: false },
  ];

  return (
    <View style={styles.container}>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        badgeTab="防犯"
        badgeCount={3}
      />
      <ScrollView style={styles.list}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            title={post.title}
            date={post.date}
            image={post.image}
            unread={post.unread}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default BulletinBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  list: {
    paddingHorizontal: 10,
  },
});


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。