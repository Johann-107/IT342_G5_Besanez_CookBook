import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuth2Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);

            const token = params.get("token");
            const userId = params.get("userId");
            const email = params.get("email");
            const firstName = params.get("firstName");
            const lastName = params.get("lastName");

            if (token) {
                // First run — save and redirect
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify({
                    userId,
                    email,
                    firstName,
                    lastName
                }));
                navigate("/dashboard", { replace: true });
            } else {
                // Check if token was already saved by the first run
                const savedToken = localStorage.getItem("token");
                if (savedToken) {
                    // First run already handled it, just go to dashboard
                    navigate("/dashboard", { replace: true });
                } else {
                    navigate("/?error=true", { replace: true });
                }
            }
        } catch (err) {
            console.error("OAuth2Callback error:", err);
            navigate("/?error=true", { replace: true });
        }
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <p>Signing you in with Google...</p>
        </div>
    );
};

export default OAuth2Callback;