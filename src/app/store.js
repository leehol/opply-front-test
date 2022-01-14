import { configureStore } from '@reduxjs/toolkit'
import breweriesSlice from "../features/brewery"

export default configureStore({
    reducer: {
        breweries: breweriesSlice
    }
})