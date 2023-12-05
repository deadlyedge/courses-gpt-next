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
      "你是一个人工智能，能够策划课程内容，提出一些相关的 chapter titles，并为每个 chapter 找到相关的 YouTube 视频",
      new Array(units.length).fill(
        `你的工作就是创建一门关于 ${title} 的课程. 用户已经请求为每个 Unit 创建 Chapters。请为 each chapter 提供详细的 YouTube search query，未来可用于查找每一章的教育视频资源。 每个查询都应该在 youtube 上找到一个教育信息课程。`
      ),
      {
        title: "Unit 标题",
        chapters:
          "一个 Chapters 数组，每个 Chapter 在 JSON 对象中应该有一个 youtube_search_query 和一个 chapter_title 键",
      }
    )
    const imageSearchTerm = await strict_output(
      "你是一个能够找到与课程最相关的图像的AI",
      `请为课程标题 ${title} 提供一个好的图像搜索词. 该搜索词将被输入到 unsplash API 中，因此请确保它是一个能够返回良好结果的搜索词`,
      {
        image_search_term: "一个很好的课程标题搜索词",
      }
    )

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
