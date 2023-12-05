import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { createChaptersSchema } from "@/validators/course"
import { strict_output } from "@/lib/gpt"
import { getUnsplashImage } from "@/lib/unsplash"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

type chapterProp = {
  youtube_search_query: string
  chapter_title: string
}

type outputUnits = {
  title: string
  chapters: chapterProp[]
}[]

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return new NextResponse("unauthorised", { status: 401 })
    }

    const body = await req.json()
    const { title, units } = createChaptersSchema.parse(body)

    let output_units: outputUnits = await strict_output(
      "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter",
      new Array(units.length).fill(
        `It is your job to create a course about ${title}. The user has requested to create chapters for each of the units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educationalvideo for each chapter. Each query should give an educational informative course in youtube.`
      ),
      {
        title: "Unit 标题",
        chapters:
          "an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
      }
    )
    console.log("[output units:]", output_units)
    const imageSearchTerm = await strict_output(
      "你是一个能够找到与课程最相关的图像的AI",
      `请为课程标题 ${title} 提供一个好的图像搜索词. 该搜索词将被输入到 unsplash API 中，因此请确保它是一个能够返回良好结果的搜索词`,
      {
        image_search_term: "与课程标题非常相关的搜索词",
      }
    )
    console.log("[image search term:]", imageSearchTerm)

    // console.log(output_units)
    // return NextResponse.json({ output_units, imageSearchTerm })

    // const course_image = await getUnsplashImage(
    //   imageSearchTerm.image_search_term.replaceAll("\n", "").trim()
    // )
    const course = await prisma.course.create({
      data: {
        name: title,
        // xdream 由于api接口问题，暂停使用unsplash，直接传入搜索关键词，未来再做处理
        image: imageSearchTerm.image_search_term.replaceAll("\n", "").trim(),
      },
    })

    for (const unit of output_units) {
      const title = unit.title
      const prismaUnit = await prisma.unit.create({
        data: {
          name: title,
          courseId: course.id,
        },
      })
      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter: chapterProp) => {
          return {
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          }
        }),
      })
    }
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({ course_id: course.id })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json("invalid body", { status: 400 })
    }
    console.error(error)
  }
}
