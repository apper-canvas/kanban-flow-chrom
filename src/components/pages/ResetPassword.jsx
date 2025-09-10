import { useEffect } from 'react';

const ResetPassword = () => {
    useEffect(() => {
        const { ApperUI } = window.ApperSDK;
        ApperUI.showResetPassword('#authentication-reset-password');
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div id="authentication-reset-password" className="bg-white mx-auto w-[400px] max-w-full p-10 rounded-2xl shadow-lg"></div>
        </div>
    );
};

export default ResetPassword;