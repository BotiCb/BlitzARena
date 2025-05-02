import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { NeonButton } from '~/components/NeonButton';
import { AppStackParamList } from '~/navigation/types';
import AuthService from '~/services/AuthService';
import { USER_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';
import * as ImagePicker from 'expo-image-picker';
import SplashScreen from './SplashScreen';

export const ProfileScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    photoUrl: ''
  });
  const [tempData, setTempData] = useState({
    firstName: '',
    lastName: ''
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLogout = async () => {
    await AuthService.logout();
  };

  const handleGetProfile = async () => {
    setIsLoading(true);
    const response = await apiClient.get(USER_ENDPOINTS.GET_PROFILE);
    if (response.status === 200) {
      setProfileData(response.data);
      setTempData({
        firstName: response.data.firstName,
        lastName: response.data.lastName
      });
    } else {
      console.log(response.status);
    }
    setIsLoading(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setTempData({
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    
    const formData = new FormData();
    
    // Add text fields to formData if they've changed
    if (tempData.firstName !== profileData.firstName) {
      formData.append('firstName', tempData.firstName);
    }
    if (tempData.lastName !== profileData.lastName) {
      formData.append('lastName', tempData.lastName);
    }
    
    // Add image if selected
    if (selectedImage) {
      const localUri = selectedImage;
      const filename = localUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('file', {
        uri: localUri,
        name: filename,
        type,
      } as any);
    }

    try {
      const response = await apiClient.put(
        USER_ENDPOINTS.UPDATE_PROFILE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setProfileData(prev => ({
          ...prev,
          firstName: tempData.firstName,
          lastName: tempData.lastName,
          photoUrl: response.data.photoUrl || prev.photoUrl
        }));
        setSelectedImage(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  useEffect(() => { 
    handleGetProfile();
  }, []);

  if (isLoading) {
    return  <View style={{ marginTop: 20 }}>
    <NeonButton title="Logout" onPress={handleLogout} />
    <SplashScreen />
  </View>;
  }

  return (
    <ImageBackground
      source={require('../../assets/ui/backgrounds/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover">
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
            <Image
              source={
                selectedImage
                  ? { uri: selectedImage }
                  : profileData.photoUrl
                  ? { uri: profileData.photoUrl }
                  : require('../../assets/user/plain_profile_picture.jpg')
              }
              style={{ 
                width: 150, 
                height: 150, 
                borderRadius: 75,
                borderWidth: 2,
                borderColor: '#fff'
              }}
            />
            {isEditing && (
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 5 }}>
                Tap to change photo
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <View>
            <View style={{ marginBottom: 15 }}>
              <Text style={{ color: 'white', marginBottom: 5 }}>Email</Text>
              <TextInput
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  padding: 10, 
                  borderRadius: 5 
                }}
                value={profileData.email}
                editable={false}
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ color: 'white', marginBottom: 5 }}>First Name</Text>
              {isEditing ? (
                <TextInput
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    padding: 10, 
                    borderRadius: 5 
                  }}
                  value={tempData.firstName}
                  onChangeText={(text) => setTempData(prev => ({...prev, firstName: text}))}
                />
              ) : (
                <Text style={{ color: 'white', padding: 10 }}>{profileData.firstName}</Text>
              )}
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text style={{ color: 'white', marginBottom: 5 }}>Last Name</Text>
              {isEditing ? (
                <TextInput
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    padding: 10, 
                    borderRadius: 5 
                  }}
                  value={tempData.lastName}
                  onChangeText={(text) => setTempData(prev => ({...prev, lastName: text}))}
                />
              ) : (
                <Text style={{ color: 'white', padding: 10 }}>{profileData.lastName}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {isEditing ? (
                <>
                  <NeonButton 
                    title="Save" 
                    onPress={handleSaveChanges} 
                    style={{ flex: 1 }}
                  />
                  <NeonButton 
                    title="Cancel" 
                    onPress={() => {
                      setIsEditing(false);
                      setSelectedImage(null);
                    }} 
                    style={{ flex: 1}}
                  />
                </>
              ) : (
                <NeonButton 
                  title="Edit Profile" 
                  onPress={handleEditToggle} 
                  style={{ flex: 1 }}
                />
              )}
            </View>

            <View style={{ marginTop: 20 }}>
              <NeonButton title="Logout" onPress={handleLogout} />
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};