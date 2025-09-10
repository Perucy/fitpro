import React, { useState } from "react";
import {
    View,
    Text, 
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width, height } = Dimensions.get('window');

export default function AccLink() {
    const player = useVideoPlayer(
        require('../../assets/videos/FitPro_Login_Video.mp4'), player => {
        player.loop = true;
        player.muted = true;
        player.playbackRate = 1.0;
        player.play();
    });
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
            >
                
            </VideoView>
            {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>    
            <View style={styles.cardSection}>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.spotifyButton}
                    >
                        <Text style={styles.spotifyButtonText}>Link Spotify</Text>
                    </TouchableOpacity>
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
        paddingBottom: 200,
        paddingTop: 200,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        borderRadius: 16,
        borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle border
        padding: 20,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 15,
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
    spotifyButton: {
        color: '#1ed760'
    },
    spotifyButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '300',
    }
});