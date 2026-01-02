/**
 * Posts Mock Data
 * FSD Layer: Shared
 * Feature: Posts
 *
 * Mock data and helpers for posts
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MockPost {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DATA
// ============================================================================

export const mockPosts: MockPost[] = [
  {
    id: 1,
    userId: 1,
    title: 'Getting Started with React Native',
    body: 'React Native is a powerful framework for building mobile applications using JavaScript and React. In this post, we will explore the basics of setting up a new project and creating your first components.',
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2024-01-10T08:00:00.000Z',
  },
  {
    id: 2,
    userId: 1,
    title: 'Understanding MVVM Pattern',
    body: 'The Model-View-ViewModel (MVVM) pattern is a software architectural pattern that facilitates the separation of the development of the graphical user interface from the business logic.',
    createdAt: '2024-01-12T10:30:00.000Z',
    updatedAt: '2024-01-12T10:30:00.000Z',
  },
  {
    id: 3,
    userId: 2,
    title: 'Feature-Sliced Design in Practice',
    body: 'Feature-Sliced Design (FSD) is an architectural methodology for frontend applications. It helps organize code by features rather than by technical roles, making it easier to maintain and scale.',
    createdAt: '2024-01-15T14:00:00.000Z',
    updatedAt: '2024-01-16T09:00:00.000Z',
  },
  {
    id: 4,
    userId: 2,
    title: 'State Management with Zustand',
    body: 'Zustand is a small, fast, and scalable state management solution. Unlike Redux, it does not require boilerplate code and is very easy to set up and use in your React applications.',
    createdAt: '2024-01-18T11:00:00.000Z',
    updatedAt: '2024-01-18T11:00:00.000Z',
  },
  {
    id: 5,
    userId: 3,
    title: 'Testing React Native Apps',
    body: 'Testing is crucial for maintaining code quality. In this article, we explore different testing strategies for React Native apps including unit tests, integration tests, and end-to-end tests.',
    createdAt: '2024-01-20T16:00:00.000Z',
    updatedAt: '2024-01-21T08:30:00.000Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all posts
 */
export const getAllPosts = (): MockPost[] => {
  return [...mockPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Get posts by user ID
 */
export const getPostsByUserId = (userId: number): MockPost[] => {
  return mockPosts
    .filter((p) => p.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

/**
 * Get post by ID
 */
export const getPostById = (id: number): MockPost | undefined => {
  return mockPosts.find((p) => p.id === id);
};
