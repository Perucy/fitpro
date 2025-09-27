# FitPro Frontend

A React Native fitness and wellness app that integrates with Whoop and Spotify to provide personalized training guidance and music recommendations based on recovery data.

> **⚠️ Project Status**: This project is currently on hold while I focus on other priorities. The codebase is functional but may not receive regular updates. Feel free to fork and continue development!

## 🛠️ Built With

**Languages & Frameworks:**
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript** - Type-safe JavaScript
- ![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black) **React Native** - Cross-platform mobile development
- ![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white) **Expo** - React Native development platform

**Key Libraries:**
- ![React Navigation](https://img.shields.io/badge/React_Navigation-6366F1?style=flat&logo=react&logoColor=white) **Expo Router** - File-based navigation
- ![React Query](https://img.shields.io/badge/Secure_Store-FF4785?style=flat&logo=expo&logoColor=white) **Expo Secure Store** - Encrypted storage
- ![Styled Components](https://img.shields.io/badge/Video-FF6B6B?style=flat&logo=expo&logoColor=white) **Expo Video** - Video playback
- ![Axios](https://img.shields.io/badge/Linking-4A90E2?style=flat&logo=expo&logoColor=white) **Expo Linking** - Deep links & OAuth

**Integrations:**
- ![Spotify](https://img.shields.io/badge/Spotify_API-1DB954?style=flat&logo=spotify&logoColor=white) **Spotify Web API** - Music data and recommendations
- ![Whoop](https://img.shields.io/badge/Whoop_API-FF6B35?style=flat&logo=fitbit&logoColor=white) **Whoop API** - Fitness and recovery metrics
- ![OAuth](https://img.shields.io/badge/OAuth_2.0-4285F4?style=flat&logo=oauth&logoColor=white) **OAuth 2.0** - Secure authentication

**Development Tools:**
- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) **Node.js** - Runtime environment
- ![Metro](https://img.shields.io/badge/Metro-EF4444?style=flat&logo=metro&logoColor=white) **Metro** - JavaScript bundler
- ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) **ESLint** - Code linting
- ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat&logo=prettier&logoColor=black) **Prettier** - Code formatting

## 🌟 Features

- **User Authentication**: Secure login and registration system
- **Whoop Integration**: Real-time access to recovery metrics, HRV, strain, and sleep data
- **Spotify Integration**: Music recommendations based on recovery status
- **AI Recovery Coach**: Personalized training guidance using recovery data
- **Beautiful UI**: Modern design with video backgrounds and glassmorphism effects
- **Cross-Platform**: Built with Expo for iOS and Android compatibility

## 📱 Screenshots

The app features a sleek, modern interface with:
- Video background login screens
- Glassmorphic cards and overlays
- Recovery-based dashboard
- Integrated music recommendations
- AI coach insights

## 🏗️ Architecture

### File Structure

```
app/
├── (login)/              # Authentication flow
│   ├── _layout.tsx       # Login stack navigator
│   ├── index.tsx         # Welcome screen with video
│   ├── form.tsx          # Login/Register form
│   └── link.tsx          # Account linking (Whoop/Spotify)
├── (tabs)/               # Main app navigation
│   ├── _layout.tsx       # Tab navigator
│   ├── index.tsx         # Home/Dashboard
│   ├── workout.tsx       # Workout screen
│   ├── music.tsx         # Music screen
│   ├── coach.tsx         # AI Coach screen
│   └── explore.tsx       # More/Settings
├── _layout.tsx           # Root layout
└── +not-found.tsx        # 404 screen

hooks/                    # Custom React hooks
├── useAppAuth.ts         # Authentication logic
├── useWhoopAuth.ts       # Whoop integration
├── useSpotifyAuth.ts     # Spotify integration
└── useColorScheme.ts     # Theme management

services/                 # API service layers
├── WhoopService.ts       # Whoop API integration
└── SpotifyService.ts     # Spotify API integration

types/                    # TypeScript definitions
├── app.ts               # App-wide types
├── whoop.ts             # Whoop data types
└── spotify.ts           # Spotify data types
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development)
- **Android Studio** (for Android development)
- **Backend API** running on `http://127.0.0.1:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fitpro-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on devices**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical devices

### Environment Setup

The app expects your backend API to be running on:
- **Development**: `http://127.0.0.1:8000`
- **Production**: Update `baseURL` in service files

## 🔧 Configuration

### API Endpoints

The app connects to these backend endpoints:

**Authentication**
- `POST /app/login` - User login
- `POST /app/register` - User registration

**Whoop Integration**
- `GET /whoop/status` - Check connection status
- `GET /whoop/auth/login` - Start OAuth flow
- `GET /whoop/profile` - User profile data
- `GET /whoop/recovery` - Recovery metrics
- `GET /whoop/workouts` - Workout data
- `DELETE /whoop/disconnect` - Remove connection

**Spotify Integration**
- `GET /spotify/status` - Check connection status
- `GET /spotify/auth/login` - Start OAuth flow
- `GET /spotify/profile` - User profile
- `GET /spotify/recently-played` - Recent tracks
- `GET /spotify/currently-playing` - Current track
- `DELETE /spotify/disconnect` - Remove connection

### Deep Link Configuration

Configure deep links in `app.json`:
```json
{
  "expo": {
    "scheme": "fitpro",
    "web": {
      "bundler": "metro"
    }
  }
}
```

## 🎯 Key Components

### Authentication Flow

1. **Welcome Screen** (`(login)/index.tsx`)
   - Video background with call-to-action
   - Routes to login form

2. **Login/Register Form** (`(login)/form.tsx`)
   - Tabbed interface for login/signup
   - Form validation and error handling
   - Social login options (Apple/Google)

3. **Account Linking** (`(login)/link.tsx`)
   - Connect Whoop and Spotify accounts
   - OAuth flow handling
   - Skip option for later setup

### Main App

1. **Dashboard** (`(tabs)/index.tsx`)
   - Recovery metrics overview
   - AI coach recommendations
   - Music suggestions based on recovery
   - Quick action buttons

2. **Navigation**
   - Home: Dashboard and metrics
   - Workout: Training plans
   - Music: Spotify integration
   - Coach: AI insights
   - More: Settings and additional features

## 🔐 Security

### Secure Storage

- Uses `expo-secure-store` for token management
- Authentication tokens stored securely
- User data encrypted at rest

### API Authentication

- Bearer token authentication
- Automatic token refresh handling
- Secure HTTP-only communication

## 🎨 Styling

### Design System

- **Colors**: Dark theme with blue accents
- **Typography**: System fonts with custom weights
- **Effects**: Glassmorphism, shadows, gradients
- **Responsive**: Adaptive layouts for different screen sizes

### Key Style Features

- Video backgrounds for immersive experience
- Transparent cards with backdrop blur
- Smooth animations and transitions
- Consistent spacing and typography

## 📱 Platform Considerations

### iOS
- Native video player integration
- Haptic feedback for interactions
- Safe area handling
- Apple-style navigation

### Android
- Material Design elements
- Hardware back button support
- Status bar customization
- Android-specific permissions

## 🔌 Third-Party Integrations

### Whoop API
- OAuth 2.0 authentication
- Real-time recovery data
- Sleep and strain metrics
- Heart rate variability

### Spotify Web API
- OAuth 2.0 authentication
- Recently played tracks
- Current playback state
- User profile information

### Expo Services
- **expo-video**: Video background playback
- **expo-router**: File-based navigation
- **expo-secure-store**: Secure token storage
- **expo-linking**: Deep link handling

## 🚀 Deployment

### Development Build
```bash
npx expo install --fix
npx expo run:ios
npx expo run:android
```

### Production Build
```bash
eas build --platform all
eas submit --platform all
```

### Environment Variables
```bash
# .env
API_BASE_URL=https://your-production-api.com
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

## 🧪 Testing

### Running Tests
```bash
npm test
# or
yarn test
```

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API services
- E2E tests for critical user flows

## 🐛 Troubleshooting

### Common Issues

1. **Video not playing**
   - Check video file paths in `assets/videos/`
   - Ensure video formats are supported

2. **OAuth redirects failing**
   - Verify deep link configuration
   - Check URL scheme in `app.json`

3. **API connection issues**
   - Ensure backend is running on correct port
   - Check network permissions in app config

4. **Secure store errors**
   - Clear app data and reinstall
   - Check device security settings

### Debug Mode
```bash
npx expo start --dev-client
```

## 📈 Performance

### Optimization Features
- Lazy loading of components
- Image optimization with `expo-image`
- Efficient state management
- Minimal re-renders with proper memoization

### Monitoring
- Performance metrics tracking
- Error boundary implementation
- Crash reporting integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow Expo/React Native conventions
- Maintain consistent formatting
- Document complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions or issues:
- Check the troubleshooting section
- Review existing GitHub issues
- Create a new issue with detailed information

---

Built with ❤️ using React Native and Expo