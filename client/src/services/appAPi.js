import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// define a service using baseurl

const appApi = createApi({
    reducerPath: 'appApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5001'
    }),

    endpoints: (builder) => ({
        // creating the user signup
        signUpUser: builder.mutation({
            query: (user) => ({
                url: '/users',
                method: 'POST',
                body: user,
            }),
        }),

        loginUser: builder.mutation({
            query: (user) => ({
                url: '/users/login',
                method: 'POST',
                body: user,
            }),
        }),

        // logout user
        logoutUser: builder.mutation({
            query: (payload) => ({
                url: '/logout',
                method: 'DELETE',
                body: payload,
            }),
        }),
    })
})

export const {
    useSignUpUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation
} = appApi;

export default appApi;