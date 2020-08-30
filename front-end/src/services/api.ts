import { get } from './http';

export async function getVoteList(params) {
  return get('/votes', params);
}

export async function getVoteDetail(voteId) {
  return get(`/votes/${voteId}`);
}
