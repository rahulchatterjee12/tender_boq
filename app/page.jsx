import Link from "next/link";
import clientPromise from "@/lib/mongodb";

async function getTenders() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB);

    const tenders = await db
      .collection(process.env.MONGO_COLLECTION)
      .find({})
      .project({
        _id: 1,
        tender_id: 1,
        title: 1,
      })
      .limit(50)
      .toArray();

    return tenders.map((t) => ({ ...t, _id: t._id.toString() }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function HomePage() {
  const tenders = await getTenders();

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      {/* --- Header --- */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Available Tenders
        </h1>
        <p className="text-gray-500 text-base">
          Browse the latest tenders extracted from the system.
        </p>
      </div>

      {/* --- Tender Cards --- */}
      <section className="max-w-6xl mx-auto">
        {tenders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tenders.map((tender) => (
              <Link
                key={tender._id}
                href={`/tender/${tender.tender_id}`}
                className="group block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 p-6"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                      {tender.title || "Untitled Tender"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tender ID:{" "}
                      <span className="font-mono text-gray-700">
                        {tender.tender_id}
                      </span>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-lg">No tenders found.</p>
          </div>
        )}
      </section>
    </main>
  );
}
