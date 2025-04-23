import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ImageBackground } from 'react-native';

import { AuthStackParamList } from '~/navigation/types';
import { RegisterRequestDto } from '~/services/restApi/dto/request.dto';
import { AUTH_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'RegisterScreen'>>();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      if (!email || !password || !firstname || !lastname || !confirmPassword) {
        setError('Please enter all fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      await apiClient.post(
        AUTH_ENDPOINTS.REGISTER,
        new RegisterRequestDto(firstname, lastname, email, password)
      );

      navigation.navigate('LoginScreen');
    } catch (err: any) {
      if (err.response.status === 400) {
        setError(err.response.data.message);
        return;
      }
      if (err.response.status === 409) {
        setError('User already exists');
        return;
      }

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
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput
          style={styles.input}
          placeholder="First name"
          value={firstname}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          value={lastname}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={loading ? 'Registering...' : 'Register'}
          onPress={handleRegister}
          disabled={loading}
        />
        <Button title="Login" onPress={() => navigation.navigate('LoginScreen')} />
      </View>
    </ImageBackground>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
