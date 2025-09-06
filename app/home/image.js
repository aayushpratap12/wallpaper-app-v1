import { Entypo, Octicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { useState } from 'react'
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'

const ImageScreen = () => {

    const router = useRouter();
    const item = useLocalSearchParams();
    const uri = item?.webformatURL;
    const [status, setStatus] = useState('loading');

    const fileName = item?.previewURL?.split('/').pop();
    const imageUrl = uri;
    const filePath = `${FileSystem.documentDirectory}${fileName}`

    const onLoad = () => {
        setStatus('');

    }

    const handleDownloadImage = async () => {
        if (Platform.OS == 'web') {
            const anchor = document.createElement('a');
            anchor.href = imageUrl;
            anchor.target = "_Blank";
             anchor.download = fileName || 'download';
             document.body.appendChild(anchor);
              anchor.click();
              document.body.removeChild(anchor); 
        } else{

            setStatus('downloading');
            let uri = await downloadFile();
            if (uri) showToast('Image Downloaded')

        }

       


    }

    const handleShareImage = async () => {

        if (Platform.OS == 'web') {
            showToast('Link Copied')
        } else {
            setStatus('sharing');
            let uri = await downloadFile();
            if (uri) {
                await Sharing.shareAsync(uri);
            }

        }





    }

    const downloadFile = async () => {
        try {
            const { uri } = await FileSystem.downloadAsync(imageUrl, filePath);
            setStatus('');
            console.log('downloaded ', uri);
            return uri;

        } catch (err) {

            console.log('got error ', err.message);
            setStatus('');
            Alert.alert('Image ', err.message);
            return null;

        }
    }

    const showToast = (message) => {
        Toast.show({
            type: 'success',
            text1: message,
            position: 'bottom'

        });
    }

    const toastConfig = {
        success: ({ text1, props, ...rest }) => (
            <View style={styles.toast}>
                <Text style={styles.toastText}>{text1}</Text>

            </View>

        )



    }

    const getSize = () => {

        const aspectRatio = item?.imageWidth / item?.imageHeight;
        const maxWidth = Platform.OS == 'web' ? wp(50) : wp(92);
        let calculatedHeight = maxWidth / aspectRatio;
        let calculatedWidth = maxWidth;

        if (aspectRatio < 1) {
            calculatedWidth = calculatedHeight * aspectRatio;
        }
        return {
            width: calculatedWidth,
            height: calculatedHeight,
        }
    }


    return (
        <BlurView
            style={styles.container}
            tint="dark"
            intensity={60}

        >

            <View style={getSize()}>
                <View style={styles.loading}>
                    {
                        status == 'loading' && <ActivityIndicator size="large" color="whitw" />
                    }
                </View>
                <Image transition={100}
                    style={[styles.image, getSize()]}
                    source={uri}
                    onLoad={onLoad}
                />

            </View>

            <View style={styles.buttons}>
                <Animated.View entering={FadeInDown.springify()}>
                    <Pressable style={styles.button} onPress={() => router.back()}>
                        <Octicons name='x' size={24} color="white" />
                    </Pressable>
                </Animated.View>
                <Animated.View entering={FadeInDown.springify().delay(100)}>
                    {
                        status == 'downloading' ? (
                            <View style={styles.button}>
                                <ActivityIndicator size="small" color="white" />
                            </View>
                        ) : (
                            <Pressable style={styles.button} onPress={handleDownloadImage}>
                                <Octicons name='download' size={24} color="white" />
                            </Pressable>
                        )

                    }

                </Animated.View>

                <Animated.View entering={FadeInDown.springify().delay(200)}>
                    {
                        status == 'sharing' ? (
                            <View style={styles.button}>
                                <ActivityIndicator size="small" color="white" />
                            </View>
                        ) : (
                            <Pressable style={styles.button} onPress={handleShareImage}>
                                <Entypo name='share' size={24} color="white" />
                            </Pressable>
                        )

                    }

                </Animated.View>

            </View>

            <Toast config={toastConfig} visibilityTime={2500} />

        </BlurView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        backgroundColor: 'rgba(0,0,0.5)'

    },
    image: {
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        backgroundColor: 'rgbs(255,255,255,0.1)',
        borderColor: 'rgbs(255,255,255,0.1)',
    },
    loading: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'

    },
    buttons: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 50

    },
    button: {
        height: hp(6),
        width: wp(6),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgbs(255,255,255,0.2)',
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous'
    },
    toast: {
        padding: 15,
        paddingHorizontal: 30,
        borderRadius: theme.radius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',


    },
    toastText: {
        fontSize: hp(1.8),
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.white,
    }
})

export default ImageScreen