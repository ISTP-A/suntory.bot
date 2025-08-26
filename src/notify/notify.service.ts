import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { DiscordClient } from '../discord/discord.client'

@Injectable()
export class NotifyService {
    private readonly logger = new Logger(NotifyService.name)

    constructor(private readonly discord: DiscordClient) { }

    @Cron('0 0 * * * *', { timeZone: 'Asia/Seoul' })
    async sendBarrierNotification() {
        const channelId = process.env.DISCORD_CHANNEL_ID!
        const channel = this.discord.getTextChannel(channelId)

        if (!channel) {
            this.logger.warn(`Channel not found: ${channelId}`)
            return
        }

        try {
            const message = this.getMessageWithTimeLog(this.getRandomMessage())
            await channel.send(message)
            this.logger.log(`Sent Barrier Notification to ${channelId}`)
        } catch (err) {
            this.logger.error('Failed to send message', err as Error)
        }
    }

    @Cron('0 0 12,18,20,22 * * *', { timeZone: 'Asia/Seoul' })
    async sendFieldBosNotification() {
        const channelId = process.env.DISCORD_CHANNEL_ID!
        const channel = this.discord.getTextChannel(channelId)
        if (!channel) return this.logger.warn('채널 없음')

        const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        await channel.send(this.getMessageWithTimeLog(`⏰ ${now} 필드보스 알림! 준비하세요 ⚔️`))
        this.logger.log(`Sent Field Boss Notification to ${channelId}`)
    }

    // @Cron('0,10,20,40,50 * * * * *', { timeZone: 'Asia/Seoul' })
    // async sendEvery10Sec_Test() {
    //     const channelId = process.env.DISCORD_CHANNEL_ID!
    //     const channel = this.discord.getTextChannel(channelId)

    //     if (!channel) {
    //         this.logger.warn(`Channel not found: ${channelId}`)
    //         return
    //     }

    //     try {
    //         await channel.send(this.getMessageWithTimeLog('⚠️ 매 분 00초 알림 전송 테스트 중 ! ⚠️'))
    //         this.logger.log(`Sent Test Notification to ${channelId}`)
    //     } catch (err) {
    //         this.logger.error('Failed to send message', err as Error);
    //     }
    // }

    private getMessageWithTimeLog(message: string): string {
        const timeLog = new Date().toUTCString()
        return `[Server TimeLog:${timeLog}] ${message}`
    }

    private getRandomMessage(): string {
        const messages = [
            '⚠️ 결계 출현! 놓치면 1시간 기다려야 해요!',
        ]

        const randomIndex = Math.floor(Math.random() * messages.length)
        return messages[randomIndex]
    }
}
