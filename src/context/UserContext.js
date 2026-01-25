import React, { createContext, useContext, useReducer, useEffect } from 'react';

const UserContext = createContext();

const initialState = {
    user: null,
    skillsProfile: null,
    learningPath: [],
    progress: {},
    assessmentResults: null,
    isAuthenticated: false
};

function userReducer(state, action) {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, isAuthenticated: true };
        case 'SET_SKILLS_PROFILE':
            return { ...state, skillsProfile: action.payload };
        case 'SET_LEARNING_PATH':
            return { ...state, learningPath: action.payload };
        case 'UPDATE_PROGRESS':
            return {
                ...state,
                progress: { ...(state.progress || {}), [action.moduleId]: action.progress }
            };
        case 'SET_PROGRESS':
            return { ...state, progress: action.payload || {} };
        case 'SET_ASSESSMENT_RESULTS':
            return { ...state, assessmentResults: action.payload };
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}

export function UserProvider({ children }) {
    const [state, dispatch] = useReducer(userReducer, initialState);

    // Load user data from localStorage on app start
    useEffect(() => {
        const savedUser = localStorage.getItem('adaptiveLearningUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            dispatch({ type: 'SET_USER', payload: userData.user });
            if (userData.skillsProfile) {
                dispatch({ type: 'SET_SKILLS_PROFILE', payload: userData.skillsProfile });
            }
            if (userData.learningPath) {
                dispatch({ type: 'SET_LEARNING_PATH', payload: userData.learningPath });
            }
            if (userData.progress) {
                dispatch({ type: 'SET_PROGRESS', payload: userData.progress });
            }
        }
    }, []);

    // Save user data to localStorage whenever state changes
    useEffect(() => {
        if (state.isAuthenticated) {
            localStorage.setItem('adaptiveLearningUser', JSON.stringify(state));
        }
    }, [state]);

    const value = {
        ...state,
        dispatch
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}