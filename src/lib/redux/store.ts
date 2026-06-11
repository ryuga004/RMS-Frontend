import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// Load state from localStorage
const loadState = () => {
    if (typeof window === "undefined") return undefined;
    try {
        const serializedState = localStorage.getItem("authState");
        if (serializedState === null) {
            return undefined;
        }
        const authState = JSON.parse(serializedState);
        return { auth: { ...authState, isLoading: false, error: null } };
    } catch {
        return undefined;
    }
};

const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    preloadedState,
});

// Save state to localStorage on every change
if (typeof window !== "undefined") {
    store.subscribe(() => {
        try {
            const state = store.getState();
            const serializedState = JSON.stringify(state.auth);
            localStorage.setItem("authState", serializedState);
        } catch {
            // Ignore write errors
        }
    });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
