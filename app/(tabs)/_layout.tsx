import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants';

// Ícones simples com View (depois substitui por lib de ícones)
function MapIcon({ focused }: { focused: boolean }) {
  return (
    <View
      style={[
        styles.icon,
        { backgroundColor: focused ? COLORS.primary : COLORS.textMuted },
      ]}
    />
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  return (
    <View
      style={[
        styles.iconCircle,
        { borderColor: focused ? COLORS.primary : COLORS.textMuted },
      ]}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused }) => <MapIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
});
