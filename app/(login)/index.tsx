import React from "react";
import {
    View, 
    StyleSheet,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    Button,
    Alert,
    Text,
    TouchableWithoutFeedback,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AppPage() {
    const player = useVideoPlayer(
        require('../../assets/videos/FitPro_Open_App (1).mp4'), player => {
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
            />
            <TouchableOpacity style={styles.overlayButton}
                onPress={() => router.push('../(login)/form')}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
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

    overlayButton: {
        position: 'absolute',
        bottom: 80,
        left: 40,
        right: 40,
        padding: 15,
        backgroundColor:'#1f2937',
        borderRadius:10,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});