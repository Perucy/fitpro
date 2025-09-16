import React, { useState } from "react";
import {
    View,
    Text, 
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    Dimensions,
    Image,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import Entypo from '@expo/vector-icons/Entypo';
import { useWhoop } from '../../hooks/useWhoopAuth'; // Import your Whoop hook

const { width, height } = Dimensions.get('window');

export default function AccLink() {
    const { isLinked, isLoading, linkWhoop, unlinkWhoop } = useWhoop();
    const [connecting, setConnecting] = useState(false);

    const player = useVideoPlayer(
        require('../../assets/videos/FitPro_Login_Video.mp4'), player => {
        player.loop = true;
        player.muted = true;
        player.playbackRate = 1.0;
        player.play();
    });

    const handleWhoopPress = async () => {
        if (isLinked) {
            // Show options to disconnect or continue
            Alert.alert(
                "Whoop Connected",
                "Your Whoop account is already connected.",
                [
                    { text: "Disconnect", onPress: handleWhoopDisconnect },
                    { text: "Continue", onPress: () => router.replace('/(tabs)/coach') }
                ]
            );
        } else {
            // Start connection process
            await handleWhoopConnect();
        }
    };

    const handleWhoopConnect = async () => {
        setConnecting(true);
        try {
            await linkWhoop();
            Alert.alert(
                "Success!",
                "Whoop account connected successfully",
                [{ text: "OK", onPress: () => router.replace('/(tabs)/coach') }]
            );
        } catch (error) {
            Alert.alert(
                "Connection Failed",
                "Failed to connect Whoop account. Please try again.",
                [{ text: "OK" }]
            );
        } finally {
            setConnecting(false);
        }
    };

    const handleWhoopDisconnect = async () => {
        try {
            await unlinkWhoop();
            Alert.alert("Disconnected", "Whoop account disconnected");
        } catch (error) {
            Alert.alert("Error", "Failed to disconnect Whoop account");
        }
    };
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <VideoView
                style={styles.backgroundVideo}
                player={player}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
                showsTimecodes={false}
                requiresLinearPlayback={false}
                contentFit="cover"
                nativeControls={false}
                pointerEvents="none"
            />
            
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>    

            <View style={styles.cardSection}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Connect Your Accounts</Text>
                        <Text style={styles.cardSubtitle}>Link your favorite apps to get started</Text>
                    </View>
                    
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.spotifyButton}
                            onPress={() => {
                                // TODO: Add Spotify connection logic
                                Alert.alert("Coming Soon", "Spotify integration coming soon!");
                            }}
                        >
                            <Entypo name="spotify" size={32} color="black" />
                            <Text style={styles.spotifyButtonText}>Connect Spotify</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                styles.whoopButton,
                                isLinked && styles.whoopButtonConnected
                            ]}
                            onPress={handleWhoopPress}
                            disabled={connecting || isLoading}
                        >
                            <Image 
                                source={require('../../assets/images/WHOOP_Puck_Black.png')} 
                                style={styles.whooplogo}
                            />
                            {connecting || isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.whoopButtonText}>
                                    {isLinked ? 'Whoop Connected ✓' : 'Connect Whoop'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.cardFooter}>
                        <TouchableOpacity 
                            style={styles.skipButton}
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Text style={styles.skipButtonText}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },

    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: width,
        height: height,
    },
    cardSection: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: -40,
        zIndex: 2,
        paddingBottom: 300,
        paddingTop: 200,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        borderRadius: 16,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: 12,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 15,
        justifyContent: 'space-between', // Distribute content evenly
    },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
        padding: 10,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '800',
    },
    
    // New card sections
    cardHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    
    // Buttons container with spacing
    buttonsContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 24, // Space between buttons - you can adjust this value
    },
    
    spotifyButton: {
        backgroundColor: '#1db954',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    spotifyButtonText: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
    },
    whoopButton: {
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    whoopButtonText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    whooplogo: {
        width: 35,
        height: 35,
        aspectRatio: 1
    },
    whoopButtonConnected: {
        backgroundColor: '#34C759', // Green when connected
    },
    // Card footer
    cardFooter: {
        alignItems: 'center',
        marginTop: 16, // Reduced from 20
    },
    skipButton: {
        padding: 12,
    },
    skipButtonText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
});