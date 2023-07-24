import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useBadgeContext } from '../contexts/BadgeContext';
import { ReservationContextProvider } from '../contexts/ReservationContext';
import BookstoreScreen from '../screens/BookstoreScreen';
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';
import CustomerReservationsScreen from '../screens/CustomerReservationsScreen';
import LogoutScreen from '../screens/LogoutScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { badge, reservationsBadge } = useBadgeContext();

  return (
    <ReservationContextProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'Bookstore') {
              iconName = focused ? 'library' : 'library-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === 'CustomerDetails') {
              iconName = focused ? 'person' : 'person-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === 'Reservations') {
              iconName = 'sticky-note-o';
              return <FontAwesome name={iconName} size={size} color={color} />;
            } else if (route.name === 'Logout') {
              iconName = 'logout';
              return <MaterialIcons name={iconName} size={size} color={color} />;
            }
          },
        })}
      >
        <Tab.Screen
          name="Bookstore"
          component={BookstoreScreen}
          options={{
            tabBarLabel: 'Books',
            title: 'Reserve a book',
            tabBarBadge: badge || undefined,
          }}
        />
        <Tab.Screen
          name="CustomerDetails"
          component={CustomerDetailsScreen}
          options={{ tabBarLabel: 'Profile', title: 'Profile' }}
        />
        <Tab.Screen
          name="Reservations"
          component={CustomerReservationsScreen}
          options={{
            tabBarLabel: 'Reservations',
            title: 'Reservations',
            tabBarBadge: reservationsBadge && reservationsBadge > 0 ? reservationsBadge : undefined,
          }}
        />
        <Tab.Screen
          name="Logout"
          component={LogoutScreen}
          options={{ tabBarLabel: 'Logout', title: '' }}
        />
      </Tab.Navigator>
    </ReservationContextProvider>
  );
};

export default AppNavigator;
