import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8091/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getClauses = async () => {
  const response = await api.get("/clauses");
  return response.data;
};

export const getClause = async (id: string) => {
  const response = await api.get(`/clauses/${id}`);
  return response.data;
};

export const createClause = async (data: {
  title: string;
  content: string;
}) => {
  const response = await api.post("/clauses", data);
  return response.data;
};

export const updateClause = async (
  id: string,
  data: { title: string; content: string }
) => {
  const response = await api.put(`/clauses/${id}`, data);
  return response.data;
};

export const deleteClause = async (id: string) => {
  await api.delete(`/clauses/${id}`);
};

export const getContracts = async () => {
  const response = await api.get("/contracts");
  return response.data;
};

export const getContract = async (id: string) => {
  const response = await api.get(`/contracts/${id}`);
  return response.data;
};

export const createContract = async (data: {
  title: string;
  content: string;
  fields?: { [k: string]: string };
  templateId?: string;
  metadata?: { createdBy?: string };
}) => {
  const response = await api.post("/contracts", data);
  return response.data;
};

export const updateContract = async (
  id: string,
  data: {
    [x: string]: string | Record<string, string>;
    title: string;
    content: string;
  }
) => {
  const response = await api.put(`/contracts/${id}`, data);
  return response.data;
};

export const deleteContract = async (id: string) => {
  await api.delete(`/contracts/${id}`);
};

// Template API calls
export const getTemplates = async () => {
  const response = await api.get("/templates");
  return response.data;
};

export const getTemplate = async (id: string) => {
  const response = await api.get(`/templates/${id}`);
  return response.data;
};

export const createTemplate = async (data: {
  [x: string]: string | Record<string, string>;
  title: string;
  content: string;
}) => {
  const response = await api.post("/templates", data);
  return response.data;
};

export const updateTemplate = async (
  id: string,
  data: {
    [x: string]: string | Record<string, string>;
    title: string;
    content: string;
  }
) => {
  const response = await api.put(`/templates/${id}`, data);
  return response.data;
};

export const deleteTemplate = async (id: string) => {
  await api.delete(`/templates/${id}`);
};
