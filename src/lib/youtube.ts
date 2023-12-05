import axios from "axios"
import { YoutubeTranscript } from "youtube-transcript"

import { strict_output } from "@/lib/gpt"

export async function searchYoutube(searchQuery: string) {
  // hello world => hello+world
  searchQuery = encodeURIComponent(searchQuery)
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
  )
  if (!data) {
    console.log("youtube fail")
    return null
  }
  if (data.items[0] == undefined) {
    console.log("youtube fail")
    return null
  }
  return data.items[0].id.videoId
}

export async function getTranscript(videoId: string) {
  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "zh",
      country: "TW",
    })
    let transcript = ""
    for (let t of transcript_arr) {
      transcript += t.text + " "
    }
    return transcript.replaceAll("\n", "")
  } catch (error) {
    return ""
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string
) {
  type Question = {
    question: string
    answer: string
    option1: string
    option2: string
    option3: string
  }
  const questions: Question[] = await strict_output(
    "你是一个能够生成mcq问题和答案的AI，每个答案的长度不应超过15个单词",
    new Array(5).fill(
      `您将生成一个关于 ${course_title} 的随机hard mcq 问题, 结合 ${transcript} 的上下文`
    ),
    {
      question: "提问",
      answer: "15字以内的答案",
      option1: "选项1，15字以内",
      option2: "选项2，15字以内",
      option3: "选项3，15字以内",
    }
  )
  return questions
}
