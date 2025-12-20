import { linkingConfig, ParsedDeepLink } from '@/navigation/linking';
import { logger, user } from '@/utils/logger';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * User Profile Screen with Deep Link Support
 *
 * URL Examples:
 * - expoapp://user/123
 * - https://expoapp.example.com/user/123
 * - expoapp://user/123?source=email&tab=posts
 */
export default function UserProfileScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    source?: string;
    tab?: string;
    message?: string;
  }>();

  const url = Linking.useURL();
  const [deepLinkInfo, setDeepLinkInfo] = React.useState<ParsedDeepLink | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeScreen = async () => {
      try {
        setLoading(true);

        // ... existing logging ...
        logger.info(
          'User Profile Screen initialized',
          {
            userId: params.userId,
            source: params.source,
            tab: params.tab,
            message: params.message,
            allParams: params,
          },
          {
            component: 'UserProfileScreen',
            action: 'initialize',
          }
        );

        // Check if we came from a deep link
        if (url) {
          const parsed = linkingConfig.parseUrl(url);
          setDeepLinkInfo(parsed);

          logger.info(
            'User Profile accessed via deep link',
            {
              url,
              isValid: parsed.isValid,
              route: parsed.route,
              params: parsed.params,
            },
            {
              component: 'UserProfileScreen',
              action: 'deepLinkAccess',
            }
          );

          // Track deep link usage
          user.action('profile_view_via_deep_link', {
            userId: params.userId,
            source: parsed.route,
            url,
            isValid: parsed.isValid,
          });
        } else {
          // ... existing else block ...
          user.action('profile_view', {
            userId: params.userId,
            source: 'navigation',
            tab: params.tab,
          });
        }

        // Simulate user data loading
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        logger.info(
          'User Profile data loaded',
          {
            userId: params.userId,
          },
          {
            component: 'UserProfileScreen',
            action: 'dataLoaded',
          }
        );
      } catch (error) {
        logger.error('Failed to initialize User Profile Screen', error, {
          userId: params.userId,
          component: 'UserProfileScreen',
          action: 'initializeError',
        });
      } finally {
        setLoading(false);
      }
    };

    initializeScreen();
  }, [params.userId, params.source, params.tab, params.message]);

  const handleShareProfile = () => {
    try {
      const shareUrl = linkingConfig.generateUrl(
        'USER_PROFILE',
        {
          userId: params.userId,
        },
        false
      ); // Use custom scheme for in-app sharing

      logger.info(
        'User Profile shared',
        {
          userId: params.userId,
          shareUrl,
        },
        {
          component: 'UserProfileScreen',
          action: 'shareProfile',
        }
      );

      user.action('profile_shared', {
        userId: params.userId,
        shareUrl,
      });

      // In a real app, you would open share dialog here
      // Share.share({
      //   message: `Check out user ${params.userId} profile`,
      //   url: shareUrl,
      // });
    } catch (error) {
      logger.error('Failed to share User Profile', error, {
        userId: params.userId,
        component: 'UserProfileScreen',
        action: 'shareError',
      });
    }
  };

  const handleGoToSettings = () => {
    logger.info(
      'Navigate to user settings',
      {
        userId: params.userId,
      },
      {
        component: 'UserProfileScreen',
        action: 'navigateToSettings',
      }
    );

    user.action('navigate_to_user_settings', {
      userId: params.userId,
    });

    router.push(`/user/${params.userId}/settings`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
        <Text style={styles.subtitle}>ID: {params.userId}</Text>
      </View>

      {/* Deep Link Info */}
      {deepLinkInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deep Link Information</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>URL: {deepLinkInfo.url}</Text>
            <Text style={styles.infoText}>Route: {deepLinkInfo.route}</Text>
            <Text style={styles.infoText}>
              Valid: {deepLinkInfo.isValid ? 'Yes' : 'No'}
            </Text>
            {deepLinkInfo.params && (
              <Text style={styles.infoText}>
                Parameters: {JSON.stringify(deepLinkInfo.params, null, 2)}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* URL Parameters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>URL Parameters</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>User ID: {params.userId}</Text>
          {params.source && (
            <Text style={styles.infoText}>Source: {params.source}</Text>
          )}
          {params.tab && <Text style={styles.infoText}>Tab: {params.tab}</Text>}
          {params.message && (
            <Text style={styles.infoText}>Message: {params.message}</Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <Text style={styles.actionButton} onPress={handleShareProfile}>
              Share Profile
            </Text>
            <Text style={styles.actionButton} onPress={handleGoToSettings}>
              Settings
            </Text>
          </View>
        </View>
      </View>

      {/* Additional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generated URLs</Text>
        <View style={styles.urlContainer}>
          <Text style={styles.urlLabel}>Custom Scheme:</Text>
          <Text style={styles.urlValue}>
            {linkingConfig.generateUrl(
              'USER_PROFILE',
              { userId: params.userId },
              false
            )}
          </Text>

          <Text style={styles.urlLabel}>Universal Link:</Text>
          <Text style={styles.urlValue}>
            {linkingConfig.generateUrl(
              'USER_PROFILE',
              { userId: params.userId },
              true
            )}
          </Text>
        </View>
      </View>

      {/* Debug Information */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Information</Text>
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              All Search Params: {JSON.stringify(params, null, 2)}
            </Text>
            <Text style={styles.debugText}>
              Router Can Go Back: {router.canGoBack() ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoContainer: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 100,
  },
  urlContainer: {
    gap: 12,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  urlValue: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  debugContainer: {
    gap: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
});
