export default {
  expo: {
    name: "PicRun",
    slug: "picrun",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    scheme: "picrun",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0a0a0a"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.picrun.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Precisamos do GPS para rastrear sua corrida e mostrar sua posição no mapa.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Precisamos do GPS em background para rastrear sua corrida mesmo com a tela bloqueada.",
        NSLocationAlwaysUsageDescription: "Precisamos do GPS em background para rastrear sua corrida mesmo com a tela bloqueada.",
        UIBackgroundModes: ["location", "fetch"]
      }
    },
    android: {
      package: "com.picrun.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0a0a0a"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION"
      ]
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Precisamos do GPS para rastrear sua corrida e conquistar território.",
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true
        }
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
};
