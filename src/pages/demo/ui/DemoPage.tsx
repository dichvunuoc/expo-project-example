/**
 * DemoPage
 * FSD Layer: Pages
 *
 * Demo screen showing post feed
 */

import { PostFeed } from '@/widgets';
import { SafeAreaView } from 'react-native-safe-area-context';

export function DemoPage() {
  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <PostFeed />
    </SafeAreaView>
  );
}
