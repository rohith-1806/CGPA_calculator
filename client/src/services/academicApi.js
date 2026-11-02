import api from './api';

export const getAcademicRecord = async () => {
  const response = await api.get('/academic');
  return response.data;
};

export const getStudentMe = async () => {
  const response = await api.get('/students/me');
  return response.data;
};

export const updateStudentAcademicRecords = async (academicRecords) => {
  const response = await api.put('/students/me/academic-records', { academicRecords });
  return response.data;
};

export const addSemester = async (semesterName) => {
  const response = await api.post('/academic/semesters', { semesterName });
  return response.data;
};

export const deleteSemester = async (semesterId) => {
  const response = await api.delete(`/academic/semesters/${semesterId}`);
  return response.data;
};

export const addSubject = async (semesterId, subjectData) => {
  const response = await api.post(`/academic/semesters/${semesterId}/subjects`, subjectData);
  return response.data;
};

export const updateSubject = async (subjectId, subjectData) => {
  const response = await api.put(`/academic/subjects/${subjectId}`, subjectData);
  return response.data;
};

export const deleteSubject = async (subjectId) => {
  const response = await api.delete(`/academic/subjects/${subjectId}`);
  return response.data;
};
