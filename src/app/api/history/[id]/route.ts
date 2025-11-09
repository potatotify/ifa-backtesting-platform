import {NextResponse} from "next/server";
import {connectToDatabase} from "@/lib/mongodb";
import {ObjectId} from "mongodb";

export async function GET(_req: Request, {params}: {params: {id: string}}) {
  try {
    const {id} = params;
    const {db} = await connectToDatabase();
    const backtest = await db
      .collection("backtests")
      .findOne({_id: new ObjectId(id)});

    if (!backtest) {
      return NextResponse.json({error: "Backtest not found"}, {status: 404});
    }

    return NextResponse.json(backtest);
  } catch (error) {
    console.error("Failed to fetch backtest:", error);
    return NextResponse.json(
      {error: "Failed to fetch backtest"},
      {status: 500}
    );
  }
}
