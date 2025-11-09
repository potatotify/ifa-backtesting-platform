import {NextResponse} from "next/server";
import {connectToDatabase} from "@/lib/mongodb";

export async function GET() {
  try {
    const {db} = await connectToDatabase();
    const backtests = await db
      .collection("backtests")
      .find({})
      .sort({createdAt: -1})
      .limit(50)
      .toArray();

    const results = backtests.map((bt) => ({
      id: bt._id.toString(),
      date: bt.createdAt,
      parameters: bt.parameters,
      totalTrades: bt.results.metrics.total_trades,
      totalPnl: bt.results.metrics.total_pnl,
      winRate: bt.results.metrics.win_rate
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to fetch backtests:", error);
    return NextResponse.json(
      {error: "Failed to fetch backtests"},
      {status: 500}
    );
  }
}
