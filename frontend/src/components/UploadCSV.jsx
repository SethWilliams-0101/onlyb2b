import api from "../api/apiClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";import { useQueryClient } from "@tanstack/react-query";

export default function UploadCSV() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const { data } = await api.post("/users/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data?.reportId) {
                // go to the duplicate report page
                navigate(`/upload-report/${data.reportId}`);
            } else {
                alert("Upload complete!");
            }
            queryClient.invalidateQueries(["users"]); // refresh dashboard without reload
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => setFile(e.target.files[0])}
            />
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
            >
                {uploading ? "Uploading..." : "Upload CSV/XLSX"}
            </button>
        </div>
    );
}
