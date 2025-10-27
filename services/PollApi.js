import apiClient from './Api';

export const pollAPI = {
  // Check if user can participate
  canParticipate: async () => {
    const res = await apiClient.get('/poll/can-participate');
    return res.data;
  },

  // Submit poll
  submitPoll: async (data) => {
    const res = await apiClient.post('/poll', data);
    return res.data;
  },

  // Get user's poll
  getMyPoll: async () => {
    const res = await apiClient.get('/poll/my-poll');
    return res.data;
  },

  // Get poll statistics (admin)
  getStatistics: async () => {
    const res = await apiClient.get('/poll/statistics');
    return res.data;
  },
};

export default pollAPI;
