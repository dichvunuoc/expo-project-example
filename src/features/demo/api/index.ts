import axios from 'axios';
import { Post } from '../types';

// Using a direct axios call here to demonstrate raw API layer
// In a real app, use apiClient from '@/lib/axios'
export const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get(
    'https://jsonplaceholder.typicode.com/posts?_limit=10'
  );
  return data;
};
