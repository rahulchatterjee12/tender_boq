import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Link from "next/link";

// --- Fetch Tender Details ---
async function getTenderDetails(tenderId) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection(process.env.MONGO_COLLECTION);

    let query;
    if (ObjectId.isValid(tenderId)) {
      query = {
        $or: [{ tender_id: tenderId }, { _id: new ObjectId(tenderId) }],
      };
    } else {
      query = { tender_id: tenderId };
    }

    const tender = await collection.findOne(query);
    return tender ? JSON.parse(JSON.stringify(tender)) : null;
  } catch (error) {
    console.error("❌ Error fetching tender:", error);
    return null;
  }
}

// --- Items Table Component ---
function ItemsTable({ items }) {
  if (!items?.length)
    return <p className="text-gray-500 italic">No items extracted.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 border-b">
          <tr>
            {["Item", "Category", "Quantity", "Unit", "Description"].map(
              (header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-3 font-medium text-gray-900">
                {item.Item || "—"}
              </td>
              <td className="px-6 py-3">{item.Category || "—"}</td>
              <td className="px-6 py-3">{item.Quantity || "—"}</td>
              <td className="px-6 py-3">{item.Unit || "—"}</td>
              <td className="px-6 py-3 text-gray-600">{item.Desc || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Tender Details Page ---
export default async function TenderDetailPage({ params }) {
  const resolvedParams = await params;
  const tenderId = decodeURIComponent(resolvedParams.tenderId);
  if (!tenderId)
    return (
      <div className="p-8 bg-white rounded-xl border border-red-200 shadow-sm">
        <h2 className="text-2xl font-bold text-red-700">Invalid Request</h2>
        <p className="text-gray-600 mt-1">No tender ID provided.</p>
      </div>
    );

  const tender = await getTenderDetails(tenderId);

  if (!tender)
    return (
      <div className="p-8 bg-white rounded-xl border border-red-200 shadow-sm">
        <h2 className="text-2xl font-bold text-red-700">Tender not found</h2>
        <p className="text-gray-600 mt-1">
          Could not find a tender with ID: <b>{tenderId}</b>
        </p>
      </div>
    );

  return (
    <main className="max-w-full mx-auto py-10 px-6 bg-gray-50 min-h-screen">
      {/* --- Header --- */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Tender Details
        </h1>
        <p className="text-gray-500">Detailed breakdown of extracted data</p>
        <Link
          href={`https://runway.org.in/tenders/view/active/${tenderId}`}
          target="_blank"
        >
          {" "}
          Open in new tab
        </Link>
      </div>

      {/* --- Card: Tender Summary --- */}
      <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {tender.title || "Untitled Tender"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Tender ID
            </label>
            <p className="text-lg text-gray-900 font-semibold mt-1">
              {tender.tender_id}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Organisation
            </label>
            <p className="text-lg text-gray-900 font-semibold mt-1">
              {tender.organisation || "—"}
            </p>
          </div>
        </div>

        {tender.generated_query && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">
              Generated Query
            </label>
            <pre className="bg-gray-100 text-gray-800 text-sm p-4 rounded-lg mt-2 font-mono overflow-x-auto border border-gray-200">
              {tender.generated_query}
            </pre>
          </div>
        )}
      </section>

      {/* --- Card: Document Extractions --- */}
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Per-Document Extractions
        </h3>

        {tender.per_document_extractions?.length ? (
          <div className="space-y-8">
            {tender.per_document_extractions.map((doc, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Document:
                    <span className="ml-2 font-mono text-blue-600">
                      {doc.document_id}
                    </span>
                  </h4>
                  <span className="text-sm text-gray-400">
                    {doc.items?.length || 0} items
                  </span>
                </div>
                <div className="p-5">
                  <ItemsTable items={doc.items} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No per-document extractions available.
          </p>
        )}
      </section>
    </main>
  );
}
