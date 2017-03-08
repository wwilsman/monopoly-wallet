import { createSelector } from 'reselect'

const getLoading = (state) => state.loading

const createIsLoading = (action) => createSelector(
  [getLoading],
  (loading) => loading.includes(action)
)

export const isWaitingToConnect = createIsLoading('CONNECT_GAME')
export const isWaitingToJoin = createIsLoading('JOIN_GAME')
export const isWaitingForAuction = createIsLoading('AUCTION_PROPERTY')
