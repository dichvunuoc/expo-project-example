/**
 * DemoPage
 * FSD Layer: Pages
 *
 * Demo screen showing post feed
 */

import { SafeAreaView } from 'react-native-safe-area-context';
import { PostFeed } from '@/widgets';

export function DemoPage() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PostFeed />
    </SafeAreaView>
  );
}
