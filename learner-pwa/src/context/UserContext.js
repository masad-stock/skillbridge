import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { authAPI, learningAPI } from '../services/api';

const UserContext = createContext();

const initialState = {
    user: null,
    skillsProfile: null,
    learningPath: [],
    progress: {},
    assessmentResults: null,
    isAuthenticated: false,
    loading: true
};

function userReducer(state, action) {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, isAuthenticated: true, loading: false };
        case 'SET_SKILLS_PROFILE':
            // Persist skills profile to localStorage
            if (action.payload) {
                localStorage.setItem('skillsProfile', JSON.stringify(action.payload));
            }
            return { ...state, skillsProfile: action.payload };
        case 'SET_LEARNING_PATH':
            // Persist learning path to localStorage
            if (action.payload) {
                localStorage.setItem('learningPath', JSON.stringify(action.payload));
            }
            return { ...state, learningPath: action.payload };
        case 'UPDATE_PROGRESS':
            const updatedProgress = { ...(state.progress || {}), [action.moduleId]: action.progress };
            // Persist progress to localStorage
            localStorage.setItem('learningProgress', JSON.stringify(updatedProgress));
            return {
                ...state,
                progress: updatedProgress
            };
        case 'SET_PROGRESS':
            // Persist progress to localStorage
            if (action.payload) {
                localStorage.setItem('learningProgress', JSON.stringify(action.payload));
            }
            return { ...state, progress: action.payload || {} };
        case 'SET_ASSESSMENT_RESULTS':
            // Persist assessment results to localStorage
            if (action.payload) {
                localStorage.setItem('assessmentResults', JSON.stringify(action.payload));
            }
            return { ...state, assessmentResults: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'LOGOUT':
            // Clear localStorage on logout
            localStorage.removeItem('skillsProfile');
            localStorage.removeItem('learningPath');
            localStorage.removeItem('learningProgress');
            localStorage.removeItem('assessmentResults');
            return { ...initialState, loading: false };
        default:
            return state;
    }
}

