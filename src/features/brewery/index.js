import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from "axios";
import {message} from "antd";

class LoadingState {
    static IDLE = "idle";
    static LOADING = "loading";
    static SUCCEEDED = "succeeded";
    static FAILED = "failed";
}

export const fetchBreweries = createAsyncThunk('breweries/fetchBreweries',  (data) => {
    const {coordinates: [latitude, longitude], numResults} = data;
    // By not throwing a catch, you let the catch pass onto the rejected state and propagate rejection
    return axios.get(`https://api.openbrewerydb.org/breweries?by_dist=${latitude},${longitude}&per_page=${numResults}`)
        .then(res => res.data)
})

export const breweriesSlice = createSlice({
    name: 'breweries',
    initialState: {
        breweries: [],
        status: LoadingState.IDLE,
    },
    extraReducers(builder)  {
        builder
            .addCase(fetchBreweries.pending, (state, action) => {
                state.status = LoadingState.LOADING
            })
            .addCase(fetchBreweries.fulfilled, (state, action) => {
                state.status = LoadingState.SUCCEEDED
                state.breweries = [...action.payload]
            })
            .addCase(fetchBreweries.rejected, (state, action) => {
                state.status = LoadingState.FAILED
                state.error = action.error.message
            })
    }
})

export default breweriesSlice.reducer