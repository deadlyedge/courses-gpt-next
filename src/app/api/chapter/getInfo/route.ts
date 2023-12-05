// /api/chapter/getInto

import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { strict_output } from "@/lib/gpt"
import {
  getQuestionsFromTranscript,
  getTranscript,
  searchYoutube,
} from "@/lib/youtube"

const bodyParser = z.object({
  chapterId: z.string(),
})

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json()
    const { chapterId } = bodyParser.parse(body)
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    })
    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapter not found",
        },
        { status: 404 }
      )
    }
    const videoId = await searchYoutube(chapter.youtubeSearchQuery)
    let transcript = await getTranscript(videoId)
    let maxLength = 400
    transcript = transcript.split("").slice(0, maxLength).join()

    const { summary }: { summary: string } = await strict_output(
      "你是一个能够总结 YouTube 文字记录的AI",
      "总结在200字以内，不要谈论赞助商或任何与主题无关的内容，也不要介绍总结的内容。\n" +
        transcript,
      { summary: "总结摘要" }
    )

    const questions = await getQuestionsFromTranscript(transcript, chapter.name)

    await prisma.question.createMany({
      data: questions.map((question) => {
        let options = [
          question.answer,
          question.option1,
          question.option2,
          question.option3,
        ]
        options = options.sort(() => Math.random() - 0.5)
        return {
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          chapterId: chapterId,
        }
      }),
    })

    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoId: videoId,
        summary: summary,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid body",
        },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "unknown",
        },
        { status: 500 }
      )
    }
  }
}
