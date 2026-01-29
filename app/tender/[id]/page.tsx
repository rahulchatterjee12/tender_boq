"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

/* ---------------- Types ---------------- */

type TenderDetails = {
  id: string;
  title: string;
  organisation: string;
  description: string;
  value_in_rs: string;
  state: string;
  location: string;
  bid_submission_end_date: string;
  period_of_work_in_days: number;
  tender_inviting_authority_name: string;
};

type BOQItem = {
  file_name?: string;
  category?: string;
  name?: string;
  type?: string;
  quantity?: number | null;
  unit?: string;
  brands?: string[];
};

/* ---------------- Page ---------------- */

export default function TenderDetailsPage() {
  const { id } = useParams();
  const tenderId = id as string;

  const [details, setDetails] = useState<TenderDetails | null>(null);
  const [boq, setBoq] = useState<BOQItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingBoq, setLoadingBoq] = useState(true);

  /* ---------------- Filters ---------------- */

  const [selectedFile, setSelectedFile] = useState("ALL");
  const [itemSearch, setItemSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(false);

  /* ---------------- Fetch Tender Details ---------------- */

  useEffect(() => {
    if (!tenderId) return;

    const id = encodeURIComponent(decodeURIComponent(tenderId));

    fetch(`https://staging.runway.org.in/api/tender/active/${id}`)
      .then((r) => r.json())
      .then(setDetails)
      .finally(() => setLoadingDetails(false));
  }, [tenderId]);

  useEffect(() => {
    if (!tenderId) return;

    const id = encodeURIComponent(decodeURIComponent(tenderId));

    fetch(`https://staging.runway.org.in/api/tender/active/${id}/boq`, {
      headers: {
        Authorization: "Token 755897170ac7977fb484697219827657e5b4ae14",
      },
    })
      .then((r) => r.json())
      .then((d) => setBoq(d.items || []))
      .finally(() => setLoadingBoq(false));
  }, [tenderId]);

  /* ---------------- Derived Data ---------------- */

  const normalizedBoq = useMemo(
    () =>
      boq.map((b) => ({
        ...b,
        file_name: b.file_name || "Unknown",
        name: b.name || "",
        type: b.type || "",
        category: b.category || "",
        unit: b.unit || "",
        brands: b.brands || [],
      })),
    [boq],
  );

  const fileNames = useMemo(
    () => Array.from(new Set(normalizedBoq.map((b) => b.file_name))),
    [normalizedBoq],
  );

  const filteredBoq = useMemo(() => {
    return normalizedBoq.filter((item) => {
      // FILE filter
      if (selectedFile !== "ALL" && item.file_name !== selectedFile)
        return false;

      // ITEM search
      if (
        itemSearch &&
        !item.name.toLowerCase().includes(itemSearch.toLowerCase())
      )
        return false;

      // TYPE search
      if (
        typeSearch &&
        !item.type.toLowerCase().includes(typeSearch.toLowerCase())
      )
        return false;

      // COMPLETE filter
      if (onlyComplete) {
        if (
          !item.name ||
          !item.category ||
          !item.type ||
          item.quantity == null ||
          !item.unit
        )
          return false;
      }

      return true; // DEFAULT → SHOW
    });
  }, [normalizedBoq, selectedFile, itemSearch, typeSearch, onlyComplete]);

  /* ---------------- Render ---------------- */

  return (
    <main className="max-w-6xl mx-auto px-6 py-6">
      {loadingDetails ? (
        <p className="text-gray-500">Loading tender…</p>
      ) : (
        details && (
          <section className="bg-white border rounded-xl p-6 mb-10">
            <h1 className="text-2xl font-bold">{details.title}</h1>
            <p className="text-gray-500">{details.organisation}</p>
            {details.bid_submission_end_date < new Date().toISOString() ? (
              <a
                href={`https://runway.org.in/tenders/view/all/${details.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                View on Runway
              </a>
            ) : (
              <a
                href={`https://runway.org.in/tenders/view/active/${details.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                View on Runway
              </a>
            )}
          </section>
        )
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">
          BOQ Extracted Items ({filteredBoq.length})
        </h2>

        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="ALL">All Files</option>
            {fileNames.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <input
            placeholder="Search item"
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <input
            placeholder="Search type"
            value={typeSearch}
            onChange={(e) => setTypeSearch(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyComplete}
              onChange={(e) => setOnlyComplete(e.target.checked)}
            />
            Only complete items
          </label>
        </div>

        {/* Table */}
        {loadingBoq ? (
          <p>Loading BOQ…</p>
        ) : (
          <div className="overflow-x-auto border rounded-xl bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">File</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBoq.map((i, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-medium">{i.name}</td>
                    <td className="px-4 py-2">{i.file_name}</td>
                    <td className="px-4 py-2">{i.type || "-"}</td>
                    <td className="px-4 py-2">{i.quantity ?? "-"}</td>
                    <td className="px-4 py-2">{i.unit || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
