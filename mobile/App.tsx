import 'react-native-gesture-handler';
import { AuthProvider } from '~/contexts/AuthContext';
import RootNavigation from '~/navigation/RootNavigation';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
