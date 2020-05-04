import React, {Component} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {

  StyleSheet,
  View,
  Text,
  Image,
  Alert,
  Button

} from 'react-native';

// import GoogleSigninButton from './GoogleSigninButton'
import { useNavigation}  from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();

  const aa = () => {
    navigation.navigate('Main');
  };

  return (
    <LinearGradient colors={['#F9DA4F', '#F7884F']} style={styles.linearGradient}>
      <View>
        <Image
          source={require('../../assets/ic_thecross.png')}
          style={styles.icon}
        />
        <Text style={styles.titleText}>THE BIBLE</Text>
        <Text style={styles.titleInfo}>로그인해서 성경공부를 해보세요.</Text>
        {/*<GoogleSigninButton navigation= {navigation} test='zz' />*/}
        <Button title={"해해"} onPress={aa}/>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  icon: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  titleText: {
    fontWeight: 'normal',
    fontSize: 24,
    textAlign: 'center',
    margin: 20,
    color: 'white'
  },
  titleInfo: {
    fontSize: 14,
    textAlign: 'center',
    margin: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  loginButton: {
  }
});
