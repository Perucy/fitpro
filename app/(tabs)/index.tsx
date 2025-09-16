import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Hey, Perucy!</Text>
          <View style={styles.headerRight}>
            <View style={styles.heartRate}>
              <Text style={styles.heartIcon}>❤️</Text>
              <Text style={styles.heartText}>72</Text>
            </View>
            <Text style={styles.status}>Ready to Rock!</Text>
          </View>
        </View>
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        <View style={styles.musicCard}>
          <View style={styles.currentlyPlaying}>
            <Text style={styles.sectionTitle}>🎵 Currently Playing</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 100,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 52,
  },
  heartRate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartIcon: {
    fontSize: 18,
  },
  heartText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  musicCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
    minHeight: 100,
  },
  currentlyPlaying: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  }
});