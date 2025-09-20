import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SpotifyService from "../../services/SpotifyService";

export default function HomeScreen() {
  const [spotifyData, setSpotifyData] = useState({
    isSpotifyConnected: false,
    currentTrack: null,
    recentPlaylists: [],
    loading: true
  });

  useEffect(() => {
    fetchSpotifyData();

    const interval = setInterval(() => {
      if (spotifyData.isSpotifyConnected) {
        fetchSpotifyData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [spotifyData.isSpotifyConnected]);

  const fetchSpotifyData = async () => {
    try {
      const status = await SpotifyService.spotify_checkStatus();
      // console.log('Spotify status:', status);

      if (status.connected) {
        const [profile, playlists, currentplaying] = await Promise.all([
          SpotifyService.spotify_getProfile(),
          SpotifyService.spotify_getPlaylist(),
          SpotifyService.spotify_getCurrentlyPlaying()
        ]);

        // console.log('Spotify current playing:', currentplaying);
        // console.log('Spotify playlists:', playlists);

        setSpotifyData({
          isSpotifyConnected: true,
          currentTrack: currentplaying,
          recentPlaylists: playlists?.items?.slice(0, 5) || [],
          loading: false
        });
      } else {
        setSpotifyData({
          isSpotifyConnected: false,
          currentTrack: null,
          recentPlaylists: [],
          loading: true
        });
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      setSpotifyData(prev => ({ ...prev, loading: false }));
    }
  };
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
            
            {/* Album Art + Song Info Row */}
            <View style={styles.currentTrackRow}>
              {/* Album Art */}
              <View style={styles.albumArt}>
                {spotifyData.isSpotifyConnected && 
                  spotifyData.currentTrack &&
                  spotifyData.currentTrack.item &&
                  spotifyData.currentTrack.item.album.images &&
                  spotifyData.currentTrack.item.album.images.length > 0 ? (
                    <Image
                      source={{ uri: spotifyData.currentTrack.item.album.images[0].url }}
                      style={styles.albumImage}
                    />
                  ) : (
                    <Text style={styles.albumPlaceholder}>🎵</Text>
                  )}
              </View>
              
              {/* Song Details */}
              <View style={styles.songDetails}>
                {spotifyData.isSpotifyConnected ? (
                  spotifyData.currentTrack && spotifyData.currentTrack.item ? (
                    <>
                      <Text style={styles.songName}>
                        {spotifyData.currentTrack.item.name || 'Unknown Track'}
                      </Text>
                      <Text style={styles.artistName}>
                        {spotifyData.currentTrack.item.artists?.[0]?.name || 'Unknown Artist'}
                      </Text>
                      <Text style={styles.songBPM}>
                        {spotifyData.currentTrack.item.album?.name || 'Unknown Album'}
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
            <View style={styles.recentPlaylists}>
              <Text style={styles.sectionTitle}>Recent Playlists</Text>

              {/*playlist row*/}
              <View style={styles.playlistsRow}>
                {spotifyData.recentPlaylists.map((playlist, index) => (
                  <View key={playlist.id} style={styles.playlistItem}>
                    <View style={styles.playlistArt}>
                      {playlist.images && playlist.images.length > 0 ? (
                        <Image
                          source={{ uri: playlist.images[0].url }}
                          style={styles.playlistImage}
                        />
                      ) : (
                        <Text style={styles.playlistPlaceholder}>🎵</Text>
                      )}
                    </View>
                    <Text style={styles.playlistName} numberOfLines={1}>
                      {playlist.name}
                    </Text>
                  </View>
                ))}
              </View>
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
            {/* Coach Avatar */}
            <View style={styles.coachAvatar}>
              <Text style={styles.coachIcon}>🤖</Text>
            </View>
            
            {/* Coach Message */}
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
        {/* Quick Actions */}
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
      {/* Start Training Button */}
      <View style={styles.buttonContainer}>
        <Text style={styles.startButton}>START TRAINING</Text>
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
    // paddingBottom: 0,
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
  albumImage: {
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
  albumArt: {
    width: 60,
    height: 60,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  albumPlaceholder: {
    fontSize: 24,
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
  recentPlaylists: {
    marginTop: 20,
  },
  playlistsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  playlistItem: {
    alignItems: 'center',
    flex: 1,
  },
  playlistArt: {
    width: 50,
    height: 50,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  playlistPlaceholder: {
    fontSize: 20,
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
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
    marginHorizontal: 16, // Add horizontal margin since it's outside content
    marginBottom: 0,
    position: 'absolute', // Position it absolutely
    bottom: 90, // Adjust this number to position it where you want
    left: 0,
    right: 0,
  },
  startButton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});