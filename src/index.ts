import { Context, Schema, h, Logger } from 'koishi'
import fs from 'fs'
import path from 'path'

export const name = 'audio-sender'

export const usage = `通过语音发送文件名与消息内容相同的音频文件`

export interface Config {
  path: string
}

export const Config: Schema<Config> = Schema.object({
  path: Schema.path({
    allowCreate: true,
    filters: ["directory"]
    
  })
    .description('音频文件存放的文件夹路径')
    .required()
})

export function apply(ctx: Context, config: Config) {
  ctx.middleware(async (session, next) => {
    let flag = true
    fs.readdir(config.path, async (err, files) => {
      let logger = new Logger('audio-sender')
      if (err) logger.warn("文件夹读取失败：" + err.stack)
      for (let file of files) {
        if (file.slice(0, file.lastIndexOf('.')) === session.content) {
          let fullPath = path.join(config.path, file)
          try {
            await session.send(h.audio(`file:///${fullPath}`))
            flag = false
            break
          } catch (e) {
            logger.warn("发送失败：" + e.stack)
          }
        }
      }
    })
    if (flag) return next()
  })
}
