import { SIZES } from '@/constants/Sizes';
import { Image, StyleSheet, View } from 'react-native';


const Splash = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/image.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: "100%",
    height: SIZES.height,
  },
});

export default Splash; 