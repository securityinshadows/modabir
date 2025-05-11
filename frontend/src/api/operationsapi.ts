import axiosInstance from '../utils/axiosInstance';
import { Operation, Post } from '../utils/types';

// Operations API
export const fetchOperations = async (): Promise<Operation[]> => {
  const response = await axiosInstance.get('/operations');
  return response.data.data;
};

export const fetchOperationById = async (operationId: string): Promise<Operation> => {
  const response = await axiosInstance.get(`/operations/${operationId}`);
  return response.data.data;
};

export const createOperation = async (operation: Partial<Operation>): Promise<Operation> => {
  const response = await axiosInstance.post('/operations', operation);
  return response.data.data;
};

export const updateOperation = async (operationId: string, updates: Partial<Operation>): Promise<Operation> => {
  const response = await axiosInstance.put(`/operations/${operationId}`, updates);
  return response.data.data;
};

export const deleteOperation = async (operationId: string): Promise<void> => {
  await axiosInstance.delete(`/operations/${operationId}`);
};

// Posts API
export const fetchPosts = async (operationId: string): Promise<Post[]> => {
  const response = await axiosInstance.get(`/operations/${operationId}/posts`);
  return response.data.data;
};

export const createPost = async (operationId: string, post: Partial<Post>): Promise<Post> => {
    const response = await axiosInstance.post(`/operations/${operationId}/posts`, post);
    return response.data.data;
  };

export const updatePost = async (operationId: string, postId: string, updates: Partial<Post>): Promise<Post> => {
  const response = await axiosInstance.put(`/operations/${operationId}/posts/${postId}`, updates);
  return response.data.data;
};

export const deletePost = async (operationId: string, postId: string): Promise<void> => {
  await axiosInstance.delete(`/operations/${operationId}/posts/${postId}`);
};