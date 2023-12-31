"use client"

import axios from "axios"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"
import { createChaptersSchema } from "@/validators/course"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type Props = {}

type Input = z.infer<typeof createChaptersSchema>

const CreateCourseForm = (props: Props) => {
  const router = useRouter()
  const { toast } = useToast()
  const { mutate: createChapters, isPending } = useMutation({
    mutationFn: async ({ title, units }: Input) => {
      const response = await axios.post("/api/course/createChapters", {
        title,
        units,
      })
      return response.data
    },
  })

  const form = useForm<Input>({
    resolver: zodResolver(createChaptersSchema),
    defaultValues: {
      title: "",
      units: ["", "", ""],
    },
  })

  const onSubmit = (data: Input) => {
    if (data.units.some((unit) => unit === "")) {
      toast({
        title: "提示",
        description: "请填写所有单元",
        variant: "destructive",
      })
      return
    }

    createChapters(data, {
      onSuccess: ({ course_id }) => {
        toast({
          title: "成功",
          description: "课程创建成功",
        })
        router.push(`/create/${course_id}`)
      },
      onError: (error) => {
        console.error(error)
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        })
      },
    })
  }

  form.watch()

  return (
    <div className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full mt-4'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start w-full sm:items-center sm:flex-row'>
                <FormLabel className='flex-[1] text-xl'>标题</FormLabel>
                <FormControl className='flex-[6]'>
                  <Input placeholder='输入课程主题' {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <AnimatePresence>
            {form.watch("units").map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  height: { duration: 0.2 },
                }}>
                <FormField
                  key={index}
                  control={form.control}
                  name={`units.${index}`}
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-start w-full sm:items-center sm:flex-row'>
                      <FormLabel className='flex-[1] text-lg'>
                        第{index + 1}单元
                      </FormLabel>
                      <FormControl className='flex-[6]'>
                        <Input placeholder='请输入单元主题' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <div className='flex items-center justify-center mt-4'>
            <Separator className='flex-[1]' />
            <div className='mx-4'>
              <Button
                type='button'
                variant='secondary'
                className='font-semibold'
                onClick={() => {
                  form.setValue("units", [...form.watch("units"), ""])
                }}>
                添加单元
                <Plus className='w-4 h-4 ml-2 text-green-500' />
              </Button>
              <Button
                type='button'
                variant='secondary'
                className='font-semibold ml-2'
                onClick={() => {
                  form.setValue("units", [...form.watch("units").slice(0, -1)])
                }}>
                减少单元
                <Minus className='w-4 h-4 ml-2 text-red-500' />
              </Button>
            </div>
            <Separator className='flex-[1]' />
          </div>
          <Button
            disabled={isPending}
            type='submit'
            className='w-full mt-6'
            size='lg'>
            开始生成
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default CreateCourseForm
