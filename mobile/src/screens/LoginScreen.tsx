import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ImageBackground } from 'react-native';
import { NeonButton } from '~/atoms/NeonButton';

import { AuthStackParamList } from '~/navigation/types';
import AuthService from '~/services/AuthService';
import { LoginResponse } from '~/services/restApi/dto/response.dto';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'LoginScreen'>>();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await AuthService.login(username, password);

      switch (response) {
        case LoginResponse.EMPTY_INPUT:
          setError('Please enter both email and password.');
          break;
        case LoginResponse.INVALID_INPUT:
          setError('Please enter a valid email');
          break;
        case LoginResponse.WRONG_CREDENTIALS:
          setError('Invalid email or password.');
          break;
        case LoginResponse.SERVER_ERROR:
          setError('An error occurred. Please try again later.');
          break;
      }
    } catch (err) {
      console.log(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/ui/backgrounds/background.png')} // Make sure the image path is correct
      style={{ flex: 1 }}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <NeonButton
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          disabled={loading}
        />
        <NeonButton title="Register" onPress={() => navigation.navigate('RegisterScreen')} />
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