export function UserProvider({ children }) {
    const [state, dispatch] = useReducer(userReducer, initialState);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load user data on app start
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('authToken');

            // Load cached data from localStorage first (for immediate display)
            const cachedSkillsProfile = localStorage.getItem('skillsProfile');
            const cachedLearningPath = localStorage.getItem('learningPath');
            const cachedProgress = localStorage.getItem('learningProgress');
            const cachedAssessmentResults = localStorage.getItem('assessmentResults');

            if (cachedSkillsProfile) {
                dispatch({ type: 'SET_SKILLS_PROFILE', payload: JSON.parse(cachedSkillsProfile) });
            }
            if (cachedLearningPath) {
                dispatch({ type: 'SET_LEARNING_PATH', payload: JSON.parse(cachedLearningPath) });
            }
            if (cachedProgress) {
                dispatch({ type: 'SET_PROGRESS', payload: JSON.parse(cachedProgress) });
            }
            if (cachedAssessmentResults) {
                dispatch({ type: 'SET_ASSESSMENT_RESULTS', payload: JSON.parse(cachedAssessmentResults) });
            }

            if (!token) {
                dispatch({ type: 'SET_LOADING', payload: false });
                return;
            }

            // If offline, try to load from localStorage cache
            if (!isOnline) {
                const cachedUser = localStorage.getItem('cachedUser');
                if (cachedUser) {
                    const userData = JSON.parse(cachedUser);
                    dispatch({ type: 'SET_USER', payload: userData });
                    if (userData.skillsProfile && !cachedSkillsProfile) {
                        dispatch({ type: 'SET_SKILLS_PROFILE', payload: userData.skillsProfile });
                    }
                }
                dispatch({ type: 'SET_LOADING', payload: false });
                return;
            }

            // If online, fetch from backend
            try {
                const response = await authAPI.getMe();
                const userData = response.data.data;

                dispatch({ type: 'SET_USER', payload: userData });
                dispatch({ type: 'SET_SKILLS_PROFILE', payload: userData.skillsProfile });

                // Cache user data for offline use
                localStorage.setItem('cachedUser', JSON.stringify(userData));

                // Load learning path and progress
                const [pathResponse, progressResponse] = await Promise.all([
                    learningAPI.getPersonalizedPath(),
                    learningAPI.getMyProgress()
                ]);

                dispatch({ type: 'SET_LEARNING_PATH', payload: pathResponse.data.data });

                // Convert progress array to object
                const progressObj = {};
                progressResponse.data.data.forEach(p => {
                    progressObj[p.module._id] = p;
                });
                dispatch({ type: 'SET_PROGRESS', payload: progressObj });

            } catch (error) {
                console.error('Failed to load user:', error);
                // Token might be invalid - but keep cached data if available
                if (!cachedSkillsProfile && !cachedLearningPath) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('cachedUser');
                }
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        loadUser();
    }, [isOnline]);

    // Actions
    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('cachedUser', JSON.stringify(user));

            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_SKILLS_PROFILE', payload: user.skillsProfile });

            return { success: true, user };
        } catch (error) {
            // Detailed error handling for better user experience
            let message = 'Login failed';
            
            if (error.isNetworkError) {
                message = 'Unable to connect to server. Please check your internet connection.';
            } else if (error.message?.includes('timeout')) {
                message = 'Request timed out. Please try again with a better connection.';
            } else if (error.response?.status === 401) {
                message = 'Invalid email or password. Please try again.';
            } else if (error.response?.status === 429) {
                message = 'Too many login attempts. Please wait a few minutes and try again.';
            } else if (error.response?.status >= 500) {
                message = 'Server error. Please try again in a few moments.';
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            
            console.error('[Login Error]', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                isNetworkError: error.isNetworkError
            });
            
            return {
                success: false,
                message,
                error
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('cachedUser', JSON.stringify(user));

            dispatch({ type: 'SET_USER', payload: user });

            return { success: true, user };
        } catch (error) {
            // Detailed error handling for better user experience
            let message = 'Registration failed';
            
            if (error.isNetworkError) {
                message = 'Unable to connect to server. Please check your internet connection.';
            } else if (error.message?.includes('timeout')) {
                message = 'Request timed out. Please try again with a better connection.';
            } else if (error.response?.status === 400) {
                // Validation errors
                if (error.response.data?.details && Array.isArray(error.response.data.details)) {
                    const validationErrors = error.response.data.details
                        .map(d => d.message)
                        .join(', ');
                    message = `Validation error: ${validationErrors}`;
                } else {
                    message = error.response.data?.message || 'Invalid registration data. Please check your information.';
                }
            } else if (error.response?.status === 429) {
                message = 'Too many registration attempts. Please wait a few minutes and try again.';
            } else if (error.response?.status >= 500) {
                message = 'Server error. Please try again in a few moments.';
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            
            console.error('[Registration Error]', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                isNetworkError: error.isNetworkError
            });
            
            return {
                success: false,
                message,
                error
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('cachedUser');
        dispatch({ type: 'LOGOUT' });
    };

    const updateProgress = async (moduleId, progressData) => {
        try {
            // Optimistic update
            dispatch({
                type: 'UPDATE_PROGRESS',
                moduleId,
                progress: progressData
            });

            // Sync with backend if online
            if (isOnline) {
                await learningAPI.updateProgress(moduleId, progressData);
            } else {
                // Queue for later sync
                const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
                queue.push({ type: 'progress', moduleId, data: progressData });
                localStorage.setItem('syncQueue', JSON.stringify(queue));
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    const refreshLearningPath = async () => {
        if (!isOnline) return;

        try {
            const response = await learningAPI.getPersonalizedPath();
            dispatch({ type: 'SET_LEARNING_PATH', payload: response.data.data });
        } catch (error) {
            console.error('Failed to refresh learning path:', error);
        }
    };

    const value = {
        ...state,
        dispatch,
        login,
        register,
        logout,
        updateProgress,
        refreshLearningPath,
        isOnline
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