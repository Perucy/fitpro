import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, AppState, Platform, TouchableOpacity } from 'react-native';
// import * as Speech from 'expo-speech';
import SpotifyService from "../../services/SpotifyService";
import WhoopService from "../../services/WhoopService";

export default function HomeScreen() {
  const [spotifyData, setSpotifyData] = useState({
    isSpotifyConnected: false,
    currentTrack: null,
    recentAlbums: [],
    loading: true
  });
  const [whoopData, setWhoopData] = useState({
    isWhoopConnected: false,
    heartRate: 84,
    strain: 4.5,
    recovery: 26,
    calories: 420,
    userName: 'Perucy',
    hrv: 37,
    skinTemp: 34.8,
    spo2: 97,
    loading: false
  });

  useEffect(() => {
    fetchSpotifyData();
    fetchWhoopData();

    // Reduced polling frequency to avoid rate limits
    const interval = setInterval(() => {
      if (spotifyData.isSpotifyConnected) {
        fetchSpotifyData();
      }
      if (whoopData.isWhoopConnected) {
        fetchWhoopData();
      }
    }, 300000); // 5 minutes instead of seconds

    return () => clearInterval(interval);
  }, [spotifyData.isSpotifyConnected, whoopData.isWhoopConnected]);

  // Update when app comes into focus
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        if (spotifyData.isSpotifyConnected) fetchSpotifyData();
        if (whoopData.isWhoopConnected) fetchWhoopData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [spotifyData.isSpotifyConnected, whoopData.isWhoopConnected]);

  const fetchWhoopData = async () => {
    try {
      const status = await WhoopService.whoop_checkStatus();
      console.log('Whoop connection status:', status);
      if (status.connected) {
        const [profile, recovery, workouts] = await Promise.all([
          WhoopService.whoop_getProfile(),
          WhoopService.whoop_getRecovery(),
          WhoopService.whoop_getWorkouts()
        ]);

        const latestRecovery = recovery?.records?.[0]?.score;
        const latestWorkout = workouts?.records?.[0]?.score;
        const calories = latestWorkout?.kilojoule ? Math.round(latestWorkout.kilojoule * 0.239) : 0;
        console.log('Latest Whoop data:', { profile, latestRecovery, latestWorkout, calories });

        setWhoopData({
          isWhoopConnected: true,
          heartRate: latestRecovery?.resting_heart_rate || 84,
          strain: latestWorkout?.strain || 100.5,
          recovery: latestRecovery?.recovery_score || 26,
          calories: calories,
          userName: profile?.first_name || 'User',
          hrv: latestRecovery?.hrv_rmssd_milli || 37,
          skinTemp: latestRecovery?.skin_temp_celsius || 344.8,
          spo2: latestRecovery?.spo2_percentage || 97,
          loading: false
        });
      } else {
        setWhoopData(prev => ({ ...prev, isWhoopConnected: false, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching Whoop data:', error);
      setWhoopData(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchSpotifyData = async () => {
    try {
      const status = await SpotifyService.spotify_checkStatus();

      if (status.connected) {
        const [profile, recentlyPlayed] = await Promise.all([
          SpotifyService.spotify_getProfile(),
          SpotifyService.spotify_getRecentlyPlayed()
        ]);

        // Extract unique albums from recently played tracks
        let recentAlbums = [];
        if (recentlyPlayed && recentlyPlayed.items) {
          const albumMap = new Map();
          recentlyPlayed.items.forEach(item => {
            const album = item.track.album;
            if (!albumMap.has(album.id)) {
              albumMap.set(album.id, {
                id: album.id,
                name: album.name,
                images: album.images,
                artist: album.artists[0]?.name
              });
            }
          });
          recentAlbums = Array.from(albumMap.values()).slice(0, 3);
        }

        setSpotifyData({
          isSpotifyConnected: true,
          recentAlbums: recentAlbums,
          loading: false
        });
      } else {
        setSpotifyData(prev => ({ ...prev, isSpotifyConnected: false, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      setSpotifyData(prev => ({ ...prev, loading: false }));
    }
  };

  const renderRecommendedMusic = () => {
    if (!spotifyData.isSpotifyConnected) {
      return (
        <View style={styles.noMusic}>
          <Text style={styles.noMusicText}>Connect Spotify for personalized recommendations</Text>
        </View>
      );
    }

    if (spotifyData.recentAlbums.length === 0) {
      return (
        <View style={styles.noMusic}>
          <Text style={styles.noMusicText}>Play some music to get recommendations</Text>
        </View>
      );
    }

    return (
      <View style={styles.recommendedRow}>
        {spotifyData.recentAlbums.map((album, index) => (
          <View key={album.id} style={styles.recommendedItem}>
            <View style={styles.recommendedArt}>
              {album.images && album.images.length > 0 ? (
                <Image
                  source={{ uri: album.images[0].url }}
                  style={styles.recommendedImage}
                />
              ) : (
                <Text style={styles.albumPlaceholder}>🎵</Text>
              )}
            </View>
            <Text style={styles.recommendedName} numberOfLines={1}>
              {album.name}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };
  const getCoachMessage = () => {
    if (whoopData.recovery > 70) {
      return "Your recovery is excellent! Your body is ready for high-intensity training. Consider strength training or HIIT workouts.";
    } else if (whoopData.recovery > 50) {
      return "Good recovery levels. Moderate intensity training is recommended. Try a steady-state cardio session or moderate strength training.";
    } else {
      return `Your recovery is at ${whoopData.recovery}%. Focus on light movement today - walking, yoga, or stretching will help your body recover.`;
    }
  };

  const speakDailyBriefing = () => {
    const greeting = getTimeBasedGreeting();
    const message = getCoachMessage();
    const briefingText = `${greeting} ${whoopData.userName}. Here's your daily recovery briefing. ${message}`;

    // Speech.speak(briefingText, {
    //   language: 'en-US',
    //   pitch: 1.0,
    //   rate: 0.8,
    //   voice: Platform.OS === 'android' ? undefined : 'com.apple.ttsbundle.Samantha-compact',
    // });
    alert(briefingText);

  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Hey, {whoopData.userName}!</Text>
          <View style={styles.headerRight}>
            <View style={styles.heartRate}>
              <Text style={styles.heartIcon}>❤️</Text>
              <Text style={styles.heartText}>{whoopData.heartRate}</Text>
            </View>
            <Text style={styles.status}>
              {whoopData.recovery > 70 ? 'Ready to Rock!' :
                whoopData.recovery > 50 ? 'Moderate' : 'Recovery Mode'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        {/* Training Guidance Card */}
        <View style={styles.preparationCard}>
          <View style={styles.todaysGuidance}>
            <Text style={styles.sectionTitle}>🌅 Today's Training Guidance</Text>
            
            <View style={styles.recoveryStatus}>
              <View style={styles.recoveryCircle}>
                <Text style={styles.recoveryScore}>{whoopData.recovery}%</Text>
                <Text style={styles.recoveryLabel}>Recovery</Text>
              </View>
              
              <View style={styles.guidanceText}>
                <Text style={styles.recommendationTitle}>
                  {whoopData.recovery > 70 ? 'High Intensity Ready' :
                   whoopData.recovery > 50 ? 'Moderate Training' : 
                   'Recovery Focus'}
                </Text>
                <Text style={styles.recommendationDetail}>
                  {whoopData.recovery > 70 ? 'Your body is primed for challenging workouts' :
                   whoopData.recovery > 50 ? 'Light to moderate exercise recommended' :
                   'Focus on mobility and light activity today'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.recommendedMusic}>
            <Text style={styles.sectionTitle}>🎵 Recommended for Recovery</Text>
            {renderRecommendedMusic()}
          </View>
        </View>

        {/* Recovery Metrics */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>{whoopData.hrv?.toFixed(0)}</Text>
            <Text style={styles.statLabel}>HRV</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={styles.statValue}>{whoopData.strain?.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Strain</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌡️</Text>
            <Text style={styles.statValue}>{whoopData.skinTemp?.toFixed(1)}°</Text>
            <Text style={styles.statLabel}>Skin Temp</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🫁</Text>
            <Text style={styles.statValue}>{whoopData.spo2?.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>SpO2</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔋</Text>
            <Text style={styles.statValue}>{whoopData.recovery}%</Text>
            <Text style={styles.statLabel}>Recovery</Text>
          </View>
        </View>
        
        {/* Expanded Coach Section */}
        <View style={styles.coachSection}>
          <View style={styles.coachHeader}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachIcon}>🤖</Text>
            </View>
            <Text style={styles.coachTitle}>Your Recovery Coach</Text>
          </View>
          
          <View style={styles.coachInsights}>
            <View style={styles.coachBubble}>
              <Text style={styles.coachMessage}>{getCoachMessage()}</Text>
            </View>
            
            <View style={styles.coachActions}>
              <TouchableOpacity style={styles.actionButton} onPress={speakDailyBriefing}>
                <Text style={styles.actionEmoji}>🗣️</Text>
                <Text style={styles.actionText}>Daily Briefing</Text>
              </TouchableOpacity>
              <View style={styles.actionButton}>
                <Text style={styles.actionEmoji}>📋</Text>
                <Text style={styles.actionText}>Training Plan</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.quickActions}>
          <Text style={styles.actionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <View style={styles.actionButton}>
              <Text style={styles.actionEmoji}>📊</Text>
              <Text style={styles.actionText}>Recovery Trends</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionEmoji}>🎵</Text>
              <Text style={styles.actionText}>Browse Music</Text>
            </View>
          </View>
        </View>        
      </View>
      
      <View style={styles.buttonContainer}>
        <Text style={styles.startButton}>GET TODAY'S PLAN</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 80,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 0
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
  preparationCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginTop: -10,
    marginBottom: 6,
    maxHeight: 280,
  },
  todaysGuidance: {
    marginBottom: 24,
  },
  recoveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recoveryCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#374151',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recoveryScore: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recoveryLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  guidanceText: {
    flex: 1,
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendationDetail: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  recommendedMusic: {
    marginTop: -8,
  },
  sectionTitle: {
    color: '#FFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recommendedRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    minHeight: 80
  },
  recommendedItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  recommendedArt: {
    width: 60,
    height: 60,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  recommendedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  recommendedName: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  albumPlaceholder: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  noMusic: {
    alignItems: 'center',
    padding: 20,
  },
  noMusicText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  coachSection: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 20,
    marginTop: -10
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coachIcon: {
    fontSize: 20,
  },
  coachTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  coachInsights: {
    marginTop: 8,
  },
  coachBubble: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  coachMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  coachActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActions: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  startButton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});