import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/students';

export const getAllStudents = () => axios.get(API_BASE_URL);

export const getStudentById = (id) => axios.get(`${API_BASE_URL}/${id}`);

export const addStudent = (student) => axios.post(API_BASE_URL, student);

export const updateStudent = (id, student) => axios.put(`${API_BASE_URL}/${id}`, student);

export const deleteStudent = (id) => axios.delete(`${API_BASE_URL}/${id}`);
