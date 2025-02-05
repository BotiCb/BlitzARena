import { StackNavigationProp } from '@react-navigation/stack';

import { GameStackParamList } from '~/navigation/types';

export function navigateToPhase(
  gamePhase: string,
  navigation: StackNavigationProp<GameStackParamList>
): void {
  switch (gamePhase) {
    case 'lobby':
      navigation.navigate('Lobby');
    default:
      navigation.navigate('Loading');
  }
}
