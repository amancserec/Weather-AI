import { NextRequest, NextResponse } from "next/server";
import { answerWeatherQuestion } from "@/lib/agent";

type RequestMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      question?: string;
      location?: string;
      memoryHint?: string;
      history?: RequestMessage[];
    };

    if (!body.question?.trim()) {
      return NextResponse.json(
        {
          error: "Please provide a question for the weather agent."
        },
        { status: 400 }
      );
    }

    const answer = await answerWeatherQuestion({
      question: body.question.trim(),
      location: body.location?.trim(),
      memoryHint: body.memoryHint?.trim(),
      history: Array.isArray(body.history) ? body.history : []
    });

    return NextResponse.json({
      answer
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The weather agent hit an unknown error.";

    return NextResponse.json(
      {
        error: message
      },
      { status: 500 }
    );
  }
}
