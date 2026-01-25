import { createContext, useContext, useState } from 'react';

const CourseContext = createContext();

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourse must be used within CourseProvider');
    }
    return context;
};

export const CourseProvider = ({ children }) => {
    const [courseContext, setCourseContext] = useState({
        courseId: null,
        courseName: null,
        moduleId: null,
        moduleName: null,
        pageContent: null
    });

    const updateCourseContext = (updates) => {
        setCourseContext(prev => ({
            ...prev,
            ...updates
        }));
    };

    const clearCourseContext = () => {
        setCourseContext({
            courseId: null,
            courseName: null,
            moduleId: null,
            moduleName: null,
            pageContent: null
        });
    };

    const value = {
        courseContext,
        updateCourseContext,
        clearCourseContext
    };

    return (
        <CourseContext.Provider value={value}>
            {children}
        </CourseContext.Provider>
    );
};
