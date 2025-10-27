import apiClient from './Api';

export const violationReportAPI = {
  // Submit violation report
  submitReport: async (data) => {
    const res = await apiClient.post('/report-violations', data);
    return res.data;
  },

  // Get user's violation reports
  getReports: async (page = 1, perPage = 10) => {
    const res = await apiClient.get(`/report-violations?page=${page}&per_page=${perPage}`);
    return res.data;
  },
};

export default violationReportAPI;