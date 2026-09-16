import { Outlet } from 'react-router-dom';

const ActivityLayout = () => {
    return (
        <div className="flex h-screen w-full">
            <Outlet />
        </div>
    );
}

export default ActivityLayout