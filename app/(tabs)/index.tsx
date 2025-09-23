import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SpotifyService from "../../services/SpotifyService";

export default function HomeScreen() {
  const [spotifyData, setSpotifyData] = useState({
    isSpotifyConnected: false,
    currentTrack: null,
    recentAlbums: [],
    loading: true
  });

  useEffect(() => {
    fetchSpotifyData();

    // Smart polling - faster when music is playing, slower when not
    const isPlaying = spotifyData.currentTrack?.is_playing;
    const interval = setInterval(() => {
      if (spotifyData.isSpotifyConnected) {
        fetchSpotifyData();
      }
    }, isPlaying ? 3000 : 10000); // 3s when playing, 10s when paused

    return () => clearInterval(interval);
  }, [spotifyData.isSpotifyConnected, spotifyData.currentTrack?.is_playing]);

  // Update when app comes into focus
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && spotifyData.isSpotifyConnected) {
        fetchSpotifyData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [spotifyData.isSpotifyConnected]);

  const fetchSpotifyData = async () => {
    try {
      const status = await SpotifyService.spotify_checkStatus();

      if (status.connected) {
        const [profile, recentlyPlayed, currentplaying] = await Promise.all([
          SpotifyService.spotify_getProfile(),
          SpotifyService.spotify_getRecentlyPlayed(),
          SpotifyService.spotify_getCurrentlyPlaying()
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
          recentAlbums = Array.from(albumMap.values()).slice(0, 5);
        }

        // Always use real data - no placeholders
        setSpotifyData({
          isSpotifyConnected: true,
          currentTrack: currentplaying, // Can be null if nothing playing
          recentAlbums: recentAlbums, // Real albums or empty array
          loading: false
        });
      } else {
        setSpotifyData({
          isSpotifyConnected: false,
          currentTrack: null,
          recentAlbums: [],
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      setSpotifyData(prev => ({ ...prev, loading: false }));
    }
  };

  // Render album items with only real data
  const renderAlbumItems = () => {
    if (spotifyData.loading) {
      return (
        <View style={styles.noAlbums}>
          <Text style={styles.noAlbumsText}>Loading recent music...</Text>
        </View>
      );
    }

    if (!spotifyData.isSpotifyConnected) {
      return (
        <View style={styles.noAlbums}>
          <Text style={styles.noAlbumsText}>Connect Spotify to view recent albums</Text>
        </View>
      );
    }

    if (!spotifyData.recentAlbums || spotifyData.recentAlbums.length === 0) {
      return (
        <View style={styles.noAlbums}>
          <Text style={styles.noAlbumsText}>No recent albums found. Play some music!</Text>
        </View>
      );
    }

    // Always show real album data
    return (
      <View style={styles.albumsRow}>
        {spotifyData.recentAlbums.map((album, index) => (
          <View key={album.id} style={styles.albumItem}>
            <View style={styles.albumArtContainer}>
              {album.images && album.images.length > 0 ? (
                <Image
                  source={{ uri: album.images[0].url }}
                  style={styles.albumImage}
                />
              ) : (
                <Text style={styles.albumPlaceholder}>🎵</Text>
              )}
            </View>
            <Text style={styles.albumName} numberOfLines={2}>
              {album.name}
            </Text>
            <Text style={styles.albumArtist} numberOfLines={1}>
              {album.artist}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
            
            <View style={styles.currentTrackRow}>
              <View style={styles.currentAlbumArt}>
                {spotifyData.isSpotifyConnected && 
                  spotifyData.currentTrack &&
                  spotifyData.currentTrack.item &&
                  spotifyData.currentTrack.item.album &&
                  spotifyData.currentTrack.item.album.images &&
                  spotifyData.currentTrack.item.album.images.length > 0 ? (
                    <Image
                      source={{ uri: spotifyData.currentTrack.item.album.images[0].url }}
                      style={styles.currentAlbumImage}
                    />
                  ) : (
                    <Text style={styles.currentAlbumPlaceholder}>
                      {spotifyData.isSpotifyConnected ? '⏸️' : '🎵'}
                    </Text>
                  )}
              </View>
              
              <View style={styles.songDetails}>
                {spotifyData.isSpotifyConnected ? (
                  spotifyData.currentTrack && spotifyData.currentTrack.item ? (
                    <>
                      <Text style={styles.songName}>
                        {spotifyData.currentTrack.item.name}
                      </Text>
                      <Text style={styles.artistName}>
                        {spotifyData.currentTrack.item.artists?.[0]?.name}
                      </Text>
                      <Text style={styles.songBPM}>
                        {spotifyData.currentTrack.item.album?.name}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.songName}>No music playing</Text>
                      <Text style={styles.artistName}>Start playing on Spotify</Text>
                      <Text style={styles.songBPM}>Track info will appear here</Text>
                    </>
                  )
                ) : (
                  <>
                    <Text style={styles.songName}>Connect Spotify</Text>
                    <Text style={styles.artistName}>Link your account to see music</Text>
                    <Text style={styles.songBPM}>Tap to connect</Text>
                  </>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.recentAlbums}>
            <Text style={styles.sectionTitle}>Recent Albums</Text>
            {renderAlbumItems()}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏃‍♂️</Text>
            <Text style={styles.statValue}>4.5k</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>1000</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={styles.statValue}>9.9</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>45m</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>3/5</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>
        
        <View style={styles.coachSection}>
          <View style={styles.coachRow}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachIcon}>🤖</Text>
            </View>
            <View style={styles.coachMessageContainer}>
              <View style={styles.coachBubble}>
                <Text style={styles.coachMessage}>
                  Your last run at 138 BPM was 🔥 Try pushing to 142 BPM today!
                </Text>
              </View>
              <Text style={styles.coachAction}>Tap to ask Coach anything</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.quickActions}>
          <Text style={styles.actionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <View style={styles.actionButton}>
              <Text style={styles.actionEmoji}>📊</Text>
              <Text style={styles.actionText}>View Stats</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionEmoji}>🎵</Text>
              <Text style={styles.actionText}>Browse Music</Text>
            </View>
          </View>
        </View>        
      </View>
      
      <View style={styles.buttonContainer}>
        <Text style={styles.startButton}>START TRAINING</Text>
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
  },
  currentlyPlaying: {
    marginBottom: 24,
  },
  currentAlbumImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#FFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
  currentTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  currentAlbumArt: {
    width: 60,
    height: 60,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentAlbumPlaceholder: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  songDetails: {
    flex: 1,
  },
  songName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artistName: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 2,
  },
  songBPM: {
    color: '#6B7280',
    fontSize: 12,
  },
  recentAlbums: {
    marginTop: 20,
  },
  albumsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    minHeight: 100,
  },
  albumItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    maxWidth: 70,
  },
  albumArtContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  albumPlaceholder: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  albumName: {
    color: '#FFFFFF',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 11,
    marginBottom: 2,
  },
  albumArtist: {
    color: '#9CA3AF',
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 10,
  },
  albumImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  noAlbums: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 100,
  },
  noAlbumsText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  coachSection: {
    marginBottom: 20,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  coachMessageContainer: {
    flex: 1,
  },
  coachBubble: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
  },
  coachMessage: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  coachAction: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
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