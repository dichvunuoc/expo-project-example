/**
 * Posts Query Hook
 * FSD Layer: Features
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Post } from '../model/types';

export const postsKeys = {
  all: ['posts'] as const,
  list: () => [...postsKeys.all, 'list'] as const,
  detail: (id: number) => [...postsKeys.all, 'detail', id] as const,
};

const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get(
    'https://jsonplaceholder.typicode.com/posts?_limit=10'
  );
  return data;
};

export const usePostsQuery = () => {
  return useQuery({
    queryKey: postsKeys.list(),
    queryFn: fetchPosts,
  });
};
