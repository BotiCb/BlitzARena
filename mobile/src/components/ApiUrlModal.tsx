import React, { useEffect, useState } from 'react';
import { Modal, View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { setApiBaseUrl } from '~/services/restApi/RestApiService';
import { IStorage } from '~/services/storage/IStorage';
import { WebSocketService } from '~/services/websocket/websocket.service';

interface ApiUrlModalProps {
  storage: IStorage;
  onClose: () => void;
}

export const ApiUrlModal: React.FC<ApiUrlModalProps> = ({ storage, onClose }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    (async () => {
      const savedApiUrl = await storage.getItemAsync('apiBaseUrl');
      const savedWsUrl = await storage.getItemAsync('websocketUrl');

      if (savedApiUrl) {
        setApiBaseUrl(savedApiUrl);
        setApiUrl(savedApiUrl);
      }
      if (savedWsUrl) {
        setWsUrl(savedWsUrl);
      }

      // Show modal only if one of them is missing
      if (!savedApiUrl || !savedWsUrl) {
        setVisible(true);
      }
    })();
  }, []);

  const handleSave = async () => {
    await storage.setItemAsync('apiBaseUrl', apiUrl);
    await storage.setItemAsync('websocketUrl', wsUrl);
    setApiBaseUrl(apiUrl);
    setVisible(false);
    await WebSocketService.init();

  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.label}>Backend API URL</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter API base URL"
            value={apiUrl}
            onChangeText={setApiUrl}
          />
          <Text style={styles.label}>WebSocket URL</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter WebSocket URL"
            value={wsUrl}
            onChangeText={setWsUrl}
          />
          <Button title="Save URLs" onPress={() => { handleSave(); onClose?.(); }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
});
