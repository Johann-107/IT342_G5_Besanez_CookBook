import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1>Welcome to the Dashboard, {user?.firstName}!</h1>
            <p>This is a protected route. Only authenticated users can see this.</p>
        </div>
    );
}

export default Dashboard;