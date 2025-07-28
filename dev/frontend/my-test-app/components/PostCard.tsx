import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  image?: string;
  title: string;
  date: string;
  unread: boolean;
};

const PostCard: React.FC<Props> = ({ image, title, date, unread }) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
      {image ? (
        <Image source={{ uri: image }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholder} />
      )}
      {unread && <View style={styles.dot} />}
    </View>
    <View style={styles.cardRight}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  </View>
);

export default PostCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#e6f7ff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  cardLeft: {
    marginRight: 10,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#bbb',
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardRight: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    color: '#555',
    fontSize: 12,
  },
});

// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。