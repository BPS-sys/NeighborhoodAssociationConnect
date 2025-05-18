import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  badgeTab?: string;
  badgeCount?: number;
};

const TabBar: React.FC<Props> = ({ tabs, activeTab, onTabPress, badgeTab, badgeCount }) => (
  <View style={styles.container}>
    {tabs.map((tab) => (
      <TouchableOpacity
        key={tab}
        onPress={() => onTabPress(tab)}
        style={[styles.tab, tab === activeTab && styles.activeTab]}
      >
        <Text style={styles.tabText}>{tab}</Text>
        {tab === badgeTab && badgeCount !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    ))}
  </View>
);

export default TabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#00cc66',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
});
