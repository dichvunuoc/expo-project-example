import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api';

export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
};
