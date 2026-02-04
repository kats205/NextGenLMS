import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export function LecturerNav() {
    const navigate = useNavigate();

    return (
        <div className="mb-6">
            <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate("/lecturer/dashboard")}
            >
                Khóa học của tôi
            </Button>
        </div>
    );
}
