import BulletinBoard from '@/screens/BulletinBoard';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const BottomTabs: React.FC = () => (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={BulletinBoard} />
    </Tab.Navigator>
  );

export default BottomTabs;