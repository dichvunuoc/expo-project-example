import { warn as logger } from '@/shared/lib/logger';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      logger('Failed to get push token for push notification!', undefined, {
        component: 'usePushNotifications',
        action: 'registerForPushNotifications',
      });
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      logger(
        'Expo Push Token registered',
        { token },
        {
          component: 'usePushNotifications',
          action: 'registerForPushNotifications',
        }
      );
    } catch (e) {
      logger('Error getting push token', e as Record<string, unknown>, {
        component: 'usePushNotifications',
        action: 'registerForPushNotifications',
      });
    }
  } else {
    logger('Must use physical device for Push Notifications', undefined, {
      component: 'usePushNotifications',
      action: 'registerForPushNotifications',
    });
  }

  return token;
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(
    undefined
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // Logic: Navigate to specific screen based on notification data
        const data = response.notification.request.content.data;

        // Example: data = { url: "/(tabs)/explore" }
        if (data?.url && typeof data.url === 'string') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(data.url as any);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}
