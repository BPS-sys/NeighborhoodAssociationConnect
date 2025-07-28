import BulletinBoard from '@/screens/BoardScreen.tsx';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const BottomTabs: React.FC = () => (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={BulletinBoard} />
    </Tab.Navigator>
  );

export default BottomTabs;

// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。