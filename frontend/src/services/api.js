// frontend/src/services/api.js

import axios from 'axios';
//Axios is like a messenger between your frontend and backend. 
// It helps send requests (like GET, POST) to your backend API and brings back responses.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// export const projectService = {
//   createProject: (data) => api.post('/api/projects', data),
//   getClientProjects: () => api.get('/api/projects')
// // };
// Instead of this you can write the 2nd one 
// const { data } = await api.get('/api/projects');
// const { data } = await projectService.getClientProjects();
// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error.response?.data?.error || 'Something went wrong');
  }
);


