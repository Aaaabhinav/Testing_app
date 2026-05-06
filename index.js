import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Fix web layout — ensure root elements fill the viewport
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: #0F0F1A;
    }
    * { box-sizing: border-box; }
    input, textarea {
      outline: none;
    }
    input:focus {
      outline: none;
    }
  `;
  document.head.appendChild(style);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
