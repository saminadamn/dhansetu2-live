// import React, { useState, useEffect } from "react";
// import API from "../../services/axiosInstance.js";

// export default function ChannelPartnerDashboard() {
//   const [file, setFile] = useState(null);
//   const [profiles, setProfiles] = useState([]);

//   const fetchData = async () => {
//     const res = await API.get("/channel/financial-data");
//     setProfiles(res.data.data);
//   };

// const handleUpload = async () => {
//   if (!file) {
//     alert("Please choose a CSV file first");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("file", file); // MUST match multer.single("file")

//   try {
//     const res = await API.post("/channel/upload-csv", formData, {
//       headers: { "Content-Type": "multipart/form-data" }
//     });

//     console.log("Upload Response:", res.data);
//     alert("File uploaded successfully");
//   } catch (error) {
//     console.error(error);
//     alert("File upload failed");
//   }
// };


//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       <h2 className="text-xl font-semibold">Channel Partner Dashboard</h2>

//       <div className="border p-4 rounded bg-white">
//         <label className="block font-medium mb-2">Upload CSV / Excel File</label>
//         <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//         <button 
//           className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
//           onClick={handleUpload}
//         >
//           Upload
//         </button>
//       </div>

//       <h3 className="text-lg font-bold mt-6">Uploaded Data</h3>

//       <table className="w-full text-left border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2">Aadhaar</th>
//             <th className="p-2">Past Loans</th>
//             <th className="p-2">Defaults</th>
//             <th className="p-2">Active Loans</th>
//           </tr>
//         </thead>

//         <tbody>
//           {profiles.map((p) => (
//             <tr key={p._id} className="border-b">
//               <td className="p-2 font-mono">**** **** {p.aadhaarLast4}</td>
//               <td className="p-2">{p.num_past_loans}</td>
//               <td className="p-2">{p.past_defaults}</td>
//               <td className="p-2">{p.active_loans_count}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }




import React, { useState, useEffect, useRef } from "react";
import API from "../../services/axiosInstance.js";

export default function ChannelPartnerDashboard() {
  const [file, setFile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await API.get("/channel/financial-data");
      setProfiles(res.data.data);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a CSV file first");
      fileInputRef.current.click(); // Open file dialog automatically
      return;
    }

   const formData = new FormData();
formData.append("file", file); // MUST match multer.single("file")
  // key must match upload.single("file")

    try {
      const res = await API.post("/channel/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Uploaded Successfully");
      console.log("Upload Response:", res.data);

      setFile(null);
      fileInputRef.current.value = ""; // Reset input
      fetchData();  // Refresh table to show updated data

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-govBlue">Channel Partner Dashboard</h2>

      <div className="card p-4">
        <label className="block font-medium mb-2">Upload CSV / Excel File</label>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: "block" }}
          onChange={(e) => {
            console.log("Selected:", e.target.files[0]);
            setFile(e.target.files[0]);
          }}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>

      <h3 className="text-lg font-bold mt-6">Uploaded Financial Data</h3>

      <table className="w-full text-left border border-slate-200 dark:border-slate-800">
        <thead>
          <tr className="bg-gray-200 dark:bg-slate-800">
            <th className="p-2">Aadhaar</th>
            <th className="p-2">Past Loans</th>
            <th className="p-2">Defaults</th>
            <th className="p-2">Active Loans</th>
          </tr>
        </thead>

        <tbody>
          {profiles.map((p) => (
            <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="p-2 font-mono">**** **** {p.aadhaarLast4}</td>
              <td className="p-2">{p.num_past_loans}</td>
              <td className="p-2">{p.past_defaults}</td>
              <td className="p-2">{p.active_loans_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
