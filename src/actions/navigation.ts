export type Action = {
  type: 'NAVIGATE_TO',
  page: string
} | {
    type: 'NAVIGATE_TO_AND_RESET',
    page: string
  } | {
    type: 'NAVIGATE_BACK'
  }

export const navigateTo = (page: string): Action => ({
  type: 'NAVIGATE_TO',
  page: page
})

export const navigateToAndReset = (page: string): Action => ({
  type: 'NAVIGATE_TO_AND_RESET',
  page: page
})

export const navigateBack = (): Action => ({
  type: 'NAVIGATE_BACK'
})
