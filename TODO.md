# User Distribution Implementation Plan

## Backend Changes
- [x] Add `getUserDistribution` function in `dashboardController.js` to fetch user counts by role
- [x] Add route `router.get('/user-distribution', dashboardController.getUserDistribution);` in `dashboardRoutes.js`

## Frontend Changes
- [x] Add `getUserDistribution: () => api.get('/dashboard/user-distribution')` to `dashboardAPI` in `api.js`
- [x] Modify `UserDistribution.jsx` to fetch data from API using `useEffect`, remove `users` prop, and update state

## Testing
- [x] Test the new endpoint to ensure it returns correct data
- [x] Verify the component fetches and displays data properly without the `users` prop
